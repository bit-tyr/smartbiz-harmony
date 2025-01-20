-- Otorgar permisos a la vista materializada
ALTER MATERIALIZED VIEW budget_code_products_mv OWNER TO postgres;
GRANT ALL ON budget_code_products_mv TO postgres, anon, authenticated, service_role;

-- Otorgar permisos para refrescar la vista materializada
GRANT ALL ON budget_code_products TO postgres, anon, authenticated, service_role;

-- Asegurar que el trigger tenga los permisos correctos
ALTER FUNCTION refresh_budget_code_products_mv() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION refresh_budget_code_products_mv() TO postgres, anon, authenticated, service_role;

-- Asegurar que las funciones relacionadas tengan los permisos correctos
ALTER FUNCTION get_budget_code_product_list(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION get_budget_code_product_list(UUID) TO postgres, anon, authenticated, service_role;

ALTER FUNCTION update_budget_code_products(UUID, UUID[]) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION update_budget_code_products(UUID, UUID[]) TO postgres, anon, authenticated, service_role;
