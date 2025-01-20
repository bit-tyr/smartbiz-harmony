-- Función para obtener los productos asociados a un código de presupuesto
CREATE OR REPLACE FUNCTION get_budget_code_products(p_budget_code_id UUID)
RETURNS TABLE (product_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT bcp.product_id
  FROM budget_code_products bcp
  WHERE bcp.budget_code_id = p_budget_code_id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar los productos asociados a un código de presupuesto
CREATE OR REPLACE FUNCTION update_budget_code_products(
  p_budget_code_id UUID,
  p_product_ids UUID[]
) RETURNS void AS $$
BEGIN
  -- Eliminar las relaciones existentes
  DELETE FROM budget_code_products
  WHERE budget_code_id = p_budget_code_id;
  
  -- Insertar las nuevas relaciones
  IF array_length(p_product_ids, 1) > 0 THEN
    INSERT INTO budget_code_products (budget_code_id, product_id)
    SELECT p_budget_code_id, unnest(p_product_ids);
  END IF;
END;
$$ LANGUAGE plpgsql;
