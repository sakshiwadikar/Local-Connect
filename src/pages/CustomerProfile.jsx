import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Edit, LogOut, Heart, Star, MapPin, Mail, Settings, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from '../context/ToastContext';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, logout, getUserProfileSync, updateUserProfile } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (user) {
      const userProfile = getUserProfileSync();
      setProfile(userProfile);
      if (userProfile) {
        setEditData(userProfile);
      }
    }
  }, [user, getUserProfileSync]);

  if (!user || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">My Profile</h1>
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

  const handleRemoveFavorite = async (serviceId) => {
    try {
      await removeFavorite(serviceId);
      toast.success('Removed from favorites');
    } catch (err) {
      toast.error('Failed to remove favorite');
    }
  };

  const handleSaveProfile = () => {
    updateUserProfile(editData);
    setProfile(editData);
    setIsEditing(false);
  };

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
                <p className="text-white/80 flex items-center gap-2 mt-2">
                  <Mail size={16} />
                  {user.email}
                </p>
                <p className="text-white/80 mt-1 capitalize">Customer Account</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings')}
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

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Favorites */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Heart size={24} className="text-red-500" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Favorite Services</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                You have saved {favorites.length} favorite service{favorites.length !== 1 ? 's' : ''}
              </p>
              {favorites.length > 0 ? (
                <div className="space-y-3">
                  {favorites.map((service) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group"
                    >
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 dark:text-white truncate">{service.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{service.category} • {service.location}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center text-yellow-500">
                            <Star size={12} className="fill-current mr-1" />
                            <span className="text-xs font-medium">{service.rating}</span>
                          </div>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Trust {service.trustScore}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/services/${service.id}`)}
                          className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleRemoveFavorite(service.id)}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No favorite services yet. Start exploring!</p>
              )}
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Star size={24} className="text-yellow-500" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Reviews</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                You have written {profile.reviews?.length || 0} review{profile.reviews?.length === 1 ? '' : 's'}
              </p>
              {profile.reviews && profile.reviews.length > 0 ? (
                <div className="space-y-3">
                  {profile.reviews.map((review, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'} />
                          ))}
                        </div>
                        <span className="text-sm text-slate-500">4/5</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">Excellent service!</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No reviews yet. Search and review services to help others!</p>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Account Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Account Type</p>
                  <p className="font-semibold text-slate-900 dark:text-white capitalize">{profile?.userType || 'Customer'}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Member Since</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Email</p>
                  <p className="font-semibold text-slate-900 dark:text-white break-all">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Settings</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2">
                  <Settings size={18} />
                  Privacy Settings
                </button>
                <button className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2">
                  <Mail size={18} />
                  Email Preferences
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
