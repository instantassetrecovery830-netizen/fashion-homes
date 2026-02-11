
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Package, Users, DollarSign, Activity, Settings, LayoutDashboard, Shirt, ShoppingBag, 
  Plus, Trash2, ArrowUpRight,
  Palette, FileText,
  MapPin, Mail, Globe, Instagram, Twitter, Heart, Truck, CheckCircle, AlertCircle, 
  UserX, Camera, MessageCircle, Ban, Diamond, Check, Edit2, X, ShieldCheck, BadgeCheck,
  Lock, MessageSquare, Flag, Store, Grid, ChevronDown, Loader, Star, Save, Menu, Wallet, ArrowLeft, Inbox,
  Phone, Clock, Filter, Search, Facebook, User
} from 'lucide-react';
import { FeatureFlags, UserRole, Product, ViewState, Vendor, Order, User as AppUser, LandingPageContent, ContactSubmission, Follower } from '../types.ts';
import { updateUserPassword, auth } from '../services/firebase.ts';
import { VendorProfileView } from './VendorProfileView.tsx';

const COLORS = ['#0a0a0a', '#C5A059', '#8B8580', '#E5E5E5', '#4A0404'];

interface DashboardProps {
  role: UserRole;
  featureFlags: FeatureFlags;
  toggleFeatureFlag: (key: keyof FeatureFlags) => void;
  onNavigate: (view: ViewState) => void;
  vendors?: Vendor[];
  setVendors?: (vendors: Vendor[]) => Promise<void>;
  orders?: Order[];
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => Promise<void>;
  products?: Product[];
  users?: AppUser[];
  onAddProduct?: (product: Product) => Promise<void>;
  onUpdateProduct?: (product: Product) => Promise<void>;
  onDeleteProduct?: (productId: string) => Promise<void>;
  onProductSelect?: (product: Product) => void;
  onUpdateUser?: (user: AppUser) => Promise<void>;
  cmsContent?: LandingPageContent;
  onUpdateCMSContent?: (content: LandingPageContent) => Promise<void>;
  contactSubmissions?: ContactSubmission[];
  initialTab?: string;
  followedVendors?: Vendor[];
  onToggleFollow?: (vendor: Vendor) => Promise<void>;
  onDesignerClick?: (designerName: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  role,
  featureFlags,
  toggleFeatureFlag,
  onNavigate,
  vendors = [],
  setVendors,
  orders = [],
  onUpdateOrderStatus,
  products = [],
  users = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onProductSelect,
  onUpdateUser,
  cmsContent,
  onUpdateCMSContent,
  contactSubmissions = [],
  initialTab,
  followedVendors = [],
  onToggleFollow,
  onDesignerClick
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'OVERVIEW');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile, logic handled in render
  
  // Profile State
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Update active tab if initialTab changes
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Force sidebar open on desktop mount
  useEffect(() => {
      const handleResize = () => {
          if (window.innerWidth >= 768) {
              setIsSidebarOpen(true);
          } else {
              setIsSidebarOpen(false);
          }
      };
      handleResize(); // Initial check
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentUser = auth.currentUser;
  
  // Filter Data based on Role
  const myOrders = useMemo(() => {
    if (role === UserRole.ADMIN) return orders;
    if (role === UserRole.VENDOR) {
        // Find vendor based on current user email
        const vendor = vendors.find(v => v.email === currentUser?.email);
        if (!vendor) return [];
        // Filter orders that contain items from this vendor
        return orders.filter(o => o.items.some(i => i.designer === vendor.name));
    }
    // Buyer
    return orders.filter(o => o.customerName === currentUser?.email);
  }, [orders, role, vendors, currentUser]);

  const myProducts = useMemo(() => {
    if (role === UserRole.ADMIN) return products;
    if (role === UserRole.VENDOR) {
        const vendor = vendors.find(v => v.email === currentUser?.email);
        if (!vendor) return [];
        return products.filter(p => p.designer === vendor.name);
    }
    return [];
  }, [products, role, vendors, currentUser]);

  // Calculations for Overview
  const totalRevenue = useMemo(() => {
      return myOrders.reduce((sum, order) => sum + order.total, 0);
  }, [myOrders]);

  const totalSales = myOrders.length;
  
  // Handlers for Profile
  const handlePasswordUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPassword) return;
      try {
          if (auth.currentUser) {
              await updateUserPassword(auth.currentUser as any, newPassword); // Type cast for our interface
              setPasswordMsg('Password updated successfully.');
              setNewPassword('');
          }
      } catch (err: any) {
          setPasswordMsg('Error updating password: ' + err.message);
      }
  };

  // Render Sidebar
  const renderSidebar = () => {
    const tabs = [
      { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.VENDOR, UserRole.BUYER] },
      { id: 'ORDERS', label: 'Orders', icon: ShoppingBag, roles: [UserRole.ADMIN, UserRole.VENDOR, UserRole.BUYER] },
      { id: 'PRODUCTS', label: 'Products', icon: Shirt, roles: [UserRole.ADMIN, UserRole.VENDOR] },
      { id: 'CUSTOMERS', label: 'Customers', icon: Users, roles: [UserRole.ADMIN] },
      { id: 'VENDORS', label: 'Vendors', icon: Store, roles: [UserRole.ADMIN] },
      { id: 'MESSAGES', label: 'Messages', icon: Inbox, roles: [UserRole.ADMIN] },
      { id: 'CMS', label: 'Content', icon: FileText, roles: [UserRole.ADMIN] },
      { id: 'FOLLOWING', label: 'Following', icon: Heart, roles: [UserRole.BUYER] },
      { id: 'PROFILE', label: 'Settings', icon: Settings, roles: [UserRole.ADMIN, UserRole.VENDOR, UserRole.BUYER] },
    ];

    return (
      <>
        {/* Mobile Backdrop */}
        <div 
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar Panel */}
        <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out z-50 w-64 pt-6 md:pt-20 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:translate-x-0 flex flex-col`}>
            {/* Mobile Header in Sidebar */}
            <div className="md:hidden px-6 pb-6 flex justify-between items-center border-b border-gray-50">
                <h2 className="text-xl font-serif italic">Dashboard</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {tabs.filter(t => t.roles.includes(role)).map(tab => (
                <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-4 p-3 text-sm font-medium transition-colors rounded-sm ${activeTab === tab.id ? 'bg-luxury-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <tab.icon size={20} />
                    <span>{tab.label}</span>
                </button>
                ))}
            </div>
            
            <div className="p-4 border-t border-gray-100 hidden md:block">
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)} // On desktop this might just collapse to icons (logic simplified here)
                    className="flex items-center gap-4 text-gray-400 hover:text-black transition-colors"
                >
                    <span className="text-xs uppercase tracking-widest w-full text-center">MyFitStore</span>
                </button>
            </div>
        </div>
      </>
    );
  };

  // Render Content
  const renderContent = () => {
    switch (activeTab) {
      case 'OVERVIEW':
        return (
          <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
             <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-serif italic">Dashboard Overview</h2>
                 {/* Mobile Menu Trigger */}
                 <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                     <Menu size={20} />
                 </button>
             </div>
             
             {/* Stats Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Revenue</h3>
                      <DollarSign className="text-luxury-gold" size={20} />
                   </div>
                   <p className="text-3xl font-serif">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Orders</h3>
                      <ShoppingBag className="text-luxury-gold" size={20} />
                   </div>
                   <p className="text-3xl font-serif">{totalSales}</p>
                </div>
                {role !== UserRole.BUYER && (
                  <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Products</h3>
                        <Shirt className="text-luxury-gold" size={20} />
                    </div>
                    <p className="text-3xl font-serif">{myProducts.length}</p>
                  </div>
                )}
             </div>

             {/* Chart (Placeholder) */}
             <div className="bg-white p-6 border border-gray-100 shadow-sm h-80 rounded-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Activity Overview</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={myOrders.slice(0, 7).map(o => ({ name: o.date, amount: o.total }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 10}} />
                        <YAxis tick={{fontSize: 10}} />
                        <Tooltip />
                        <Bar dataKey="amount" fill="#C5A059" />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        );

      case 'ORDERS':
        return (
          <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
             <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-serif italic">Order History</h2>
                 <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                     <Menu size={20} />
                 </button>
             </div>
             
             <div className="bg-white border border-gray-100 overflow-x-auto rounded-sm">
                <table className="w-full text-left text-sm min-w-[600px]">
                   <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500 font-bold">
                      <tr>
                         <th className="p-4">Order ID</th>
                         <th className="p-4">Date</th>
                         <th className="p-4">Customer</th>
                         <th className="p-4">Total</th>
                         <th className="p-4">Status</th>
                         {role !== UserRole.BUYER && <th className="p-4">Actions</th>}
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {myOrders.map(order => (
                         <tr key={order.id} className="hover:bg-gray-50/50">
                            <td className="p-4 font-medium">{order.id}</td>
                            <td className="p-4 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                            <td className="p-4">{order.customerName}</td>
                            <td className="p-4 font-bold">${order.total}</td>
                            <td className="p-4">
                               <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                               }`}>
                                  {order.status}
                               </span>
                            </td>
                            {role !== UserRole.BUYER && (
                               <td className="p-4">
                                  {onUpdateOrderStatus && order.status !== 'Delivered' && (
                                     <button 
                                        onClick={() => onUpdateOrderStatus(order.id, order.status === 'Processing' ? 'Shipped' : 'Delivered')}
                                        className="text-xs underline hover:text-luxury-gold"
                                     >
                                        Mark {order.status === 'Processing' ? 'Shipped' : 'Delivered'}
                                     </button>
                                  )}
                               </td>
                            )}
                         </tr>
                      ))}
                      {myOrders.length === 0 && (
                          <tr>
                              <td colSpan={6} className="p-8 text-center text-gray-400">No orders found.</td>
                          </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        );

      case 'PRODUCTS':
         return (
             <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
                 <div className="flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-serif italic">Products</h2>
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                            <Menu size={20} />
                        </button>
                     </div>
                     {onAddProduct && (
                         <button className="bg-luxury-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-luxury-gold transition-colors">
                             <Plus size={16} /> <span className="hidden md:inline">Add Product</span>
                         </button>
                     )}
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                     {myProducts.map(product => (
                         <div key={product.id} className="bg-white border border-gray-100 group relative rounded-sm overflow-hidden">
                             <div className="aspect-[3/4] bg-gray-50 overflow-hidden">
                                 <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                             </div>
                             <div className="p-4">
                                 <h3 className="font-bold text-sm truncate">{product.name}</h3>
                                 <p className="text-xs text-gray-500 uppercase">{product.category}</p>
                                 <div className="flex justify-between items-center mt-2">
                                     <span className="text-sm font-medium">${product.price}</span>
                                     <span className="text-xs text-gray-400">{product.stock} in stock</span>
                                 </div>
                             </div>
                             <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-2 bg-white rounded-full shadow-md hover:text-luxury-gold"><Edit2 size={14} /></button>
                                 {onDeleteProduct && (
                                     <button onClick={() => onDeleteProduct(product.id)} className="p-2 bg-white rounded-full shadow-md hover:text-red-500"><Trash2 size={14} /></button>
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
         );
      
      case 'FOLLOWING':
          return (
              <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
                  <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-serif italic">Ateliers You Follow</h2>
                      <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                          <Menu size={20} />
                      </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {followedVendors.map(vendor => (
                          <div key={vendor.id} className="bg-white border border-gray-100 p-6 flex flex-col items-center text-center rounded-sm">
                              <img src={vendor.avatar} alt={vendor.name} className="w-20 h-20 rounded-full object-cover mb-4" />
                              <h3 className="font-bold text-lg mb-1">{vendor.name}</h3>
                              <p className="text-xs text-gray-500 mb-4 line-clamp-2">{vendor.bio}</p>
                              <div className="flex gap-2 w-full">
                                  <button 
                                    onClick={() => onDesignerClick && onDesignerClick(vendor.name)}
                                    className="flex-1 bg-black text-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors"
                                  >
                                      View Profile
                                  </button>
                                  {onToggleFollow && (
                                      <button 
                                        onClick={() => onToggleFollow(vendor)}
                                        className="border border-gray-200 px-4 py-3 text-black hover:text-red-500 hover:border-red-500 transition-colors"
                                      >
                                          <X size={16} />
                                      </button>
                                  )}
                              </div>
                          </div>
                      ))}
                      {followedVendors.length === 0 && (
                          <div className="col-span-full text-center py-12 text-gray-400">
                              <Heart size={48} className="mx-auto mb-4 opacity-20" />
                              <p>You are not following any ateliers yet.</p>
                          </div>
                      )}
                  </div>
              </div>
          );

      case 'PROFILE':
        return (
          <div className="max-w-2xl space-y-8 animate-fade-in pb-20 md:pb-0">
             <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-serif italic">Account Settings</h2>
                 <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                     <Menu size={20} />
                 </button>
             </div>
             
             {/* Profile Update */}
             <div className="bg-white p-8 border border-gray-100 rounded-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Personal Details</h3>
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden">
                        {auth.currentUser?.photoURL ? (
                            <img src={auth.currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={32} className="m-auto mt-6 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-lg">{auth.currentUser?.displayName || 'User'}</p>
                        <p className="text-gray-500 text-sm">{auth.currentUser?.email}</p>
                        <div className="mt-2 flex gap-2">
                           <span className="bg-gray-100 text-[10px] px-2 py-1 uppercase tracking-wider font-bold">{role}</span>
                           {auth.currentUser?.emailVerified && <span className="bg-green-50 text-green-700 text-[10px] px-2 py-1 uppercase tracking-wider font-bold flex items-center gap-1"><CheckCircle size={10} /> Verified</span>}
                        </div>
                    </div>
                </div>
             </div>

             {/* Security */}
             <div className="bg-white p-8 border border-gray-100 rounded-sm">
                 <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Security</h3>
                 <form onSubmit={handlePasswordUpdate} className="space-y-4">
                     <div>
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">New Password</label>
                         <input 
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                            placeholder="••••••••"
                         />
                     </div>
                     {passwordMsg && (
                         <p className={`text-xs ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{passwordMsg}</p>
                     )}
                     <button 
                        type="submit" 
                        disabled={!newPassword}
                        className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:opacity-50"
                     >
                         Update Password
                     </button>
                 </form>
             </div>
             
             {/* Feature Flags (Admin Only) */}
             {role === UserRole.ADMIN && (
                 <div className="bg-white p-8 border border-gray-100 rounded-sm">
                     <h3 className="text-sm font-bold uppercase tracking-widest mb-6">System Controls</h3>
                     <div className="space-y-4">
                         {Object.entries(featureFlags).map(([key, value]) => (
                             <div key={key} className="flex justify-between items-center">
                                 <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                 <button 
                                    onClick={() => toggleFeatureFlag(key as keyof FeatureFlags)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${value ? 'bg-green-500' : 'bg-gray-200'}`}
                                 >
                                     <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                                 </button>
                             </div>
                         ))}
                     </div>
                 </div>
             )}
          </div>
        );

      default:
        return <div className="p-8">Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
       {renderSidebar()}
       <div className={`transition-all duration-300 md:ml-64 p-4 md:p-12`}>
           {renderContent()}
       </div>
    </div>
  );
};
