-- Phase 9: Disputes, Escrow holds, and Admin features

-- 1. Escrow Holds (For manual 7-day holds before transfer)
CREATE TABLE public.escrow_holds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  hold_reason TEXT, -- e.g., 'fixed_deliverable_approval', 'affiliate_conversion'
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'released', 'refunded', 'disputed')),
  release_date TIMESTAMP WITH TIME ZONE NOT NULL, -- usually NOW() + 7 days
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.escrow_holds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to escrow holds" ON public.escrow_holds FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 2. Disputes Tribunal
CREATE TABLE public.disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  initiator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  escrow_hold_id UUID REFERENCES public.escrow_holds(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved_creator', 'resolved_business')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own disputes" ON public.disputes FOR SELECT USING (
  auth.uid() = initiator_id OR auth.uid() = target_id
);
CREATE POLICY "Users can create disputes" ON public.disputes FOR INSERT WITH CHECK (
  auth.uid() = initiator_id
);
CREATE POLICY "Admins have full access to disputes" ON public.disputes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 3. Trigger to place Escrow holds in 'disputed' state
CREATE OR REPLACE FUNCTION set_escrow_disputed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.escrow_hold_id IS NOT NULL THEN
    UPDATE public.escrow_holds SET status = 'disputed' WHERE id = NEW.escrow_hold_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_dispute_created
  AFTER INSERT ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION set_escrow_disputed();

-- 4. Cron job for Escrow Release
-- Runs daily. If status is pending and release_date is past, we update status to 'ready_for_payout'.
-- An external serverless function/webhook would listen to this and execute actual Stripe transfer.
SELECT cron.schedule(
  'escrow-auto-release',
  '0 0 * * *',
  $$
    UPDATE public.escrow_holds
    SET status = 'released'
    WHERE status = 'pending' AND release_date <= NOW();
  $$
);
