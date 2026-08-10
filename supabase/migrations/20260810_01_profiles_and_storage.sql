-- Create business profiles table
CREATE TABLE public.business_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT,
  website_url TEXT,
  industry TEXT,
  total_spend DECIMAL(10,2) DEFAULT 0.00,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create creator profiles table
CREATE TABLE public.creator_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  niche_categories TEXT[],
  social_links JSONB DEFAULT '{}'::jsonb,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for business profiles
CREATE POLICY "Public business profiles are viewable by everyone."
  ON public.business_profiles FOR SELECT USING ( true );
CREATE POLICY "Businesses can insert their own profile."
  ON public.business_profiles FOR INSERT WITH CHECK ( auth.uid() = id );
CREATE POLICY "Businesses can update own profile."
  ON public.business_profiles FOR UPDATE USING ( auth.uid() = id );

-- Policies for creator profiles
CREATE POLICY "Public creator profiles are viewable by everyone."
  ON public.creator_profiles FOR SELECT USING ( true );
CREATE POLICY "Creators can insert their own profile."
  ON public.creator_profiles FOR INSERT WITH CHECK ( auth.uid() = id );
CREATE POLICY "Creators can update own profile."
  ON public.creator_profiles FOR UPDATE USING ( auth.uid() = id );

-- Update trigger function to handle specific roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role_val TEXT;
BEGIN
  user_role_val := new.raw_user_meta_data->>'role';
  
  -- Insert into the unified public profiles table (created in previous migration)
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    (user_role_val)::user_role
  );

  -- Insert into specific role tables
  IF user_role_val = 'business' THEN
    INSERT INTO public.business_profiles (id, company_name)
    VALUES (new.id, new.raw_user_meta_data->>'full_name');
  ELSIF user_role_val = 'creator' THEN
    INSERT INTO public.creator_profiles (id)
    VALUES (new.id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage setup for brand_assets
INSERT INTO storage.buckets (id, name, public) VALUES ('brand_assets', 'brand_assets', true);

CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'brand_assets' );

CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'brand_assets' );
