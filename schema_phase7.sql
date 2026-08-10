-- Phase 7: RBAC and Team Members Schema Update

-- 1. Create a permissions ENUM if not using strings, but strings are fine.
-- Let's create the business_members table for team management.
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- Enable RLS
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

-- 2. Create permissions table for granular overrides
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  is_granted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, permission_key)
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for business_members
-- Business owner can manage members
CREATE POLICY "Business owners can manage members" ON public.business_members
  FOR ALL USING (
    auth.uid() = business_id OR 
    auth.uid() IN (SELECT user_id FROM public.business_members WHERE business_id = public.business_members.business_id AND role IN ('owner', 'admin'))
  );

-- Admins can manage all RBAC (via service role or super admin)
CREATE POLICY "Admins have full access to business_members" ON public.business_members
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.users WHERE raw_user_meta_data->>'is_admin' = 'true')
  );

-- Note: In a production environment, you would run this via the Supabase Dashboard SQL editor.
