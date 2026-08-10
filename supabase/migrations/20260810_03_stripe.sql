-- Create Stripe Accounts Table
CREATE TABLE public.stripe_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    stripe_account_id TEXT UNIQUE NOT NULL,
    onboarding_complete BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Ledger Entries Table
CREATE TABLE public.ledger_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    amount_total DECIMAL(10, 2) NOT NULL,
    amount_creator DECIMAL(10, 2) NOT NULL,
    amount_platform DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'gbp' NOT NULL,
    status TEXT DEFAULT 'succeeded' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- Stripe Accounts Policies
CREATE POLICY "Users can view their own stripe account"
    ON public.stripe_accounts FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert/update stripe_accounts (since it's done securely via API)
-- We don't add public insert/update policies for security.

-- Ledger Entries Policies
CREATE POLICY "Businesses can view their own payments"
    ON public.ledger_entries FOR SELECT
    USING (auth.uid() = business_id);

CREATE POLICY "Creators can view their own payouts"
    ON public.ledger_entries FOR SELECT
    USING (auth.uid() = creator_id);

-- Add trigger for stripe_accounts updated_at
CREATE TRIGGER update_stripe_accounts_updated_at
    BEFORE UPDATE ON public.stripe_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
