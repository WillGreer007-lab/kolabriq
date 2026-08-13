-- Add attachment_url to messages table
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS attachment_url TEXT;
