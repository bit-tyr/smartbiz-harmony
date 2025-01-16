INSERT INTO admin_users (user_id, created_at)
VALUES ('a5b31033-2de4-464a-907f-e545fa7146cd', NOW())
ON CONFLICT (user_id) DO NOTHING;
