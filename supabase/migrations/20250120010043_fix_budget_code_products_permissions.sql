-- Otorgar permisos a la vista materializada
GRANT ALL ON budget_code_products_mv TO postgres, anon, authenticated, service_role;

-- Otorgar permisos a las funciones
GRANT EXECUTE ON FUNCTION get_budget_code_product_list TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_budget_code_products TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION refresh_budget_code_products_mv TO postgres, anon, authenticated, service_role;

-- Otorgar permisos a la tabla
GRANT ALL ON budget_code_products TO postgres, anon, authenticated, service_role;
