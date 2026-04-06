import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { Star, MapPin, CheckCircle, Clock, Phone, Mail, Calendar, Info, Shield, MessageCircle, Heart } from 'lucide-react';
import { generateMockServices } from '../data/mockServices';
import { getServiceReviews, getAverageRating } from '../data/mockReviews';
import ReviewForm from '../components/ReviewForm';
import ReviewCard from '../components/ReviewCard';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from '../context/ToastContext';

const allServices = generateMockServices(100);

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const toast = useToast();
  const [reviews, setReviews] = useState(getServiceReviews(parseInt(id)));
  const [reviewLoading, setReviewLoading] = useState(false);

  const mockService = allServices.find(s => s.id === parseInt(id));
  
  const service = mockService ? {
    ...mockService,
    about: `Professional ${mockService.category.toLowerCase()} services with over 10 years of experience. We provide reliable, quality solutions for all your needs.`,
    priceGuide: mockService.price,
    availability: 'Mon - Sat (9:00 AM - 7:00 PM)',
    phone: '+91 98765 43210',
    email: 'contact@example.com',
    joinedDate: 'Mar 2021',
  } : {
    name: 'Service Not Found',
    category: 'N/A',
    location: 'N/A',
    rating: 0,
    reviews: 0,
    trustScore: 0,
    verified: false,
    about: 'This service could not be found.',
    priceGuide: 'N/A',
    availability: 'N/A',
    phone: 'N/A',
    email: 'N/A',
    joinedDate: 'N/A',
    image: 'https://ui-avatars.com/api/?name=?&background=random&color=fff&size=250',
  };

  const averageRating = parseFloat(getAverageRating(parseInt(id)));
  const topReviews = reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  // Redirect to signin if not logged in
  if (!user) return <Navigate to="/signin" replace />;

  const handleReviewSubmit = async (reviewData) => {
    setReviewLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const newReview = {
        ...reviewData,
        id: String(Date.now()),
      };
      setReviews(prev => [newReview, ...prev]);
    } catch (err) {
      throw new Error('Failed to post review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = (reviewId) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast.error('Please sign in to add favorites');
      return;
    }

    try {
      await toggleFavorite(service);
      const isFav = isFavorited(service.id);
      toast.success(isFav ? 'Added to favorites' : 'Removed from favorites');
    } catch (err) {
      toast.error('Failed to update favorite');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Breadcrumb */}
      <nav className="flex text-sm text-slate-500 mb-8 space-x-2">
        <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/services" className="hover:text-indigo-600 transition-colors">{service.category}</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-medium">{service.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
        
        {/* Main Info Column */}
        <div className="flex-1 space-y-8">
          
          {/* Header Profile */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
          >
            {/* Background design */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[100px] -z-10" />
            
            <img src={service.image} alt={service.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-md z-10" />
            
            <div className="flex-1 space-y-3 z-10">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">{service.name}</h1>
                {service.verified && (
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/50">
                    <CheckCircle size={14} /> Verified
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1"><MapPin size={16} className="text-slate-400" /> {service.location}</span>
                <span className="flex items-center gap-1"><Shield size={16} className="text-slate-400" /> Joined {service.joinedDate}</span>
              </div>
              
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className={`${i < Math.floor(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'} `} />
                  ))}
                  <span className="ml-2 font-bold text-slate-900 dark:text-white">{averageRating.toFixed(1)}</span>
                  <span className="text-slate-500 ml-1">({reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteToggle}
              className={`self-start sm:self-center p-3 rounded-xl transition-all z-10 ${
                isFavorited(service.id)
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <Heart size={24} className={isFavorited(service.id) ? 'fill-current' : ''} />
            </button>
          </motion.div>

          {/* About Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About this service</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">{service.about}</p>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <Clock className="text-indigo-500 shrink-0" size={24} />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Business Hours</h4>
                  <p className="text-slate-500 text-sm mt-1">{service.availability}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <Info className="text-indigo-500 shrink-0" size={24} />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Pricing Guide</h4>
                  <p className="text-slate-500 text-sm mt-1">{service.priceGuide}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reviews Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Customer Reviews</h2>
              <p className="text-slate-600 dark:text-slate-400">{reviews.length} reviews from verified customers</p>
            </div>

            {/* Review Form */}
            {user ? (
              <ReviewForm serviceId={parseInt(id)} onSubmit={handleReviewSubmit} isLoading={reviewLoading} />
            ) : (
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center">
                <p className="text-slate-600 dark:text-slate-400 mb-3">You must be signed in to post a review.</p>
                <button onClick={() => navigate('/signin')} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
                  Sign In to Review
                </button>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {topReviews.map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    onDelete={handleDeleteReview}
                  />
                ))}
                {reviews.length > 3 && (
                  <button className="w-full py-4 text-center text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors">
                    View All {reviews.length} Reviews
                  </button>
                )}
              </div>
            ) : (
              <EmptyState type="reviews" />
            )}
          </motion.div>

        </div>

        {/* Sidebar Sticky Column */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-6">
          
          {/* Trust Score Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full filter blur-2xl transform translate-x-10 -translate-y-10" />
            
            <h3 className="font-medium text-indigo-100 mb-1">LocalConnect Trust Score™</h3>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-6xl font-black">{service.trustScore}</span>
              <span className="text-lg font-medium text-indigo-200 pb-1">/ 100</span>
            </div>
            
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-400" /> Identity Verified</span>
                <span className="font-bold text-emerald-400">Yes</span>
              </div>
              <div className="w-full h-px bg-white/20 my-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-400" /> High Review Reliability</span>
                <span className="font-bold text-emerald-400">98%</span>
              </div>
            </div>
          </motion.div>

          {/* Contact Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm sticky top-24"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Provider</h3>
            
            <div className="space-y-4 mb-8">
              <a 
                href={`tel:${service.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Call Now</p>
                  <p className="text-slate-900 dark:text-white font-medium">{service.phone}</p>
                </div>
              </a>
              
              <a 
                href={`https://wa.me/91${service.phone.replace(/[^\d]/g, '').slice(-10)}?text=Hi, I am interested in your services.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-green-500 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">WhatsApp</p>
                  <p className="text-slate-900 dark:text-white font-medium">Chat on WhatsApp</p>
                </div>
              </a>
              
              <a 
                href={`mailto:${service.email}`}
                className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-purple-500 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Send Message</p>
                  <p className="text-slate-900 dark:text-white font-medium">{service.email}</p>
                </div>
              </a>
            </div>

            <button className="w-full py-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg shadow-slate-900/20 dark:shadow-white/10 transition-all flex justify-center items-center gap-2">
              <Calendar size={18} /> Book Appointment
            </button>
            
            <p className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
              Booking through LocalConnect provides a 30-day service guarantee and payment protection.
            </p>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
