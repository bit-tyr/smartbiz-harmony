-- Crear tabla de proyectos
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    laboratory_id UUID REFERENCES laboratories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para proyectos
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Políticas para proyectos
CREATE POLICY "Todos pueden ver proyectos"
    ON projects FOR SELECT
    TO authenticated
    USING (true);

-- Crear enum para estados de solicitud de viaje
CREATE TYPE travel_request_status AS ENUM (
    'pendiente',
    'aprobado_por_gerente',
    'aprobado_por_finanzas',
    'rechazado',
    'completado'
);

-- Crear enum para tipos de gastos
CREATE TYPE travel_expense_type AS ENUM (
    'pasaje_aereo',
    'alojamiento',
    'viaticos',
    'transporte_local',
    'otros'
);

-- Crear tabla de solicitudes de viaje
CREATE TABLE travel_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    laboratory_id UUID REFERENCES laboratories(id) NOT NULL,
    project_id UUID REFERENCES projects(id),
    destination TEXT NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    purpose TEXT NOT NULL,
    status travel_request_status DEFAULT 'pendiente',
    total_estimated_budget DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    manager_id UUID REFERENCES auth.users(id),
    manager_notes TEXT,
    finance_approver_id UUID REFERENCES auth.users(id),
    finance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de gastos de viaje
CREATE TABLE travel_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE NOT NULL,
    expense_type travel_expense_type NOT NULL,
    description TEXT NOT NULL,
    estimated_amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de archivos adjuntos
CREATE TABLE travel_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar políticas de seguridad RLS
ALTER TABLE travel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas para solicitudes de viaje
CREATE POLICY "Usuarios pueden ver sus propias solicitudes"
    ON travel_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propias solicitudes"
    ON travel_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus solicitudes pendientes"
    ON travel_requests FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pendiente')
    WITH CHECK (auth.uid() = user_id AND status = 'pendiente');

-- Políticas para gastos de viaje
CREATE POLICY "Usuarios pueden ver gastos de sus solicitudes"
    ON travel_expenses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM travel_requests
        WHERE travel_requests.id = travel_request_id
        AND travel_requests.user_id = auth.uid()
    ));

CREATE POLICY "Usuarios pueden crear gastos para sus solicitudes"
    ON travel_expenses FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM travel_requests
        WHERE travel_requests.id = travel_request_id
        AND travel_requests.user_id = auth.uid()
        AND travel_requests.status = 'pendiente'
    ));

-- Políticas para archivos adjuntos
CREATE POLICY "Usuarios pueden ver archivos de sus solicitudes"
    ON travel_attachments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM travel_requests
        WHERE travel_requests.id = travel_request_id
        AND travel_requests.user_id = auth.uid()
    ));

CREATE POLICY "Usuarios pueden subir archivos a sus solicitudes"
    ON travel_attachments FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM travel_requests
        WHERE travel_requests.id = travel_request_id
        AND travel_requests.user_id = auth.uid()
        AND travel_requests.status = 'pendiente'
    ));

-- Función para el flujo de aprobación
CREATE OR REPLACE FUNCTION approve_travel_request(
    request_id UUID,
    approver_id UUID,
    notes TEXT DEFAULT NULL
)
RETURNS travel_requests
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request travel_requests;
BEGIN
    SELECT * INTO request
    FROM travel_requests
    WHERE id = request_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Solicitud de viaje no encontrada';
    END IF;

    IF request.status = 'pendiente' THEN
        UPDATE travel_requests
        SET status = 'aprobado_por_gerente',
            manager_id = approver_id,
            manager_notes = notes,
            updated_at = NOW()
        WHERE id = request_id
        RETURNING * INTO request;
    ELSIF request.status = 'aprobado_por_gerente' THEN
        UPDATE travel_requests
        SET status = 'aprobado_por_finanzas',
            finance_approver_id = approver_id,
            finance_notes = notes,
            updated_at = NOW()
        WHERE id = request_id
        RETURNING * INTO request;
    ELSE
        RAISE EXCEPTION 'Estado de solicitud no válido para aprobación';
    END IF;

    RETURN request;
END;
$$;

-- Insertar algunos proyectos de ejemplo
INSERT INTO projects (name, description, laboratory_id) 
SELECT 
    'Proyecto A', 
    'Descripción del Proyecto A', 
    id 
FROM laboratories 
LIMIT 1;

INSERT INTO projects (name, description, laboratory_id)
SELECT 
    'Proyecto B',
    'Descripción del Proyecto B',
    id
FROM laboratories
OFFSET 1 LIMIT 1;

INSERT INTO projects (name, description, laboratory_id)
SELECT 
    'Proyecto C',
    'Descripción del Proyecto C',
    id
FROM laboratories
OFFSET 2 LIMIT 1;
