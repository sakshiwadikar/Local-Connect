// Comprehensive mock services data
const plumbers = [
  'Rajesh Plumbing Expert', 'Sharma Water Solutions', 'Quick Drain Cleaning',
  'Professional Pipe Works', 'Emergency Plumbing 24/7', 'City Plumbing Services',
  'Master Plumber Alliance', 'Swift Fix Plumbing', 'AquaFlow Plumbers',
  'PipePro Solutions', 'Gupta Pipe & Drain', 'HydroFix India',
  'Reliable Leak Repairs', 'Verma Plumbing Co.', 'DrainMaster Services',
  'TrustPipe Experts', 'Nair Sanitary Works', 'Urban Plumb Solutions',
  'Singh Waterworks', 'PrecisionPipe Repairs',
];

const electricians = [
  'Amit Electricals', 'Power Solutions India', 'Reliable Electric Works',
  'Professional Wiring Services', 'Expert Electrical Repairs', 'Voltage Control Systems',
  'Complete House Wiring', 'Safety First Electricals', 'BrightSpark Electricians',
  'Joshi Power Services', 'CircuitPro India', 'Mehta Electric Co.',
  'SmartWire Solutions', 'Patel Electrical Works', 'CurrentFix Experts',
  'Reddy Wiring Services', 'PowerGrid Technicians', 'ElectroCare India',
  'Neon Electric Works', 'VoltEdge Services',
];

const hospitals = [
  'City Care Hospital', 'Modern Medical Center', 'Prime Health Clinic',
  'Advanced Care Hospital', 'Wellness Medical Institute', 'Expert Doctors Hospital',
  'Multi-Specialty Clinic', 'Health First Medical', 'Sunrise Health Centre',
  'Apollo Family Clinic', 'MediCare Plus Hospital', 'LifeLine Medical Hub',
  'Healing Touch Clinic', 'Arogya Health Centre', 'Sanjivani Hospital',
  'CureCare Medical', 'Lotus Wellness Clinic', 'Dhanvantari Hospital',
  'Sparsh Health Institute', 'Niramaya Medical Centre',
];

const grocery = [
  'Fresh Mart Grocery', 'Daily Needs Store', 'Organic Valley Market',
  'Quick Shop Supermarket', 'Family Grocery Hub', 'Premium Foods Market',
  'Village Fresh Store', 'Express Grocery Delivery', 'GreenBasket Mart',
  'Ration King Store', 'NatureFresh Supermart', 'Apna Bazaar Grocery',
  'Subzi Mandi Express', 'FreshPick Delivery', 'Kisaan Fresh Market',
  'Metro Grocery Store', 'Desi Provisions Mart', 'HarvestHub Grocery',
  'PureFoods Daily Store', 'SwiftCart Supermarket',
];

const courier = [
  'Speedy Delivery Service', 'Express Package Solutions', 'Quick Courier India',
  'Fast Track Delivery', 'Reliable Express Shipping', 'Same Day Delivery Co.',
  'Nationwide Courier Service', 'Priority Parcel Delivery', 'SwiftShip Logistics',
  'ZoomCourier India', 'SafeParcel Express', 'DoorStep Delivery Co.',
  'RocketShip Couriers', 'TrustCargo Services', 'InstaDrop Logistics',
  'PinPoint Delivery', 'CargoKing Express', 'QuickHop Couriers',
  'SecureShip India', 'LastMile Delivery Co.',
];

const cooks = [
  'Sharma Home Kitchen', 'Spice Route Catering', 'Royal Feast Caterers',
  'Homely Bites Cooking', 'Annapurna Catering Co.', 'Flavours of India',
  'Tiffin Express Cooks', 'Grand Feast Catering', 'Desi Tadka Kitchen',
  'Nourish Home Cooks', 'Celebration Caterers', 'Rasoi Queen Services',
  'Punjabi Dhaba Catering', 'South Spice Caterers', 'Mithas Sweet Catering',
  'Urban Chef Services', 'Ghar Ka Khana Cooks', 'Festive Feast Catering',
  'Healthy Bites Kitchen', 'Swad Home Catering',
];

const pestControl = [
  'BugFree India', 'PestShield Services', 'CleanHome Pest Control',
  'SafeGuard Exterminators', 'GreenPest Solutions', 'RatAway Services',
  'TermiteKill Experts', 'HygieneFirst Pest Co.', 'NoMore Pests India',
  'EcoSafe Pest Control', 'QuickKill Exterminators', 'PestPro Services',
  'HomeGuard Pest India', 'ClearZone Pest Control', 'BioShield Exterminators',
  'SwiftPest Solutions', 'PureHome Pest Services', 'ZeroBug India',
  'SafeNest Pest Control', 'CleanSpace Exterminators',
];

const cleaning = [
  'SparkleClean Services', 'HomeShiners India', 'DeepClean Experts',
  'FreshSpace Cleaning', 'CleanMate Services', 'BrightHome Cleaners',
  'ProClean India', 'NeatFreak Services', 'PureHome Cleaning Co.',
  'ShineRight Cleaners', 'QuickMop Services', 'GleamHome India',
  'TidyUp Professionals', 'CrystalClean Services', 'HygieneHome Cleaners',
  'SwiftClean India', 'PristineSpace Services', 'CleanSweep Experts',
  'FreshStart Cleaning', 'ZeroMess Services',
];

const carpenters = [
  'WoodCraft Masters', 'Sharma Furniture Works', 'PrecisionWood India',
  'HomeFix Carpenters', 'TimberPro Services', 'Royal Wood Works',
  'CraftEdge Carpenters', 'Gupta Wood Solutions', 'FineFinish Carpentry',
  'BuildRight Woodworks', 'Nair Furniture Craft', 'ArtWood India',
  'QuickFix Carpenters', 'MasterJoin Woodworks', 'SolidWood Services',
  'Verma Carpentry Co.', 'UrbanWood Craftsmen', 'ClassicJoin India',
  'SmartWood Solutions', 'PerfectFit Carpenters',
];

const categories = {
  'Plumbers': { services: plumbers, icon: 'Wrench', color: 'blue' },
  'Electricians': { services: electricians, icon: 'Zap', color: 'yellow' },
  'Hospitals': { services: hospitals, icon: 'HeartPulse', color: 'rose' },
  'Grocery': { services: grocery, icon: 'ShoppingBag', color: 'emerald' },
  'Courier': { services: courier, icon: 'Truck', color: 'indigo' },
  'Cooks & Catering': { services: cooks, icon: 'ChefHat', color: 'orange' },
  'Pest Control': { services: pestControl, icon: 'Bug', color: 'lime' },
  'Cleaning Services': { services: cleaning, icon: 'Sparkles', color: 'cyan' },
  'Carpenters': { services: carpenters, icon: 'Hammer', color: 'amber' },
};

const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Kolkata', 'Hyderabad', 'Ahmedabad'];

export function generateMockServices(count = 180) {
  const services = [];
  const categoryNames = Object.keys(categories);

  for (let i = 0; i < count; i++) {
    const categoryName = categoryNames[i % categoryNames.length];
    const categoryData = categories[categoryName];
    const nameIndex = Math.floor(i / categoryNames.length) % categoryData.services.length;
    const serviceName = categoryData.services[nameIndex];
    const location = locations[i % locations.length];

    services.push({
      id: i + 1,
      name: serviceName,
      category: categoryName,
      location,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      reviews: Math.floor(Math.random() * 600) + 5,
      trustScore: Math.floor(Math.random() * 25) + 75,
      verified: Math.random() > 0.2,
      price: ['₹500/hr', 'Consultation: ₹1000', '₹300/hr', '₹50/order', '₹200/delivery'][i % 5],
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(serviceName.split(' ')[0])}&background=random&color=fff&size=150`
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
    'Cooks & Catering': getCategoryCount('Cooks & Catering', services),
    'Pest Control': getCategoryCount('Pest Control', services),
    'Cleaning Services': getCategoryCount('Cleaning Services', services),
    'Carpenters': getCategoryCount('Carpenters', services),
  };
}
