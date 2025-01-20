-- Eliminar la estructura anterior en orden correcto
DROP MATERIALIZED VIEW IF EXISTS budget_code_products_mv CASCADE;
DROP TRIGGER IF EXISTS refresh_budget_code_products_mv_trigger ON budget_code_products CASCADE;
DROP FUNCTION IF EXISTS refresh_budget_code_products_mv() CASCADE;
DROP FUNCTION IF EXISTS get_budget_code_product_list(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_budget_code_products(UUID, UUID[]) CASCADE;
DROP TABLE IF EXISTS budget_code_products CASCADE;

-- Crear nueva tabla para productos de proveedores
CREATE TABLE IF NOT EXISTS provider_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider_id, product_id)
);

-- Crear vista materializada para mejor rendimiento
CREATE MATERIALIZED VIEW IF NOT EXISTS provider_products_mv AS
SELECT 
    provider_id,
    array_agg(product_id::text) as product_ids
FROM provider_products
GROUP BY provider_id;

-- Crear índice único
CREATE UNIQUE INDEX IF NOT EXISTS provider_products_mv_idx ON provider_products_mv(provider_id);

-- Función para refrescar la vista materializada
CREATE OR REPLACE FUNCTION refresh_provider_products_mv()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY provider_products_mv;
    RETURN NULL;
END;
$$;

-- Crear trigger para refrescar la vista
CREATE TRIGGER refresh_provider_products_mv_trigger
AFTER INSERT OR UPDATE OR DELETE ON provider_products
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_provider_products_mv();

-- Función para obtener productos de un proveedor
CREATE OR REPLACE FUNCTION get_provider_product_list(p_provider_id UUID)
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
    FROM provider_products
    WHERE provider_id = p_provider_id;
    
    RETURN COALESCE(result, ARRAY[]::TEXT[]);
END;
$$;

-- Función para actualizar productos de un proveedor
CREATE OR REPLACE FUNCTION update_provider_products(
    p_provider_id UUID,
    p_product_ids UUID[]
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Eliminar las relaciones existentes
    DELETE FROM provider_products
    WHERE provider_id = p_provider_id;
    
    -- Insertar las nuevas relaciones
    IF p_product_ids IS NOT NULL AND array_length(p_product_ids, 1) > 0 THEN
        INSERT INTO provider_products (provider_id, product_id)
        SELECT p_provider_id, unnest(p_product_ids);
    END IF;
    
    -- Refrescar la vista materializada
    REFRESH MATERIALIZED VIEW CONCURRENTLY provider_products_mv;
END;
$$;

-- Otorgar permisos
GRANT ALL ON provider_products TO postgres, anon, authenticated, service_role;
GRANT ALL ON provider_products_mv TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_provider_product_list(UUID) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_provider_products(UUID, UUID[]) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION refresh_provider_products_mv() TO postgres, anon, authenticated, service_role;
