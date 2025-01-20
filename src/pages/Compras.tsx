import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, ShoppingCart, FileText, Plane, BookOpen, CreditCard } from "lucide-react";
import { PurchaseRequestList } from "@/components/purchases/PurchaseRequestList";
import { PurchaseRequestForm, FormValues } from "@/components/purchases/PurchaseRequestForm";
import { toast } from "sonner";
import { CreatePurchaseRequestDialog } from "@/components/purchases/CreatePurchaseRequestDialog";
import { PurchaseRequestView } from "@/components/purchases/PurchaseRequestView";
import { FormsTab } from "@/components/purchases/tabs/FormsTab";
import { FaqTab } from "@/components/purchases/tabs/FaqTab";
import { usePurchaseRequests } from "@/hooks/usePurchaseRequests";
import { PurchaseRequest } from "@/components/purchases/types";
import { TravelRequest } from "@/components/travel/types";
import { AttachmentSection } from "@/components/purchases/form-sections/AttachmentSection";
import { sanitizeFileName } from "@/components/purchases/form-sections/AttachmentSection";
import { CreateTravelRequestDialog } from "@/components/travel/CreateTravelRequestDialog";
import { TravelRequestList } from "@/components/travel/TravelRequestList";
import { motion, AnimatePresence } from "framer-motion";

const Compras = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<'current' | 'history'>('current');
  const [selectedPurchaseRequest, setSelectedPurchaseRequest] = useState<PurchaseRequest | null>(null);
  const [selectedTravelRequest, setSelectedTravelRequest] = useState<TravelRequest | null>(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const [tempRequestId, setTempRequestId] = useState<string | null>(null);
  const [showTravelForm, setShowTravelForm] = useState(false);

  useEffect(() => {
    if (showPurchaseForm && !tempRequestId) {
      setTempRequestId(crypto.randomUUID());
    }
    if (!showPurchaseForm) {
      setTempRequestId(null);
    }
  }, [showPurchaseForm]);

  const { data: purchaseRequests, isLoading } = useQuery({
    queryKey: ['purchaseRequests', currentView],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error de sesión:', sessionError);
          toast.error("Error al verificar la sesión");
          throw sessionError;
        }

        if (!session?.user) {
          toast.error("Usuario no autenticado");
          throw new Error("No authenticated user");
        }

        const query = supabase
          .from('purchase_requests')
          .select(`
            *,
            laboratory:laboratories(id, name),
            budget_code:budget_codes(id, code, description),
            profiles!purchase_requests_creator_id_fkey(first_name, last_name),
            purchase_request_items(
              id,
              quantity,
              unit_price,
              currency,
              product:products(
                id,
                name,
                supplier:suppliers(
                  id,
                  name
                )
              )
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
          console.error('Error al cargar las solicitudes:', error);
          toast.error(`Error al cargar las solicitudes: ${error.message}`);
          throw error;
        }

        if (!data) {
          return [];
        }

        return data;
      } catch (error) {
        console.error('Error inesperado:', error);
        toast.error("Error inesperado al cargar las solicitudes");
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const handleSubmit = async (values: FormValues) => {
    if (!tempRequestId) return;
    try {
      setIsSubmitting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("No hay sesión de usuario");
        return;
      }

      const { data: purchaseRequest, error: purchaseError } = await supabase
        .from('purchase_requests')
        .insert({
          id: tempRequestId,
          laboratory_id: values.laboratoryId,
          budget_code_id: values.budgetCodeId,
          observations: values.observations || null,
          status: 'pending',
          user_id: session.user.id
        })
        .select()
        .single();

      if (purchaseError) {
        toast.error("Error al crear la solicitud");
        throw purchaseError;
      }

      const { error: itemError } = await supabase
        .from('purchase_request_items')
        .insert({
          purchase_request_id: tempRequestId,
          product_id: values.productId,
          quantity: parseInt(values.quantity.toString()),
          unit_price: parseFloat(values.unitPrice.toString()),
          currency: values.currency
        });

      if (itemError) {
        await supabase
          .from('purchase_requests')
          .delete()
          .eq('id', tempRequestId);
        
        toast.error("Error al crear el item de la solicitud");
        throw itemError;
      }

      const selectedFiles = values.files || [];
      for (const file of selectedFiles) {
        const sanitizedName = sanitizeFileName(file.name);
        const filePath = `${tempRequestId}/${sanitizedName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('purchase-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error al subir archivo:', uploadError);
          toast.error(`Error al subir ${file.name}`);
          continue;
        }

        const { error: dbError } = await supabase
          .from('purchase_request_attachments')
          .insert({
            purchase_request_id: tempRequestId,
            file_name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            file_type: file.type
          });

        if (dbError) {
          console.error('Error al guardar registro de archivo:', dbError);
          toast.error(`Error al registrar ${file.name}`);
          
          await supabase.storage
            .from('purchase-attachments')
            .remove([uploadData.path]);
        } else {
          toast.success(`${file.name} adjuntado exitosamente`);
        }
      }

      toast.success("Solicitud creada exitosamente");
      await queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
      setShowPurchaseForm(false);
    } catch (error) {
      console.error('Error al crear la solicitud:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-6 max-w-7xl"
    >
      <div className="flex flex-col space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold text-primary"
            >
              Sistema de Compras
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground mt-2"
            >
              Gestiona tus solicitudes de compra y viajes de manera eficiente
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <Tabs defaultValue="purchases" className="w-full">
                <TabsList className="grid w-full grid-cols-4 rounded-lg bg-muted p-1">
                  {[
                    { value: "purchases", icon: ShoppingCart, label: "Compras" },
                    { value: "travel", icon: Plane, label: "Viajes" },
                    { value: "forms", icon: FileText, label: "Formularios" },
                    { value: "faq", icon: BookOpen, label: "FAQ" }
                  ].map((tab) => (
                    <motion.div
                      key={tab.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <TabsTrigger value={tab.value} className="data-[state=active]:bg-white">
                        <tab.icon className="mr-2 h-4 w-4" />
                        {tab.label}
                      </TabsTrigger>
                    </motion.div>
                  ))}
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="purchases" className="mt-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                          {["current", "history"].map((view) => (
                            <motion.div
                              key={view}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant={currentView === view ? 'default' : 'outline'}
                                onClick={() => setCurrentView(view as 'current' | 'history')}
                              >
                                {view === 'current' ? 'Actuales' : 'Historial'}
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      <PurchaseRequestList
                        searchQuery={searchQuery}
                        onSelect={setSelectedPurchaseRequest}
                        view={currentView}
                        onSearchChange={setSearchQuery}
                      />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="travel">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className="border-none shadow-md">
                        <CardHeader className="bg-muted/30 rounded-t-lg">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <CardTitle className="text-xl flex items-center">
                              <Plane className="h-5 w-5 mr-2 text-primary" />
                              Solicitudes de Viajes y Viáticos
                            </CardTitle>
                            <CardDescription>
                              Gestiona y monitorea todas tus solicitudes de viajes
                            </CardDescription>
                          </motion.div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <TravelRequestList onSelectRequest={setSelectedTravelRequest} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="forms">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className="border-none shadow-md">
                        <CardHeader className="bg-muted/30 rounded-t-lg">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <CardTitle className="text-xl flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-primary" />
                              Formularios de Solicitudes
                            </CardTitle>
                            <CardDescription>
                              Selecciona el tipo de solicitud que deseas realizar
                            </CardDescription>
                          </motion.div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          {showPurchaseForm ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="space-y-6"
                            >
                              <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex justify-between items-center"
                              >
                                <motion.h2 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-2xl font-semibold text-primary"
                                >
                                  Nueva Solicitud de Compra
                                </motion.h2>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button variant="outline" onClick={() => setShowPurchaseForm(false)}>
                                    Volver
                                  </Button>
                                </motion.div>
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                <PurchaseRequestForm
                                  onSubmit={handleSubmit}
                                  isSubmitting={isSubmitting}
                                  onCancel={() => setShowPurchaseForm(false)}
                                  purchaseRequestId={tempRequestId || undefined}
                                />
                              </motion.div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="grid gap-4"
                            >
                              {[
                                {
                                  icon: ShoppingCart,
                                  label: "Solicitud de Compra",
                                  onClick: () => setShowPurchaseForm(true)
                                },
                                {
                                  icon: Plane,
                                  label: "Pasajes/Viáticos/Alojamiento",
                                  onClick: () => setShowTravelForm(true)
                                },
                                {
                                  icon: CreditCard,
                                  label: "Inscripción a Evento/Curso"
                                },
                                {
                                  icon: FileText,
                                  label: "Publicación Académica"
                                },
                                {
                                  icon: BookOpen,
                                  label: "Suscripción"
                                }
                              ].map((item, index) => (
                                <motion.div
                                  key={item.label}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ 
                                    scale: 1.02,
                                    backgroundColor: "var(--primary-5)",
                                    transition: { duration: 0.2 }
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Button 
                                    variant="outline" 
                                    className="w-full justify-start hover:bg-primary/5 hover:text-primary transition-all"
                                    onClick={item.onClick}
                                  >
                                    <item.icon className="h-5 w-5 mr-2" />
                                    {item.label}
                                  </Button>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </CardHeader>
          </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedPurchaseRequest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <PurchaseRequestView 
              request={selectedPurchaseRequest} 
              onClose={() => setSelectedPurchaseRequest(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showTravelForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <CreateTravelRequestDialog
            open={showTravelForm}
            onOpenChange={setShowTravelForm}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

export default Compras;