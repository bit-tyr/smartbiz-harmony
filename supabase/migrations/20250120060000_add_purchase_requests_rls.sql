-- Habilitar RLS en la tabla purchase_requests
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;

-- Permitir lectura a todos los usuarios autenticados
CREATE POLICY "Allow read access for all authenticated users" 
ON purchase_requests FOR SELECT 
TO authenticated 
USING (true);

-- Permitir a los usuarios crear sus propias solicitudes
CREATE POLICY "Allow users to create their own requests" 
ON purchase_requests FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Permitir a los usuarios actualizar sus propias solicitudes (si no están eliminadas)
CREATE POLICY "Allow users to update their own requests" 
ON purchase_requests FOR UPDATE 
TO authenticated 
USING (
    auth.uid() = user_id 
    AND deleted_at IS NULL
);

-- Permitir a admin, manager y Purchases actualizar cualquier solicitud
CREATE POLICY "Allow admin, manager and Purchases to update any request" 
ON purchase_requests FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND (
            EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
            OR p.roles->>'name' IN ('manager', 'Purchases')
        )
    )
);

-- Permitir a los usuarios eliminar sus propias solicitudes (mover al histórico)
CREATE POLICY "Allow users to delete their own requests" 
ON purchase_requests FOR DELETE 
TO authenticated 
USING (
    auth.uid() = user_id 
    AND deleted_at IS NULL
);

-- Permitir a admin, manager y Purchases eliminar cualquier solicitud
CREATE POLICY "Allow admin, manager and Purchases to delete any request" 
ON purchase_requests FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND (
            EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
            OR p.roles->>'name' IN ('manager', 'Purchases')
        )
    )
); 