import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ShoppingCart } from "lucide-react";
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
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
          laboratory:laboratories(name),
          budget_code:budget_codes(code, description),
          purchase_request_items(
            quantity,
            unit_price,
            currency,
            product:products(
              name,
              supplier:suppliers(name)
            )
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        toast.error("Error al cargar las solicitudes");
        throw error;
      }

      return data;
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("No hay sesión de usuario");
        return;
      }

      // Insertar la solicitud principal
      const { data: purchaseRequest, error: purchaseError } = await supabase
        .from('purchase_requests')
        .insert({
          laboratory_id: values.laboratoryId,
          budget_code_id: values.budgetCodeId,
          observations: values.observations || '',
          status: 'pending',
          user_id: session.user.id
        })
        .select()
        .single();

      if (purchaseError) {
        toast.error("Error al crear la solicitud");
        throw purchaseError;
      }

      // Insertar el item de la solicitud
      const { error: itemError } = await supabase
        .from('purchase_request_items')
        .insert({
          purchase_request_id: purchaseRequest.id,
          product_id: values.productId,
          quantity: Number(values.quantity),
          unit_price: Number(values.unitPrice),
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compras</h1>
          <p className="text-muted-foreground mt-2">Gestión de solicitudes de compra</p>
        </div>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="inbox">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Bandeja de Entrada
          </TabsTrigger>
          <TabsTrigger value="forms">Formularios</TabsTrigger>
          <TabsTrigger value="faq">Preguntas Frecuentes</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Compra</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseRequestList 
                requests={purchaseRequests || []} 
                isLoading={isLoading}
                onSelectRequest={setSelectedRequest}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <CardTitle>Formularios de Solicitudes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showPurchaseForm ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Nueva Solicitud de Compra</h2>
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
                    className="justify-start"
                    onClick={() => setShowPurchaseForm(true)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Compras
                  </Button>
                  <Button variant="outline" className="justify-start">
                    Inscripción
                  </Button>
                  <Button variant="outline" className="justify-start">
                    Pasajes/Viáticos/Alojamiento
                  </Button>
                  <Button variant="outline" className="justify-start">
                    Publicación
                  </Button>
                  <Button variant="outline" className="justify-start">
                    Suscripción
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <FaqTab />
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
};

export default Compras;