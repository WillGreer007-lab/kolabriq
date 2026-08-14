"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, X, Loader2 } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  revieweeId: string;
  revieweeName: string;
  onSuccess: () => void;
}

export function ReviewModal({ isOpen, onClose, campaignId, revieweeId, revieweeName, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: submitError } = await supabase.from("reviews").insert([{
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      campaign_id: campaignId,
      rating_out_of_5: rating,
      written_feedback: feedback
    }]);

    if (submitError) {
      if (submitError.code === '23505') {
        setError("You have already reviewed this user for this campaign.");
      } else {
        setError(submitError.message);
      }
    } else {
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-md p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-heading font-extrabold text-[var(--foreground)] mb-2">Rate {revieweeName}</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Your feedback enforces our high-quality platform standards.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-500/10 text-red-500 text-sm font-bold rounded-lg">{error}</div>}

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  size={40}
                  className={star <= (hoverRating || rating) ? "fill-[#F5A623] text-[#F5A623]" : "text-[var(--border-subtle)]"}
                />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--text-primary)]">Written Feedback (Public)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full bg-[var(--background-subtle)] border border-[var(--border)] rounded-xl p-4 text-sm focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
              placeholder="Describe your experience working together..."
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-neon w-full flex justify-center py-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
