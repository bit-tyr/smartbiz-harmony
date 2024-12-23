import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ShoppingCart } from "lucide-react";
import { PurchaseRequestList } from "@/components/purchases/PurchaseRequestList";
import { CreatePurchaseRequestDialog } from "@/components/purchases/CreatePurchaseRequestDialog";
import { PurchaseRequestView } from "@/components/purchases/PurchaseRequestView";
import { FormsTab } from "@/components/purchases/tabs/FormsTab";
import { FaqTab } from "@/components/purchases/tabs/FaqTab";
import { usePurchaseRequests } from "@/hooks/usePurchaseRequests";
import { PurchaseRequest } from "@/components/purchases/types";

const Compras = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  
  const { data: purchaseRequests, isLoading } = usePurchaseRequests();

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
          <FormsTab onNewRequest={() => setIsDialogOpen(true)} />
        </TabsContent>

        <TabsContent value="faq">
          <FaqTab />
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