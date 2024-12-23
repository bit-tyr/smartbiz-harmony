import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Plus, Search, ShoppingCart, History } from "lucide-react";
import { PurchaseRequestList } from "@/components/purchases/PurchaseRequestList";
import { CreatePurchaseRequestDialog } from "@/components/purchases/CreatePurchaseRequestDialog";
import { toast } from "sonner";
import { PurchaseRequestView } from "@/components/purchases/PurchaseRequestView";

const Compras = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<'current' | 'history'>('current');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { data: purchaseRequests, isLoading } = useQuery({
    queryKey: ['purchaseRequests', currentView],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          toast.error("Error al verificar la sesión");
          throw sessionError;
        }

        if (!session?.user) {
          toast.error("Usuario no autenticado");
          throw new Error("No authenticated user");
        }

        // First, check if user is in purchases group or is admin
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        const { data: purchasesGroup } = await supabase
          .from('user_groups')
          .select('group_id')
          .eq('user_id', session.user.id)
          .eq('group:groups(name)', 'purchases')
          .single();

        // Build the query based on user permissions
        let query = supabase
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
          .order('created_at', { ascending: false });

        // If user is not admin or in purchases group, only show their requests
        if (!userProfile?.is_admin && !purchasesGroup) {
          query = query.eq('user_id', session.user.id);
        }

        const { data, error } = await query;

        if (error) {
          toast.error("Error al cargar las solicitudes");
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Error fetching purchase requests:', error);
        toast.error("Error al cargar las solicitudes");
        throw error;
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compras</h1>
          <p className="text-muted-foreground mt-2">Gestión de solicitudes de compra</p>
        </div>
        
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </Button>
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
              <div className="flex justify-between items-center">
                <CardTitle>Solicitudes de Compra</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar solicitud..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <Button 
                  variant={currentView === 'current' ? "default" : "outline"}
                  onClick={() => setCurrentView('current')}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Solicitudes Actuales
                </Button>
                <Button 
                  variant={currentView === 'history' ? "default" : "outline"}
                  onClick={() => setCurrentView('history')}
                >
                  <History className="h-4 w-4 mr-2" />
                  Histórico
                </Button>
              </div>
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
              <div className="grid gap-4">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => setIsDialogOpen(true)}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Preguntas Frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pregunta..."
                  className="pl-8 mb-4"
                />
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  No hay preguntas frecuentes disponibles en este momento.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreatePurchaseRequestDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />

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