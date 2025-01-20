-- Eliminar objetos existentes
DROP TRIGGER IF EXISTS refresh_budget_code_products_mv_trigger ON budget_code_products;
DROP FUNCTION IF EXISTS refresh_budget_code_products_mv();
DROP MATERIALIZED VIEW IF EXISTS budget_code_products_mv;

-- Recrear la vista materializada
CREATE MATERIALIZED VIEW IF NOT EXISTS budget_code_products_mv AS
SELECT 
    budget_code_id,
    array_agg(product_id::text) as product_ids
FROM budget_code_products
GROUP BY budget_code_id;

-- Crear índice único
CREATE UNIQUE INDEX IF NOT EXISTS budget_code_products_mv_idx ON budget_code_products_mv(budget_code_id);

-- Recrear función de actualización
CREATE OR REPLACE FUNCTION refresh_budget_code_products_mv()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW budget_code_products_mv;
    RETURN NULL;
END;
$$;

-- Recrear trigger
CREATE TRIGGER refresh_budget_code_products_mv_trigger
AFTER INSERT OR UPDATE OR DELETE ON budget_code_products
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_budget_code_products_mv();

-- Otorgar permisos
GRANT ALL ON budget_code_products_mv TO postgres, anon, authenticated, service_role;

-- Actualizar función get_budget_code_product_list
CREATE OR REPLACE FUNCTION get_budget_code_product_list(p_budget_code_id UUID)
RETURNS TEXT[]
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    result TEXT[];
BEGIN
    SELECT array_agg(product_id::TEXT)
    INTO result
    FROM budget_code_products
    WHERE budget_code_id = p_budget_code_id;
    
    RETURN COALESCE(result, ARRAY[]::TEXT[]);
END;
$$;

-- Actualizar función update_budget_code_products
CREATE OR REPLACE FUNCTION update_budget_code_products(
    p_budget_code_id UUID,
    p_product_ids UUID[]
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Eliminar las relaciones existentes
    DELETE FROM budget_code_products
    WHERE budget_code_id = p_budget_code_id;
    
    -- Insertar las nuevas relaciones
    IF p_product_ids IS NOT NULL AND array_length(p_product_ids, 1) > 0 THEN
        INSERT INTO budget_code_products (budget_code_id, product_id)
        SELECT p_budget_code_id, unnest(p_product_ids);
    END IF;
END;
$$;

-- Otorgar permisos a las funciones
GRANT EXECUTE ON FUNCTION get_budget_code_product_list(UUID) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_budget_code_products(UUID, UUID[]) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION refresh_budget_code_products_mv() TO postgres, anon, authenticated, service_role;
