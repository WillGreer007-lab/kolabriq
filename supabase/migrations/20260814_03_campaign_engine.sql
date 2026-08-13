-- Phase 3: Campaign Engine and Deliverables

-- 1. Extend campaigns table
ALTER TABLE public.campaigns
  ADD COLUMN attribution_days INTEGER DEFAULT 14 CHECK (attribution_days >= 1 AND attribution_days <= 30),
  ADD COLUMN pixel_status TEXT DEFAULT 'active',
  ADD COLUMN last_pixel_ping_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  ADD COLUMN offline_warning_sent_at TIMESTAMP WITH TIME ZONE;

-- 2. Create deliverables table (the Lock-and-Key sequential grid)
CREATE TABLE public.deliverables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_number INTEGER NOT NULL,
  required_hashtag TEXT NOT NULL,
  deadline_date TIMESTAMP WITH TIME ZONE NOT NULL,
  warning_sent_at TIMESTAMP WITH TIME ZONE,
  submitted_url TEXT,
  business_approved BOOLEAN DEFAULT FALSE NOT NULL,
  tracking_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- Creators can view their own deliverables
CREATE POLICY "Creators can view their assigned deliverables"
  ON public.deliverables FOR SELECT
  USING (auth.uid() = creator_id);

-- Creators can update their assigned deliverables (e.g. submit URL)
CREATE POLICY "Creators can update submitted URL"
  ON public.deliverables FOR UPDATE
  USING (auth.uid() = creator_id);

-- Businesses can view deliverables for their campaigns
CREATE POLICY "Businesses can view deliverables for their campaigns"
  ON public.deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = deliverables.campaign_id
      AND campaigns.business_id = auth.uid()
    )
  );

-- Businesses can insert deliverables when creating campaigns
CREATE POLICY "Businesses can insert deliverables"
  ON public.deliverables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = deliverables.campaign_id
      AND campaigns.business_id = auth.uid()
    )
  );

-- Businesses can update deliverables (approve them)
CREATE POLICY "Businesses can update deliverables"
  ON public.deliverables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = deliverables.campaign_id
      AND campaigns.business_id = auth.uid()
    )
  );

-- 3. pg_cron Setup for Strict Accountability
-- Note: Requires pg_cron extension to be enabled in Supabase dashboard

-- Enable pg_cron (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Cron Job 1: 12-Hour Pixel Penalty (Runs every 30 mins)
-- If pixel hasn't pinged in 12 hours, set to offline. Warning email would be sent by another service listening to this state change.
SELECT cron.schedule(
  'pixel-heartbeat-check',
  '*/30 * * * *',
  $$
    UPDATE public.campaigns 
    SET pixel_status = 'offline'
    WHERE last_pixel_ping_at < NOW() - INTERVAL '12 hours'
    AND status = 'active';
  $$
);

-- Cron Job 2: 1-Hour Kicks (Runs every 5 mins)
-- Identifies overdue deliverables and auto-kicks the creator if warning was sent >1 hour ago.
SELECT cron.schedule(
  'deliverable-deadline-kicks',
  '*/5 * * * *',
  $$
    -- We simply remove the creator assignment if 60 mins have passed since warning
    UPDATE public.deliverables
    SET creator_id = NULL, submitted_url = NULL, warning_sent_at = NULL
    WHERE warning_sent_at < NOW() - INTERVAL '1 hour'
    AND submitted_url IS NULL;
  $$
);

-- Cron Job 3: 3-Day SLA 3-Strike System
-- Simulated: Drops campaigns that have been stale/unpaid for over 72 hours
SELECT cron.schedule(
  'sla-auto-drop',
  '0 * * * *', -- Runs hourly
  $$
    UPDATE public.campaigns
    SET status = 'completed'
    WHERE id IN (
      SELECT campaign_id FROM public.deliverables
      WHERE business_approved = FALSE
      AND submitted_url IS NOT NULL
      AND updated_at < NOW() - INTERVAL '72 hours'
    );
  $$
);
