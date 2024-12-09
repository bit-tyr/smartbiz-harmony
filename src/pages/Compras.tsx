import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Plus, Search, ShoppingCart } from "lucide-react";
import { PurchaseRequestList } from "@/components/purchases/PurchaseRequestList";
import { CreatePurchaseRequestDialog } from "@/components/purchases/CreatePurchaseRequestDialog";
import { toast } from "sonner";

const Compras = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: purchaseRequests, isLoading } = useQuery({
    queryKey: ['purchaseRequests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select(`
          *,
          laboratory:laboratories(name),
          budget_code:budget_codes(code, description)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Error al cargar las solicitudes");
        throw error;
      }

      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compras</h1>
          <p className="text-gray-600 mt-2">Gestión de solicitudes de compra</p>
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
              <PurchaseRequestList 
                requests={purchaseRequests || []} 
                isLoading={isLoading} 
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
                <Button variant="outline" className="justify-start">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Compras (Ver Histórico)
                </Button>
                <Button variant="outline" className="justify-start">
                  Inscripción (Ver Histórico)
                </Button>
                <Button variant="outline" className="justify-start">
                  Pasajes/Viáticos/Alojamiento (Ver Histórico)
                </Button>
                <Button variant="outline" className="justify-start">
                  Publicación (Ver Histórico)
                </Button>
                <Button variant="outline" className="justify-start">
                  Suscripción (Ver Histórico)
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
    </div>
  );
};

export default Compras;