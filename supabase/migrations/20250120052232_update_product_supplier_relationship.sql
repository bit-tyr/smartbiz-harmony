-- Función para obtener los productos de un proveedor
CREATE OR REPLACE FUNCTION get_supplier_products(p_supplier_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    code TEXT,
    description TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.code,
        p.description
    FROM products p
    WHERE p.supplier_id = p_supplier_id
    ORDER BY p.name;
END;
$$;

-- Función para actualizar el proveedor de un producto
CREATE OR REPLACE FUNCTION update_product_supplier(
    p_product_id UUID,
    p_supplier_id UUID
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE products
    SET supplier_id = p_supplier_id,
        updated_at = NOW()
    WHERE id = p_product_id;
END;
$$;

-- Función para actualizar múltiples productos de un proveedor
CREATE OR REPLACE FUNCTION update_supplier_products(
    p_supplier_id UUID,
    p_product_ids UUID[]
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Primero, eliminamos la asociación de los productos que ya no estarán asociados
    UPDATE products
    SET supplier_id = NULL,
        updated_at = NOW()
    WHERE supplier_id = p_supplier_id
    AND id != ALL(p_product_ids);
    
    -- Luego, actualizamos los productos que estarán asociados
    IF p_product_ids IS NOT NULL AND array_length(p_product_ids, 1) > 0 THEN
        UPDATE products
        SET supplier_id = p_supplier_id,
            updated_at = NOW()
        WHERE id = ANY(p_product_ids);
    END IF;
END;
$$;

-- Otorgar permisos a las funciones
GRANT EXECUTE ON FUNCTION get_supplier_products(UUID) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_product_supplier(UUID, UUID) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_supplier_products(UUID, UUID[]) TO postgres, anon, authenticated, service_role;
