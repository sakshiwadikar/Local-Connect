import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, Star, Phone, ShieldCheck, ChevronDown, Heart } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { generateMockServices } from '../data/mockServices';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';

const mockServices = generateMockServices(100);

export default function ServiceListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { isFavorited, toggleFavorite } = useFavorites();
  const [searchParams] = useSearchParams();
  
  const categoryMap = {
    'plumbers': 'Plumbers',
    'electricians': 'Electricians',
    'hospitals': 'Hospitals',
    'grocery': 'Grocery',
    'courier': 'Courier'
  };
  
  const paramCategory = searchParams.get('category');
  const initialCategory = paramCategory && categoryMap[paramCategory] ? categoryMap[paramCategory] : 'All';
  
  const paramLocation = searchParams.get('location');
  
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeLocation, setActiveLocation] = useState('All Cities');
  const [minTrustScore, setMinTrustScore] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('trustScore'); // trustScore | rating | reviews

  // Handle favorite toggle
  const handleFavoriteToggle = async (e, service) => {
    e.stopPropagation(); // Prevent navigating to service detail
    
    if (!user) {
      toast.error('Please sign in to add favorites');
      navigate('/signin');
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

  // Clean initial loaded parameters
  useEffect(() => {
    if (paramCategory && categoryMap[paramCategory]) setActiveCategory(categoryMap[paramCategory]);
    // Fuzzy matching param location to explicit choices to set initial value cleanly
    if (paramLocation) {
      const matchKey = ['Mumbai', 'Delhi', 'Bangalore', 'Pune'].find(c => paramLocation.toLowerCase().includes(c.toLowerCase()));
      if (matchKey) setActiveLocation(matchKey);
    }
  }, [paramCategory, paramLocation]);

  const rawCategories = activeCategory === 'All' 
    ? [...mockServices] 
    : mockServices.filter(s => s.category === activeCategory);

  const rawFiltered = activeLocation === 'All Cities'
    ? rawCategories
    : rawCategories.filter(s => s.location.includes(activeLocation) || activeLocation.includes(s.location));

  const filteredServices = rawFiltered
    .filter(s => s.trustScore >= minTrustScore)
    .filter(s => {
      const priceNum = parseInt(s.price.replace(/[^0-9]/g, ''));
      return priceNum >= minPrice && priceNum <= maxPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return Number(b.rating) - Number(a.rating);
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      return b.trustScore - a.trustScore; // Default to trustScore (High to low)
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 min-h-screen">
      
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Filter size={18} />
            <span>Filters</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={activeLocation}
                  onChange={(e) => setActiveLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                >
                  <option value="All Cities">All Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Pune">Pune</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Category</label>
              <div className="space-y-2">
                {['All', 'Plumbers', 'Electricians', 'Hospitals', 'Brokers', 'Grocery'].map(cat => (
                  <label key={cat} className="flex items-center space-x-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category" 
                      className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 transition-colors"
                      checked={activeCategory === cat}
                      onChange={() => setActiveCategory(cat)}
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Trust Score</label>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{minTrustScore}</span>
              </div>
              <input 
                type="range" 
                className="w-full accent-indigo-600" 
                min="0" 
                max="100" 
                value={minTrustScore}
                onChange={(e) => setMinTrustScore(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>0</span>
                <span>100</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Price Range</label>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">₹{minPrice} - ₹{maxPrice}</span>
              </div>
              <div className="space-y-2">
                <input 
                  type="range" 
                  className="w-full accent-indigo-600" 
                  min="0" 
                  max="10000" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                />
                <input 
                  type="range" 
                  className="w-full accent-indigo-600" 
                  min="0" 
                  max="10000" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {activeCategory === 'All' ? 'All Services' : activeCategory} near you
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Found {filteredServices.length} verified professionals</p>
          </div>
          
          <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:shadow-sm transition-all text-sm font-medium text-slate-700 dark:text-slate-300">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-transparent py-2.5 pl-4 pr-10 w-full outline-none cursor-pointer dark:text-white"
            >
              <option value="trustScore" className="text-slate-900">Sort by: Trust Score</option>
              <option value="rating" className="text-slate-900">Sort by: Top Rated</option>
              <option value="reviews" className="text-slate-900">Sort by: Most Reviewed</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 pointer-events-none text-slate-400" />
          </div>
        </div>

        {filteredServices.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {filteredServices.map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer relative overflow-hidden"
                  onClick={() => navigate(`/services/${service.id}`)}
                >
                  {service.verified && (
                    <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 uppercase tracking-wider">
                      <ShieldCheck size={12} /> Verified
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <img src={service.image} alt={service.name} className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg truncate pr-16">{service.name}</h3>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 truncate">{service.category} • {service.location}</p>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center text-yellow-500">
                          <Star size={14} className="fill-current mr-1" />
                          <span className="font-medium">{service.rating}</span>
                          <span className="text-slate-400 dark:text-slate-500 ml-1">({service.reviews})</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md text-xs">
                          Trust {service.trustScore}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {service.price}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleFavoriteToggle(e, service)}
                        className={`p-2 rounded-lg transition-colors ${
                          isFavorited(service.id)
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 dark:hover:text-red-400'
                        }`}
                      >
                        <Heart size={16} className={isFavorited(service.id) ? 'fill-current' : ''} />
                      </button>
                      <button className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400 transition-colors tooltip-trigger relative">
                        <Phone size={16} />
                      </button>
                      <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-md shadow-indigo-600/20 transition-all">
                        View Match
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {filteredServices.length > 12 && (
              <div className="mt-8 flex justify-center">
                <button className="px-6 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium transition-colors shadow-sm">
                  Load More Services
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState type="search" />
        )}
      </main>
    </div>
  );
}
