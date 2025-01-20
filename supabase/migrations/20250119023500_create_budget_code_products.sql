DROP MATERIALIZED VIEW IF EXISTS budget_code_products_mv;

CREATE MATERIALIZED VIEW budget_code_products_mv AS
SELECT 
    budget_code_id,
    array_agg(product_id::text) as product_ids
FROM budget_code_products
GROUP BY budget_code_id;

CREATE UNIQUE INDEX budget_code_products_mv_idx ON budget_code_products_mv(budget_code_id);

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_budget_code_products_mv()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW budget_code_products_mv;
    RETURN NULL;
END;
$$;

-- Create a trigger to refresh the materialized view
CREATE TRIGGER refresh_budget_code_products_mv_trigger
AFTER INSERT OR UPDATE OR DELETE ON budget_code_products
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_budget_code_products_mv();

-- Función para obtener los productos asociados a un código de presupuesto
CREATE OR REPLACE FUNCTION get_budget_code_product_list(p_budget_code_id UUID)
RETURNS TEXT[] AS $$
BEGIN
  RETURN (
    SELECT array_agg(product_id::TEXT)
    FROM budget_code_products
    WHERE budget_code_id = p_budget_code_id
  );
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