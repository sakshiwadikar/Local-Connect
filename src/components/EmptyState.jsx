import { Search, MapPin, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmptyState({ type = 'search' }) {
  const navigate = useNavigate();

  const states = {
    search: {
      icon: Search,
      title: 'No services found',
      description: 'Try adjusting your filters or search terms',
      action: () => navigate('/services'),
      actionText: 'Browse all services',
    },
    provider: {
      icon: Zap,
      title: 'No services listed',
      description: 'Start by creating your first service listing',
      action: () => navigate('/add-service'),
      actionText: 'Create listing',
    },
    reviews: {
      icon: Search,
      title: 'No reviews yet',
      description: 'Be the first to review this service!',
    },
    dashboard: {
      icon: MapPin,
      title: 'No data available',
      description: 'Your dashboard will appear here once you have activity',
    },
  };

  const state = states[type] || states.search;
  const Icon = state.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Icon size={56} className="text-slate-400 dark:text-slate-600 mb-4" />
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{state.title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-center mb-6 max-w-md">{state.description}</p>
      {state.action && (
        <button
          onClick={state.action}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
        >
          {state.actionText}
        </button>
      )}
    </div>
  );
}
