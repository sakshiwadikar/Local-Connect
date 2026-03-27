import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Search, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-md"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle size={48} className="text-red-600 dark:text-red-400" />
          </div>
        </motion.div>

        <div>
          <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-2">404</h1>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Page Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400">
            The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Home size={18} />
            Go Home
          </Link>
          <Link
            to="/services"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg transition-colors hover:bg-slate-300 dark:hover:bg-slate-700"
          >
            <Search size={18} />
            Browse Services
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
