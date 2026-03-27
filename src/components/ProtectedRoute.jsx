import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading, getUserProfileSync } = useAuth();
  const profile = user ? getUserProfileSync() : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-12 h-12 rounded-full border-4 border-slate-300 dark:border-slate-700 border-t-indigo-600 dark:border-t-indigo-400"></div>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user has required role (e.g., 'provider')
  // If role doesn't match, redirect to home
  if (requiredRole && (!profile || profile.userType !== requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
