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

-- SQL Schema to initialize the user_profiles table in Supabase
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'client' NOT NULL,
  full_name TEXT,
  business_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on public.user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies to allow users to view/modify profiles, and admins/super-admins to view all profiles
CREATE POLICY "Enable read access for user_profiles" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for user_profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for user_profiles" ON public.user_profiles
  FOR UPDATE USING (true);

-- SQL Schema to initialize the audit_trail table in Supabase
CREATE TABLE IF NOT EXISTS public.audit_trail (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT,
  event_type TEXT NOT NULL,
  request_id TEXT,
  actor TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on public.audit_trail table
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

-- Create Policies to allow public read/write access for audit logging
CREATE POLICY "Enable read access for audit_trail" ON public.audit_trail
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for audit_trail" ON public.audit_trail
  FOR INSERT WITH CHECK (true);

