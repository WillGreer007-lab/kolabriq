-- Add username to unified profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add reputation and account status to business_profiles
ALTER TABLE public.business_profiles 
  ADD COLUMN IF NOT EXISTS strikes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned')),
  ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS pixel_status TEXT DEFAULT 'offline' CHECK (pixel_status IN ('online', 'offline')),
  ADD COLUMN IF NOT EXISTS last_pixel_ping_at TIMESTAMP WITH TIME ZONE;

-- Add reputation and account status to creator_profiles
ALTER TABLE public.creator_profiles 
  ADD COLUMN IF NOT EXISTS strikes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned')),
  ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00;
