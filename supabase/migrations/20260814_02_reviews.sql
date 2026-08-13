-- Create the reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  rating_out_of_5 INTEGER NOT NULL CHECK (rating_out_of_5 >= 1 AND rating_out_of_5 <= 5),
  written_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure a user can only review another user once per campaign
ALTER TABLE public.reviews ADD CONSTRAINT unique_review_per_campaign UNIQUE (reviewer_id, reviewee_id, campaign_id);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews are public
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

-- Authenticated users can insert reviews
CREATE POLICY "Users can insert their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Trigger function to update average rating on profile
CREATE OR REPLACE FUNCTION update_average_rating()
RETURNS TRIGGER AS $$
DECLARE
  new_avg DECIMAL(3,2);
  user_role TEXT;
BEGIN
  -- Calculate new average
  SELECT COALESCE(AVG(rating_out_of_5), 0) INTO new_avg
  FROM public.reviews
  WHERE reviewee_id = NEW.reviewee_id;

  -- Determine the role of the reviewee
  SELECT role INTO user_role FROM public.profiles WHERE id = NEW.reviewee_id;

  IF user_role = 'business' THEN
    UPDATE public.business_profiles SET average_rating = new_avg WHERE id = NEW.reviewee_id;
  ELSIF user_role = 'creator' THEN
    UPDATE public.creator_profiles SET average_rating = new_avg WHERE id = NEW.reviewee_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_added
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_average_rating();
