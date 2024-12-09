import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PurchaseRequestList } from "@/components/purchases/PurchaseRequestList";
import { CreatePurchaseRequestDialog } from "@/components/purchases/CreatePurchaseRequestDialog";
import { toast } from "sonner";

const Compras = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      
      <div className="bg-white rounded-lg border border-gray-200">
        <PurchaseRequestList 
          requests={purchaseRequests || []} 
          isLoading={isLoading} 
        />
      </div>

      <CreatePurchaseRequestDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  );
};

export default Compras;