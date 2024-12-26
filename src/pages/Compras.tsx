import { useState } from "react";
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

const Compras = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<'current' | 'history'>('current');
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

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
          purchase_request_id: purchaseRequest.id,
          product_id: values.productId,
          quantity: parseInt(values.quantity.toString()),
          unit_price: parseFloat(values.unitPrice.toString()),
          currency: values.currency
        });

      if (itemError) {
        toast.error("Error al crear el item de la solicitud");
        throw itemError;
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
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 rounded-lg">
        <div>
          <h1 className="text-3xl font-bold text-primary">Sistema de Compras</h1>
          <p className="text-muted-foreground mt-2">Gestión integral de solicitudes y procesos de compra</p>
        </div>
        <Button 
          onClick={() => setShowPurchaseForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="mb-4 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="inbox" className="data-[state=active]:bg-background">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Bandeja de Entrada
          </TabsTrigger>
          <TabsTrigger value="forms" className="data-[state=active]:bg-background">
            <FileText className="h-4 w-4 mr-2" />
            Formularios
          </TabsTrigger>
          <TabsTrigger value="faq" className="data-[state=active]:bg-background">
            <BookOpen className="h-4 w-4 mr-2" />
            Ayuda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-muted/30 rounded-t-lg">
              <CardTitle className="text-xl flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
                Solicitudes de Compra
              </CardTitle>
              <CardDescription>
                Gestiona y monitorea todas tus solicitudes de compra
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PurchaseRequestList 
                requests={purchaseRequests || []} 
                isLoading={isLoading}
                onSelectRequest={setSelectedRequest}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-muted/30 rounded-t-lg">
              <CardTitle className="text-xl flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Formularios de Solicitudes
              </CardTitle>
              <CardDescription>
                Selecciona el tipo de solicitud que deseas realizar
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {showPurchaseForm ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-primary">Nueva Solicitud de Compra</h2>
                    <Button variant="outline" onClick={() => setShowPurchaseForm(false)}>
                      Volver
                    </Button>
                  </div>
                  <PurchaseRequestForm
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => setShowPurchaseForm(false)}
                  />
                </div>
              ) : (
                <div className="grid gap-4">
                  <Button 
                    variant="outline" 
                    className="justify-start hover:bg-primary/5 hover:text-primary transition-colors"
                    onClick={() => setShowPurchaseForm(true)}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Solicitud de Compra
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Inscripción a Evento/Curso
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <Plane className="h-5 w-5 mr-2" />
                    Pasajes/Viáticos/Alojamiento
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Publicación Académica
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Suscripción
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-muted/30 rounded-t-lg">
              <CardTitle className="text-xl flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary" />
                Preguntas Frecuentes
              </CardTitle>
              <CardDescription>
                Encuentra respuestas a las preguntas más comunes
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FaqTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedRequest && (
        <PurchaseRequestView 
          request={selectedRequest} 
          onClose={() => setSelectedRequest(null)} 
        />
      )}
    </div>
  );
}

export default Compras;