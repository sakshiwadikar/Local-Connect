import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Wrench, Zap, Briefcase, ShoppingBag, HeartPulse, ChevronRight, Star, LocateFixed, Truck, MessageSquare, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { generateMockServices, getCategoryCounts } from '../data/mockServices';
import { getTestimonials } from '../data/mockTestimonials';
import { useAuth } from '../context/AuthContext';

const mockServices = generateMockServices(100);
const counts = getCategoryCounts(mockServices);

const categories = [
  { id: 'plumbers', name: 'Plumbers', icon: Wrench, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900', count: `${counts['Plumbers']}+` },
  { id: 'electricians', name: 'Electricians', icon: Zap, color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900', count: `${counts['Electricians']}+` },
  { id: 'grocery', name: 'Grocery Stores', icon: ShoppingBag, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900', count: `${counts['Grocery']}+` },
  { id: 'hospitals', name: 'Hospitals', icon: HeartPulse, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900', count: `${counts['Hospitals']}+` },
  { id: 'courier', name: 'Courier Services', icon: Truck, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900', count: `${counts['Courier']}+` }
];

const featuredServices = mockServices.slice(0, 6).map((service, idx) => ({
  ...service,
  id: idx + 1
}));

const locationOptionsParams = ["Mumbai, Maharashtra", "Delhi, DL", "Bangalore, Karnataka", "Pune, Maharashtra", "Chennai, Tamil Nadu", "Kolkata, WB", "Hyderabad, TG", "Ahmedabad, GJ", "Jaipur, RJ", "Lucknow, UP"];
const serviceOptionsParams = ["Plumbers", "Electricians", "Brokers", "Grocery Stores", "Hospitals", "Courier", "Carpenters", "Cleaning Services", "AC Repair", "Pest Control", "Movers", "Cooks"];

export default function Home() {
  const navigate = useNavigate();
  const { user, getUserProfileSync } = useAuth();
  const profile = user ? getUserProfileSync() : null;
  const [location, setLocation] = useState('');
  const [serviceQuery, setServiceQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [showServiceOptions, setShowServiceOptions] = useState(false);

  // Close dropdowns on outside click (optional improvement, using onBlur with timeout is sufficient here)

  const handleDetectLocation = () => {
    setIsDetecting(true);
    setLocation('Detecting location...');
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await res.json();
            const city = data.city || data.locality || data.principalSubdivision || "Unknown City";
            const state = data.principalSubdivision || "";
            setLocation(state ? `${city}, ${state}` : city);
          } catch (error) {
            setLocation('Mumbai, Maharashtra'); // Fallback on fetch error
          } finally {
            setIsDetecting(false);
          }
        },
        () => {
          setLocation('Location access denied');
          setIsDetecting(false);
        }
      );
    } else {
      setLocation('Geolocation not supported');
      setIsDetecting(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (serviceQuery) {
      // Basic normalization matching categories keys (e.g. 'plumber' -> 'plumbers')
      const normalizedQuery = serviceQuery.toLowerCase().trim();
      const mappedCategory = normalizedQuery.endsWith('s') ? normalizedQuery : normalizedQuery + 's';
      params.append('category', mappedCategory);
    }
    navigate(`/services?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full pt-24 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 -z-20" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/30 dark:bg-purple-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob -z-10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/30 dark:bg-indigo-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000 -z-10" />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/30 dark:bg-rose-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-4000 -z-10" />

        <div className="w-full max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-sm font-medium mb-6">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span>India's Most Trusted Local Directory</span>
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              {profile?.userType === 'provider' ? (
                <>
                  Manage Your
                  <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 leading-tight"> Service Business</span>
                </>
              ) : (
                <>
                  Connect with India's
                  <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 leading-tight"> Local Experts</span>
                </>
              )}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
              {profile?.userType === 'provider' 
                ? 'List your services, manage bookings, and grow your customer base with LocalConnect.'
                : 'Find verified plumbers, electricians, hospitals, and more in any city, town, or village across India. Powered by smart analytics.'}
            </p>
          </motion.div>

          {/* Search Box / Provider CTA */}
          {profile?.userType === 'provider' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row gap-3"
            >
              <Link
                to="/provider-dashboard"
                className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center"
              >
                <LayoutDashboard className="mr-2" size={20} />
                Manage My Services
              </Link>
              <Link
                to="/add-service"
                className="flex-1 px-8 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-medium transition-colors shadow-lg shadow-slate-900/20 flex items-center justify-center"
              >
                <Briefcase className="mr-2" size={20} />
                Add New Service
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-4xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3 rounded-2xl shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-900/20 border border-white/20 dark:border-slate-800/50 flex flex-col sm:flex-row gap-3"
            >
            <div className="relative flex-1">
              <div className="relative flex items-center w-full">
                <MapPin className="absolute left-4 text-slate-400" size={20} />
                <input 
                  type="text"
                  placeholder="Select State -> City -> Village..."
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setShowLocationOptions(true); }}
                  onFocus={() => setShowLocationOptions(true)}
                  onBlur={() => setTimeout(() => setShowLocationOptions(false), 200)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 transition-shadow"
                />
                <button 
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  title="Detect my location"
                  className={`absolute right-4 p-1.5 rounded-md transition-colors ${isDetecting ? 'text-indigo-400 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50'}`}
                >
                  <LocateFixed size={20} />
                </button>
              </div>

              {/* Location Dropdown */}
              <AnimatePresence>
                {showLocationOptions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-[110%] left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
                  >
                    {locationOptionsParams
                      .filter(o => o.toLowerCase().includes(location.toLowerCase()))
                      .map((o) => (
                      <div 
                        key={o} 
                        onClick={() => { setLocation(o); setShowLocationOptions(false); }}
                        className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-left text-sm text-slate-700 dark:text-slate-300 font-medium border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                      >
                        {o}
                      </div>
                    ))}
                    {locationOptionsParams.filter(o => o.toLowerCase().includes(location.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 font-medium">No strict matches. Press Enter to search everywhere.</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative flex-1">
              <div className="relative flex items-center w-full">
                <Search className="absolute left-4 text-slate-400" size={20} />
                <input 
                  type="text"
                  placeholder="What service do you need?"
                  value={serviceQuery}
                  onChange={(e) => { setServiceQuery(e.target.value); setShowServiceOptions(true); }}
                  onFocus={() => setShowServiceOptions(true)}
                  onBlur={() => setTimeout(() => setShowServiceOptions(false), 200)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 transition-shadow"
                />
              </div>

              {/* Service Dropdown */}
              <AnimatePresence>
                {showServiceOptions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-[110%] left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
                  >
                    {serviceOptionsParams
                      .filter(o => o.toLowerCase().includes(serviceQuery.toLowerCase()))
                      .map((o) => (
                      <div 
                        key={o} 
                        onClick={() => { setServiceQuery(o); setShowServiceOptions(false); }}
                        className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-left text-sm text-slate-700 dark:text-slate-300 font-medium border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                      >
                        {o}
                      </div>
                    ))}
                    {serviceOptionsParams.filter(o => o.toLowerCase().includes(serviceQuery.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 font-medium">Use custom query...</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={handleSearch}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20 flex flex-shrink-0 items-center justify-center font-semibold"
            >
              Search
            </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Explore Categories</h2>
            <p className="text-slate-600 dark:text-slate-400">Discover essential services precisely tailored to your location.</p>
          </div>
          <Link to="/services" className="hidden sm:flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            <span>View All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => navigate(`/services?category=${category.id}`)}
                className={`cursor-pointer group flex flex-col items-center p-8 bg-white dark:bg-slate-900 border ${category.color.split(' ')[2]} dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
              >
                <div className={`w-16 h-16 rounded-2xl ${category.color.split(' ')[0]} ${category.color.split(' ')[1]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  <Icon size={32} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1 relative z-10">{category.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium relative z-10">{category.count} Listings</p>

                {/* Hover Background Accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-slate-50/0 group-hover:from-indigo-50/50 group-hover:to-purple-50/50 dark:group-hover:from-indigo-900/10 dark:group-hover:to-purple-900/10 transition-colors opacity-0 group-hover:opacity-100 z-0"/>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Trust & Verified Providers (Sneak peek features) */}
      <section className="w-full bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 py-20 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                Trust & Verification <br /> Built-In
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Every service provider is vetted with our proprietary Trust Score™ system. We analyze historical reviews, verified documents, and community feedback to guarantee quality.
              </p>
              <ul className="space-y-4">
                {[
                  '100% Background Verified Pros',
                  'Transparent Pricing & Estimates',
                  'Community Driven Trust Score'
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-medium">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Star size={12} className="fill-current" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/services')}
                className="mt-4 px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-lg shadow-slate-900/20 dark:shadow-white/10 hover:shadow-xl transition-all"
              >
                Only Pros
              </button>
            </div>
            
            {/* Cards Demo */}
            <div className="flex-1 w-full max-w-md relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[40px] blur-2xl -z-10" />
              
              <div className="space-y-4 relative z-10">
                {featuredServices.map((service, idx) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 }}
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-4 hover:scale-[1.02] hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-indigo-500/10 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center shrink-0">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-lg">{service.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white truncate">{service.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{service.category} • {service.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end space-x-1 text-yellow-500 font-semibold">
                        <Star size={14} className="fill-current" />
                        <span>{service.rating}</span>
                      </div>
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full mt-1 inline-block">Score {service.trustScore}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-transparent via-indigo-50/40 to-transparent dark:from-slate-950 dark:via-indigo-900/10 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-2">
              <MessageSquare size={32} className="text-indigo-600" />
              What Our Users Say
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Trusted by thousands of customers and service providers across India
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getTestimonials().map((testimonial, idx) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{testimonial.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
