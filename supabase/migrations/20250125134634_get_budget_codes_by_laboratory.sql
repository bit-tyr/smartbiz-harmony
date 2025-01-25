-- Drop the view if it exists
DROP MATERIALIZED VIEW IF EXISTS laboratory_budget_codes_view;

-- Create materialized view for laboratory budget codes
CREATE MATERIALIZED VIEW laboratory_budget_codes_view AS
SELECT DISTINCT
    lbc.laboratory_id,
    bc.id,
    bc.code,
    bc.description
FROM budget_codes bc
INNER JOIN laboratory_budget_codes lbc ON lbc.budget_code_id = bc.id;

-- Create index for better performance
CREATE INDEX idx_laboratory_budget_codes_view_laboratory_id 
ON laboratory_budget_codes_view(laboratory_id);

-- Grant permissions
GRANT SELECT ON laboratory_budget_codes_view TO authenticated;

-- Create RPC function to get budget codes by laboratory
CREATE OR REPLACE FUNCTION get_laboratory_budget_codes(p_laboratory_id UUID)
RETURNS TABLE (
  id UUID,
  code TEXT,
  description TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    bc.id,
    bc.code,
    bc.description
  FROM budget_codes bc
  INNER JOIN laboratory_budget_codes lbc ON lbc.budget_code_id = bc.id
  WHERE lbc.laboratory_id = p_laboratory_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_laboratory_budget_codes(UUID) TO authenticated;
