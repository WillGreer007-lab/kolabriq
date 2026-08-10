-- Add target_url to campaigns
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS target_url TEXT;

-- Create campaign_links table for tracking short codes
CREATE TABLE IF NOT EXISTS public.campaign_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    short_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(campaign_id, creator_id) -- One unique link per creator per campaign
);

-- Create clicks table for tracking analytics
CREATE TABLE IF NOT EXISTS public.clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    link_id UUID REFERENCES public.campaign_links(id) ON DELETE CASCADE NOT NULL,
    ip_hash TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create conversions table for tracking attributed sales
CREATE TABLE IF NOT EXISTS public.conversions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    link_id UUID REFERENCES public.campaign_links(id) ON DELETE CASCADE NOT NULL,
    order_id TEXT NOT NULL, -- The external order ID from the business's ecommerce system
    sale_amount DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(order_id) -- Prevent duplicate conversions for the same order
);

-- Enable RLS
ALTER TABLE public.campaign_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

-- Policies for campaign_links
CREATE POLICY "Creators can view their own links" ON public.campaign_links
    FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert their own links" ON public.campaign_links
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Businesses can view links for their campaigns" ON public.campaign_links
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_links.campaign_id AND business_id = auth.uid()));

-- Policies for clicks (read-only for related parties, inserted via service role / edge function)
CREATE POLICY "Creators can view clicks for their links" ON public.clicks
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.campaign_links WHERE id = clicks.link_id AND creator_id = auth.uid()));

CREATE POLICY "Businesses can view clicks for their campaigns" ON public.clicks
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.campaign_links JOIN public.campaigns ON campaign_links.campaign_id = campaigns.id WHERE campaign_links.id = clicks.link_id AND campaigns.business_id = auth.uid()));

-- Policies for conversions (read-only for related parties, inserted via service role)
CREATE POLICY "Creators can view conversions for their links" ON public.conversions
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.campaign_links WHERE id = conversions.link_id AND creator_id = auth.uid()));

CREATE POLICY "Businesses can view conversions for their campaigns" ON public.conversions
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.campaign_links JOIN public.campaigns ON campaign_links.campaign_id = campaigns.id WHERE campaign_links.id = conversions.link_id AND campaigns.business_id = auth.uid()));
