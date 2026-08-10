-- MVP Stabilization Schema Updates

CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.users(id),
  campaign_id UUID REFERENCES public.campaigns(id),
  creator_id UUID REFERENCES public.users(id),
  stripe_payment_intent_id TEXT,
  amount_total NUMERIC,
  amount_creator NUMERIC,
  amount_platform NUMERIC,
  currency TEXT DEFAULT 'gbp',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ledger entries" ON public.ledger_entries
  FOR SELECT USING (auth.uid() = business_id OR auth.uid() = creator_id);

CREATE TABLE IF NOT EXISTS public.clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id),
  creator_id UUID REFERENCES public.users(id),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id),
  creator_id UUID REFERENCES public.users(id),
  order_id TEXT UNIQUE,
  amount NUMERIC,
  currency TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

-- Note: Policies for clicks and conversions would be similar to ledger_entries
