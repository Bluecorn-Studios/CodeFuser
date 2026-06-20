-- SQL Schema to initialize the projects table in Supabase
-- Paste this script into your Supabase SQL Editor to create the required table and configure access permissions.

CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  selected_package TEXT NOT NULL,
  ownership_choice TEXT NOT NULL,
  industry TEXT,
  custom_industry TEXT,
  goal TEXT,
  custom_goal TEXT,
  has_domain TEXT,
  has_logo TEXT,
  content_ready TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'Assets Pending'
);

-- Enable Row Level Security (RLS) on public.projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create Policies to allow public read/write access (perfect for user submission and Mission Control dashboard)
CREATE POLICY "Enable read access for all users" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.projects
  FOR UPDATE USING (true);
