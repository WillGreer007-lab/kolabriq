-- Create Enums
CREATE TYPE compensation_model AS ENUM ('performance', 'fixed', 'hybrid');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');

-- Create Campaigns Table
CREATE TABLE public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    compensation_model compensation_model NOT NULL,
    fixed_fee DECIMAL(10, 2) DEFAULT 0.00,
    commission_rate DECIMAL(5, 2) DEFAULT 0.00, -- e.g., 10.50 for 10.5%
    deliverables TEXT[] DEFAULT '{}',
    targeting JSONB DEFAULT '{}'::jsonb,
    status campaign_status DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Campaign Applications Table
CREATE TABLE public.campaign_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status application_status DEFAULT 'pending' NOT NULL,
    message TEXT, -- Optional message from creator when applying
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(campaign_id, creator_id) -- A creator can only apply once per campaign
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;

-- Campaigns Policies
CREATE POLICY "Anyone can view active campaigns"
    ON public.campaigns FOR SELECT
    USING (status = 'active');

CREATE POLICY "Businesses can view their own campaigns"
    ON public.campaigns FOR SELECT
    USING (auth.uid() = business_id);

CREATE POLICY "Businesses can insert their own campaigns"
    ON public.campaigns FOR INSERT
    WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Businesses can update their own campaigns"
    ON public.campaigns FOR UPDATE
    USING (auth.uid() = business_id);

-- Applications Policies
CREATE POLICY "Creators can view their own applications"
    ON public.campaign_applications FOR SELECT
    USING (auth.uid() = creator_id);

CREATE POLICY "Businesses can view applications for their campaigns"
    ON public.campaign_applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE campaigns.id = campaign_applications.campaign_id
            AND campaigns.business_id = auth.uid()
        )
    );

CREATE POLICY "Creators can insert applications"
    ON public.campaign_applications FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Businesses can update application status"
    ON public.campaign_applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE campaigns.id = campaign_applications.campaign_id
            AND campaigns.business_id = auth.uid()
        )
    );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.campaign_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
