ALTER TABLE purchase_requests
DROP COLUMN IF EXISTS account_holder,
DROP COLUMN IF EXISTS account_number,
DROP COLUMN IF EXISTS bank;
