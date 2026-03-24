import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Menu, CheckCircle, XCircle, AlertTriangle, Shirt, ArrowUpRight, DollarSign, ShoppingBag, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { UserRole, Vendor, Product } from '../../types.ts';

interface OverviewViewProps {
  role: UserRole;
  storefrontForm: Vendor | null;
  onDesignerClick: (designerName: string) => void;
  onNavigate: (view: any) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  totalRevenue: number;
  totalSales: number;
  myProducts: Product[];
  revenueData: any[];
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  role,
  storefrontForm,
  onDesignerClick,
  onNavigate,
  setIsSidebarOpen,
  totalRevenue,
  totalSales,
  myProducts,
  revenueData
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-20 md:pb-0"
    >
       <div className="flex items-center justify-between">
           <h2 className="text-3xl font-serif italic">Dashboard Overview</h2>
           <div className="flex gap-4">
              {role === UserRole.VENDOR && storefrontForm && (
                  <button 
                      onClick={() => onDesignerClick && onDesignerClick(storefrontForm.name)}
                      className="flex items-center gap-2 px-3 py-2 md:px-4 border border-gray-200 rounded-sm text-[10px] md:text-xs font-bold uppercase tracking-widest hover:border-black transition-colors"
                  >
                      <ExternalLink size={14} /> 
                      <span className="hidden sm:inline">Preview Live Boutique</span>
                      <span className="sm:hidden">Preview</span>
                  </button>
              )}
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                  <Menu size={20} />
              </button>
           </div>
       </div>

       {/* Vendor Status Banner */}
       {role === UserRole.VENDOR && storefrontForm && (
           <div className={`p-4 rounded-sm border flex items-center gap-4 ${
               storefrontForm.verificationStatus === 'VERIFIED' ? 'bg-green-50 border-green-100 text-green-800' :
               storefrontForm.verificationStatus === 'REJECTED' ? 'bg-red-50 border-red-100 text-red-800' :
               'bg-yellow-50 border-yellow-100 text-yellow-800'
           }`}>
               {storefrontForm.verificationStatus === 'VERIFIED' ? <CheckCircle size={24} /> : 
                storefrontForm.verificationStatus === 'REJECTED' ? <XCircle size={24} /> : 
                <AlertTriangle size={24} />}
               
               <div>
                   <h3 className="font-bold text-sm uppercase tracking-wide">
                       {storefrontForm.verificationStatus === 'VERIFIED' ? 'Account Verified' :
                        storefrontForm.verificationStatus === 'REJECTED' ? 'Verification Failed' :
                        'Verification Pending'}
                   </h3>
                   <p className="text-xs mt-1">
                       {storefrontForm.verificationStatus === 'VERIFIED' ? 'Your atelier is live and verified. You have full access to all features.' :
                        storefrontForm.verificationStatus === 'REJECTED' ? 'Your application was rejected. Please contact support for more details.' :
                        'Your documents are currently under review by our administration team. This usually takes 24-48 hours.'}
                   </p>
               </div>
           </div>
       )}
       
       {/* New Arrivals Management Card - Only for Vendors and Admins */}
       {role !== UserRole.BUYER && (
           <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onNavigate('NEW_ARRIVALS_MANAGE')}>
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-luxury-gold transition-colors">New Arrivals</h3>
                 <div className="p-2 bg-luxury-gold/10 rounded-full text-luxury-gold group-hover:bg-luxury-gold group-hover:text-white transition-colors"><Shirt size={20} /></div>
              </div>
              <p className="text-xl font-serif italic mb-2">Manage Drops</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                  {role === UserRole.ADMIN ? 'Unlimited Access' : '3 Slots Available'} <ArrowUpRight size={12} />
              </p>
           </div>
       )}

       {/* KPIs */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-sm hover:shadow-md transition-shadow">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Revenue</h3>
                <div className="p-2 bg-luxury-gold/10 rounded-full text-luxury-gold"><DollarSign size={20} /></div>
             </div>
             <p className="text-4xl font-serif">${totalRevenue.toLocaleString()}</p>
             <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><ArrowUpRight size={12} /> +12% this month</p>
          </div>
          <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-sm hover:shadow-md transition-shadow">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Orders</h3>
                <div className="p-2 bg-luxury-gold/10 rounded-full text-luxury-gold"><ShoppingBag size={20} /></div>
             </div>
             <p className="text-4xl font-serif">{totalSales}</p>
             <p className="text-xs text-gray-400 mt-2">Processed successfully</p>
          </div>
          {role !== UserRole.BUYER && (
            <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Active Products</h3>
                  <div className="p-2 bg-luxury-gold/10 rounded-full text-luxury-gold"><Shirt size={20} /></div>
              </div>
              <p className="text-4xl font-serif">{myProducts.length}</p>
              <p className="text-xs text-gray-400 mt-2">Live in marketplace</p>
            </div>
          )}
       </div>

       {/* Charts Row */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm h-96">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <Activity size={14} /> Revenue History
              </h3>
              <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                      <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          cursor={{ fill: '#f9fafb' }}
                      />
                      <Bar dataKey="amount" fill="#C5A059" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
              </ResponsiveContainer>
          </div>
       </div>
    </motion.div>
  );
};
