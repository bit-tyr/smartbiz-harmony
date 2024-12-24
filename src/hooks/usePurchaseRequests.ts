import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PurchaseRequest } from "@/components/purchases/types";

export const usePurchaseRequests = () => {
  return useQuery({
    queryKey: ['purchaseRequests'],
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

        const { data, error } = await supabase
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

        if (error) {
          console.error('Error fetching purchase requests:', error);
          toast.error("Error al cargar las solicitudes");
          throw error;
        }

        return data as unknown as PurchaseRequest[];
      } catch (error) {
        console.error('Error fetching purchase requests:', error);
        throw error;
      }
    },
  });
};