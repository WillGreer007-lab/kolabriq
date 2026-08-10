ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS cookie_window_days INTEGER DEFAULT 30;
