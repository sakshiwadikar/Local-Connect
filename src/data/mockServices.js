// Comprehensive mock services data
const plumbers = [
  'Rajesh Plumbing Expert',
  'Sharma Water Solutions',
  'Quick Drain Cleaning',
  'Professional Pipe Work',
  'Emergency Plumbing 24/7',
  'City Plumbing Services',
  'Master Plumber Alliance',
  'Swift Fix Plumbing',
];

const electricians = [
  'Amit Electricals',
  'Power Solutions India',
  'Reliable Electric Works',
  'Professional Wiring Services',
  'Expert Electrical Repairs',
  'Voltage Control Systems',
  'Complete House Wiring',
  'Safety First Electricals',
];

const hospitals = [
  'City Care Hospital',
  'Modern Medical Center',
  'Prime Health Clinic',
  'Advanced Care Hospital',
  'Wellness Medical Institute',
  'Expert Doctors Hospital',
  'Multi-specialty Clinic',
  'Health First Medical',
];

const grocery = [
  'Fresh Mart Grocery',
  'Daily Needs Store',
  'Organic Valley Market',
  'Quick Shop Supermarket',
  'Family Grocery Hub',
  'Premium Foods Market',
  'Village Fresh Store',
  'Express Grocery Delivery',
];

const courier = [
  'Speedy Delivery Service',
  'Express Package Solutions',
  'Quick Courier India',
  'Fast Track Delivery',
  'Reliable Express Shipping',
  'Same Day Delivery Co.',
  'Nationwide Courier Service',
  'Priority Parcel Delivery',
];

const categories = {
  'Plumbers': { services: plumbers, icon: 'Wrench', color: 'blue' },
  'Electricians': { services: electricians, icon: 'Zap', color: 'yellow' },
  'Hospitals': { services: hospitals, icon: 'HeartPulse', color: 'rose' },
  'Grocery': { services: grocery, icon: 'ShoppingBag', color: 'emerald' },
  'Courier': { services: courier, icon: 'Truck', color: 'indigo' },
};

const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Kolkata', 'Hyderabad', 'Ahmedabad'];

export function generateMockServices(count = 100) {
  const services = [];
  const categoryNames = Object.keys(categories);
  
  for (let i = 0; i < count; i++) {
    const categoryName = categoryNames[i % categoryNames.length];
    const categoryData = categories[categoryName];
    const serviceName = categoryData.services[i % categoryData.services.length];
    const location = locations[i % locations.length];
    
    services.push({
      id: i + 1,
      name: `${serviceName} ${i > categoryData.services.length ? `(Branch ${Math.floor(i / categoryData.services.length)})` : ''}`.trim(),
      category: categoryName,
      location: location,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      reviews: Math.floor(Math.random() * 600) + 5,
      trustScore: Math.floor(Math.random() * 25) + 75,
      verified: Math.random() > 0.2,
      price: ['₹500/hr', 'Consultation: ₹1000', '₹300/hr', '₹50/order', '₹200/delivery'][i % 5],
      image: `https://ui-avatars.com/api/?name=${serviceName.split(' ')[0]}&background=random&color=fff&size=150`
    });
  }
  
  return services;
}

export function getCategoryCount(categoryName, services) {
  return services.filter(s => s.category === categoryName).length;
}

export function getCategoryCounts(services) {
  return {
    'Plumbers': getCategoryCount('Plumbers', services),
    'Electricians': getCategoryCount('Electricians', services),
    'Hospitals': getCategoryCount('Hospitals', services),
    'Grocery': getCategoryCount('Grocery', services),
    'Courier': getCategoryCount('Courier', services),
  };
}
