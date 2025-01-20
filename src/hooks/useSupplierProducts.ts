import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/supabase";

type Product = Database['public']['Tables']['products']['Row'];

export const useSupplierProducts = (supplierId?: string): UseQueryResult<Product[]> => {
  return useQuery({
    queryKey: ['supplier_products', supplierId],
    queryFn: async () => {
      if (!supplierId) return [];

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!supplierId
  });
}; 