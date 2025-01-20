-- Create the budget_code_products table
CREATE TABLE budget_code_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    budget_code_id UUID NOT NULL REFERENCES budget_codes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(budget_code_id, product_id)
);

-- Add indexes for better performance
CREATE INDEX idx_budget_code_products_budget_code_id ON budget_code_products(budget_code_id);
CREATE INDEX idx_budget_code_products_product_id ON budget_code_products(product_id);

-- Add RLS policies
ALTER TABLE budget_code_products ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access for all authenticated users" 
ON budget_code_products FOR SELECT 
TO authenticated 
USING (true);

-- Allow insert/update/delete access only to admin users
CREATE POLICY "Allow full access to admin users" 
ON budget_code_products FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.user_id = auth.uid()
    )
);

DROP MATERIALIZED VIEW IF EXISTS budget_code_products_mv;
CREATE MATERIALIZED VIEW budget_code_products_mv AS
SELECT 
    budget_code_id,
    product_id
FROM budget_code_products;

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

-- Create RPC function to get budget code products
CREATE OR REPLACE FUNCTION get_budget_code_products(p_budget_code_id UUID)
RETURNS TABLE (product_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT bcp.product_id
    FROM budget_code_products bcp
    WHERE bcp.budget_code_id = p_budget_code_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_budget_code_products(
  p_budget_code_id UUID,
  p_product_ids UUID[]
) RETURNS VOID AS $$
BEGIN
  INSERT INTO budget_code_products (budget_code_id, product_id)
  SELECT p_budget_code_id, unnest(p_product_ids);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_budget_code_product_list(p_budget_code_id UUID)
RETURNS SETOF TEXT AS $$
BEGIN
    RETURN QUERY
    SELECT product_id::TEXT
    FROM budget_code_products
    WHERE budget_code_id = p_budget_code_id;
END;
$$ LANGUAGE plpgsql; 