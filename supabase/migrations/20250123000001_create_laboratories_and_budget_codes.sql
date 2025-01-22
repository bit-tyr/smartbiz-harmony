-- Add budget codes relationship to existing laboratories table
CREATE TABLE IF NOT EXISTS laboratory_budget_codes (
    laboratory_id UUID REFERENCES laboratories(id) ON DELETE CASCADE,
    budget_code_id UUID REFERENCES budget_codes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    PRIMARY KEY (laboratory_id, budget_code_id)
);

-- Create laboratory_users junction table if not exists
CREATE TABLE IF NOT EXISTS laboratory_users (
    laboratory_id UUID REFERENCES laboratories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    PRIMARY KEY (laboratory_id, user_id)
);

-- Add RLS policies
ALTER TABLE laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratory_budget_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratory_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Laboratories are viewable by authenticated users" ON laboratories;
DROP POLICY IF EXISTS "Laboratories are insertable by admin users" ON laboratories;
DROP POLICY IF EXISTS "Laboratories are updatable by admin users" ON laboratories;
DROP POLICY IF EXISTS "Laboratories are deletable by admin users" ON laboratories;
DROP POLICY IF EXISTS "Laboratory budget codes are viewable by authenticated users" ON laboratory_budget_codes;
DROP POLICY IF EXISTS "Laboratory budget codes are insertable by admin users" ON laboratory_budget_codes;
DROP POLICY IF EXISTS "Laboratory budget codes are deletable by admin users" ON laboratory_budget_codes;
DROP POLICY IF EXISTS "Laboratory users are viewable by authenticated users" ON laboratory_users;
DROP POLICY IF EXISTS "Laboratory users are insertable by admin users" ON laboratory_users;
DROP POLICY IF EXISTS "Laboratory users are deletable by admin users" ON laboratory_users;

-- Policies for laboratories
CREATE POLICY "Laboratories are viewable by authenticated users" ON laboratories
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Laboratories are insertable by admin users" ON laboratories
    FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "Laboratories are updatable by admin users" ON laboratories
    FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Laboratories are deletable by admin users" ON laboratories
    FOR DELETE
    TO authenticated
    USING (is_admin());

-- Policies for laboratory_budget_codes
CREATE POLICY "Laboratory budget codes are viewable by authenticated users" ON laboratory_budget_codes
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Laboratory budget codes are insertable by admin users" ON laboratory_budget_codes
    FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "Laboratory budget codes are deletable by admin users" ON laboratory_budget_codes
    FOR DELETE
    TO authenticated
    USING (is_admin());

-- Policies for laboratory_users
CREATE POLICY "Laboratory users are viewable by authenticated users" ON laboratory_users
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Laboratory users are insertable by admin users" ON laboratory_users
    FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "Laboratory users are deletable by admin users" ON laboratory_users
    FOR DELETE
    TO authenticated
    USING (is_admin());

-- Drop view if exists and recreate
DROP VIEW IF EXISTS user_laboratory_budget_codes;

CREATE VIEW user_laboratory_budget_codes AS
SELECT DISTINCT
    u.id as user_id,
    bc.id as budget_code_id,
    bc.code,
    bc.description
FROM auth.users u
JOIN laboratory_users lu ON lu.user_id = u.id
JOIN laboratory_budget_codes lbc ON lbc.laboratory_id = lu.laboratory_id
JOIN budget_codes bc ON bc.id = lbc.budget_code_id;

-- Grant permissions on the view
GRANT SELECT ON user_laboratory_budget_codes TO authenticated; 