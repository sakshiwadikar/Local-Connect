import { useState } from 'react';
import { Star, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReviewForm({ serviceId, onSubmit, isLoading }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!user) {
      setError('Please sign in to leave a review');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    try {
      await onSubmit({
        serviceId,
        rating,
        comment: comment.trim(),
        userName: user.displayName || user.email.split('@')[0],
        userEmail: user.email,
        createdAt: new Date().toISOString(),
      });
      setComment('');
      setRating(5);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Leave a Review</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg flex gap-2 text-red-800 dark:text-red-200 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg text-green-800 dark:text-green-200 text-sm">
          Thanks for your review!
        </div>
      )}

      {!user && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Please sign in to leave a review</p>
      )}

      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              disabled={!user}
              className="disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={!user || isLoading}
          maxLength={500}
          className="w-full p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Share your experience with this service..."
          rows={4}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{comment.length}/500</p>
      </div>

      <button
        type="submit"
        disabled={!user || isLoading || comment.trim().length < 10}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        <Send size={18} />
        {isLoading ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
}
