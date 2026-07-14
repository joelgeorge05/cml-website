-- SQL script to create the activity_logs table in Supabase
-- Please copy and paste this into the Supabase SQL Editor and click 'Run'.

CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for logs"
ON activity_logs
FOR SELECT
TO public
USING (true);

-- The backend server.ts will insert using the service_role key, bypassing RLS.
