import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Activity, CheckCircle, AlertCircle, Users, BoxSelect } from 'lucide-react';

const mockAnalytics = {
  'All India': {
    demand: [
      { name: 'Jan', demand: 4000, supply: 2400 },
      { name: 'Feb', demand: 3000, supply: 1398 },
      { name: 'Mar', demand: 2000, supply: 3800 },
      { name: 'Apr', demand: 2780, supply: 3908 },
      { name: 'May', demand: 1890, supply: 4800 },
      { name: 'Jun', demand: 2390, supply: 3800 },
      { name: 'Jul', demand: 3490, supply: 4300 },
    ],
    categories: [
      { name: 'Plumbers', value: 400 },
      { name: 'Electricians', value: 300 },
      { name: 'Brokers', value: 300 },
      { name: 'Hospitals', value: 200 },
    ],
    stats: [
      { title: 'Total Active Requests', value: '24,592', change: '+12%', icon: Activity, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
      { title: 'Average Trust Score', value: '94.2', change: '+2.4%', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
      { title: 'Identified Service Gaps', value: '143 areas', change: '-5.2%', icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/30' },
      { title: 'Verified Providers', value: '12,045', change: '+18%', icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    ]
  },
  'Maharashtra': {
    demand: [
      { name: 'Jan', demand: 1200, supply: 800 },
      { name: 'Feb', demand: 1500, supply: 900 },
      { name: 'Mar', demand: 1800, supply: 1100 },
      { name: 'Apr', demand: 2200, supply: 1300 },
    ],
    categories: [
      { name: 'Plumbers', value: 150 },
      { name: 'Electricians', value: 200 },
      { name: 'Brokers', value: 180 },
      { name: 'Hospitals', value: 80 },
    ],
    stats: [
      { title: 'Total Active Requests', value: '8,245', change: '+6%', icon: Activity, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
      { title: 'Average Trust Score', value: '96.1', change: '+1.1%', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
      { title: 'Identified Service Gaps', value: '24 areas', change: '-2.0%', icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/30' },
      { title: 'Verified Providers', value: '4,102', change: '+9%', icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    ]
  }
};

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e'];

export default function Analytics() {
  const [region, setRegion] = useState('All India');
  
  // Safe fallback if mapping doesn't exist
  const currentData = mockAnalytics[region] || mockAnalytics['All India'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">Smart Analytics Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Real-time insights on service demand, pricing trends, and area coverage.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 px-4 shadow-sm">
          <BoxSelect size={18} className="text-indigo-600 dark:text-indigo-400" />
          <select 
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-transparent border-none text-sm font-medium focus:ring-0 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="All India">All India</option>
            <option value="Maharashtra">Maharashtra</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentData.stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} mix-blend-multiply opacity-50 filter blur-xl`} />
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/50' : 'text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/50'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-500" />
                Demand vs Supply Trends
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Predictive analysis based on historical data.</p>
            </div>
          </div>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart data={currentData.demand} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="demand" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
                <Area type="monotone" dataKey="supply" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorSupply)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Secondary Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Service Distribution</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={currentData.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {currentData.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }}/>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text overlay for pie chart could go here */}
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-500" />
              Service Gap Detected
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">High demand for <strong>Electricians</strong> in <em>Pune South</em> but low verified supply. Recommendation: Target provider onboarding in this region.</p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
