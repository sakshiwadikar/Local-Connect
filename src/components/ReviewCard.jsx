import { Star, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReviewCard({ review, onDelete }) {
  const { user } = useAuth();
  const isAuthor = user && user.email === review.userEmail;

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{review.userName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
        {isAuthor && (
          <button
            onClick={() => onDelete(review.id)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Delete review"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={16}
            className={i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}
          />
        ))}
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">{review.rating}/5</span>
      </div>

      <p className="text-slate-700 dark:text-slate-300">{review.comment}</p>
    </div>
  );
}
