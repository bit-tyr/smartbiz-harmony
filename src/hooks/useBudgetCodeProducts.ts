import { useCallback, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export const useBudgetCodeProducts = (budgetCodeId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProducts = useCallback(async () => {
    if (!budgetCodeId) return [];
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_budget_code_product_list', {
          p_budget_code_id: budgetCodeId
        });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error al obtener productos:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener productos');
      return [];
    } finally {
      setLoading(false);
    }
  }, [budgetCodeId]);

  const updateProducts = useCallback(async (productIds: string[]) => {
    if (!budgetCodeId) return false;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .rpc('update_budget_code_products', {
          p_budget_code_id: budgetCodeId,
          p_product_ids: productIds
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error al actualizar productos:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar productos');
      return false;
    } finally {
      setLoading(false);
    }
  }, [budgetCodeId]);

  return {
    getProducts,
    updateProducts,
    loading,
    error
  };
}; 