import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Edit, LogOut, Star, TrendingUp, Eye, MessageSquare, Award, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProviderServices } from '../hooks/useProviderServices';
import { getServiceReviews, getAverageRating } from '../data/mockReviews';

export default function ProviderProfile() {
  const navigate = useNavigate();
  const { user, logout, getUserProfileSync } = useAuth();
  const { services } = useProviderServices();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      const userProfile = getUserProfileSync();
      setProfile(userProfile);
    }
  }, [user, getUserProfileSync]);

  if (!user || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Provider Profile</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Please sign in to view your profile</p>
          <a href="/signin" className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Calculate provider statistics
  const totalReviews = services.reduce((acc, service) => {
    const reviews = getServiceReviews(service.id);
    return acc + reviews.length;
  }, 0);

  const avgRating = services.length > 0
    ? (services.reduce((acc, service) => acc + parseFloat(getAverageRating(service.id)), 0) / services.length).toFixed(1)
    : 0;

  const totalViews = services.reduce((acc, s) => acc + (s.views || 0), 0);

  const stats = [
    { label: 'Active Services', value: services.length, icon: TrendingUp, color: 'bg-blue-500' },
    { label: 'Total Reviews', value: totalReviews, icon: MessageSquare, color: 'bg-purple-500' },
    { label: 'Avg Rating', value: `${avgRating}/5`, icon: Star, color: 'bg-yellow-500' },
    { label: 'Total Views', value: totalViews, icon: Eye, color: 'bg-green-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-24 h-24 rounded-full border-4 border-white" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white text-indigo-600 flex items-center justify-center text-3xl font-bold">
                  {user.displayName?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{user.displayName}</h1>
                <p className="text-white/80 mt-2">Provider Account</p>
                <p className="text-white/80 flex items-center gap-2 mt-1">
                  <Award size={16} />
                  Trust Score: {profile?.trustScore || 80}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/provider-settings')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Settings size={18} />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
              >
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}>
                  <Icon size={24} />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Services</h2>
              <button
                onClick={() => navigate('/add-service')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-semibold"
              >
                + Add Service
              </button>
            </div>
            {services.length > 0 ? (
              <div className="space-y-3">
                {services.slice(0, 5).map((service) => {
                  const reviews = getServiceReviews(service.id);
                  const avgRating = parseFloat(getAverageRating(service.id));
                  return (
                    <div key={service.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{service.businessName}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{service.category} • {service.location.city}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Rating</p>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            {avgRating.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Reviews</p>
                          <p className="font-bold text-slate-900 dark:text-white">{reviews.length}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">No services yet. Start by adding your first service!</p>
            )}
          </motion.div>

          {/* Account Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Account Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Email</p>
                  <p className="font-semibold text-slate-900 dark:text-white break-all">{user.email}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Member Since</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Account Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <p className="font-semibold text-slate-900 dark:text-white">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-3">Verification Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-green-900 dark:text-green-100">Email Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-green-900 dark:text-green-100">Phone Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                  <span className="text-slate-600 dark:text-slate-400">Documents Verified</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
