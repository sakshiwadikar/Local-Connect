import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Star, Eye, ListChecks, TrendingUp, MessageSquare, Trash2, Edit2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProviderServices } from '../hooks/useProviderServices';
import { getServiceReviews, getAverageRating } from '../data/mockReviews';
import EmptyState from '../components/EmptyState';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { services, loading, fetchServices, deleteService } = useProviderServices();
  const [editingService, setEditingService] = useState(null);
  const [deletingServiceId, setDeletingServiceId] = useState(null);
  const [editFormData, setEditFormData] = useState({});


  useEffect(() => {
    if (user?.uid) {
      fetchServices();
    }
  }, [user?.uid, fetchServices]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Provider Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Please sign in to access your dashboard</p>
          <a href="/signin" className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Calculate stats from real services
  const totalReviews = services.reduce((acc, service) => {
    const reviews = getServiceReviews(service.id);
    return acc + reviews.length;
  }, 0);

  const avgRating = services.length > 0
    ? (services.reduce((acc, service) => acc + parseFloat(getAverageRating(service.id)), 0) / services.length).toFixed(1)
    : 0;

  const stats = [
    {
      label: 'Active Services',
      value: services.length,
      icon: ListChecks,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Total Reviews',
      value: totalReviews,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Avg Rating',
      value: avgRating,
      icon: Star,
      color: 'from-amber-500 to-amber-600',
    },
    {
      label: 'Total Views',
      value: services.reduce((acc, s) => acc + (s.views || 0), 0),
      icon: Eye,
      color: 'from-emerald-500 to-emerald-600',
    },
  ];

  const handleDeleteClick = (serviceId) => {
    setDeletingServiceId(serviceId);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteService(deletingServiceId);
      setDeletingServiceId(null);
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  const handleEditClick = (service) => {
    setEditingService(service.id);
    setEditFormData({
      businessName: service.businessName,
      category: service.category,
      description: service.description,
      phone: service.phone,
      email: service.email,
      website: service.website,
      state: service.location.state,
      city: service.location.city,
      address: service.location.address,
      price: service.price
    });
  };

  const categories = [
    'Plumbers', 'Electricians', 'Hospitals', 'Doctors', 'Grocery Stores',
    'Courier Services', 'Carpenters', 'Cleaning Services', 'AC Repair',
    'Pest Control', 'Moving & Transportation', 'Cooks & Catering'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Provider Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Welcome back, {user.displayName || user.email}</p>
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
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg shadow-black/10`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <Icon size={32} className="text-white/20" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Your Listings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListChecks size={28} className="text-indigo-600" /> Your Services
          </h2>
          <button
            onClick={() => navigate('/add-service')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
          >
            + Add Service
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin">
              <div className="w-12 h-12 rounded-full border-4 border-slate-300 dark:border-slate-700 border-t-indigo-600"></div>
            </div>
          </div>
        ) : services.length > 0 ? (
          <div className="grid gap-6">
            {services.map((service) => {
              const reviews = getServiceReviews(service.id);
              const avgRating = parseFloat(getAverageRating(service.id));
              
              return (
                <div key={service.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <img src={service.image} alt={service.businessName} className="w-24 h-24 rounded-lg object-cover" />
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{service.businessName}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{service.category} • {service.location.city}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{service.description}</p>
                      </div>
                      
                      <div className="flex gap-6 text-sm">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Rating</p>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            <Star size={16} className="fill-amber-400 text-amber-400" />
                            {avgRating.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Reviews</p>
                          <p className="font-bold text-slate-900 dark:text-white">{reviews.length}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Trust Score</p>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">{service.trustScore}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Price</p>
                          <p className="font-bold text-slate-900 dark:text-white">{service.price}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 sm:flex-col">
                      <button
                        onClick={() => handleEditClick(service)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg transition-all text-sm flex items-center gap-2"
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(service.id)}
                        className="px-4 py-2 border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold rounded-lg transition-all text-sm flex items-center gap-2"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState type="provider" />
        )}
      </motion.div>

      {/* Recent Reviews */}
      {services.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Reviews</h2>
          
          <div className="grid gap-4">
            {services.slice(0, 2).map((service) => {
              const reviews = getServiceReviews(service.id).slice(0, 2);
              return reviews.map((review) => (
                <div key={review.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{review.userName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">on {service.businessName}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{review.comment}</p>
                </div>
              ));
            })}
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingServiceId && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Service?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">This action cannot be undone. Are you sure you want to delete this service?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingServiceId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-2xl w-full my-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Service</h3>
              <button
                onClick={() => setEditingService(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X size={24} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Name</label>
                <input
                  type="text"
                  value={editFormData.businessName}
                  onChange={(e) => setEditFormData({...editFormData, businessName: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">State</label>
                <input
                  type="text"
                  value={editFormData.state}
                  onChange={(e) => setEditFormData({...editFormData, state: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">City</label>
                <input
                  type="text"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Address</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Price</label>
                <input
                  type="text"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setEditingService(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditingService(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
