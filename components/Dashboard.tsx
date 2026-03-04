
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Package, Users, DollarSign, Activity, Settings, LayoutDashboard, Shirt, ShoppingBag, 
  Plus, Trash2, ArrowUpRight,
  Palette, FileText,
  MapPin, Mail, Globe, Instagram, Twitter, Heart, Truck, CheckCircle, AlertCircle, 
  UserX, Camera, MessageCircle, Ban, Diamond, Check, Edit2, X, ShieldCheck, BadgeCheck,
  Lock, MessageSquare, Flag, Store, Grid, ChevronDown, Loader, Star, Save, Menu, Wallet, ArrowLeft, Inbox,
  Phone, Clock, Filter, Search, Facebook, User, ExternalLink, Image as ImageIcon, Video, Type, PieChart as PieChartIcon, LogOut, Upload, Link, Tag, Layers,
  CreditCard, Plane, Info, Calendar, Percent, TrendingUp, Download, Eye, FileCheck, XCircle, AlertTriangle
} from 'lucide-react';
import { FeatureFlags, UserRole, Product, ViewState, Vendor, Order, User as AppUser, LandingPageContent, ContactSubmission, Follower } from '../types.ts';
import { updateUserPassword, auth } from '../services/firebase.ts';

const COLORS = ['#0a0a0a', '#C5A059', '#8B8580', '#E5E5E5', '#4A0404', '#1B2432'];

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
  onUpdateContact?: (id: string, status: 'NEW' | 'READ' | 'ARCHIVED') => Promise<void>;
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
  onUpdateContact,
  initialTab,
  followedVendors = [],
  onToggleFollow,
  onDesignerClick
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'OVERVIEW');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // CMS State
  const [cmsForm, setCmsForm] = useState<LandingPageContent | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('hero');

  // Vendor Storefront State
  const [storefrontForm, setStorefrontForm] = useState<Vendor | null>(null);
  
  // Admin Vendor Review State
  const [selectedVendorForReview, setSelectedVendorForReview] = useState<Vendor | null>(null);

  // Product Management State
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Profile State
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Shipping & Delivery Mock State
  const [shippingSettings, setShippingSettings] = useState({
      processingTime: '3-5 business days',
      domesticRate: 15,
      internationalRate: 45,
      freeShippingThreshold: 500,
      shipsInternationally: true,
      returnPolicy: '14-day return policy for unworn items with original tags. Buyer pays return shipping.'
  });

  // Marketing Mock State
  const [promotions, setPromotions] = useState([
      { id: 1, code: 'WELCOME10', discount: '10%', status: 'ACTIVE', uses: 45 },
      { id: 2, code: 'SUMMER24', discount: '20%', status: 'SCHEDULED', uses: 0 },
      { id: 3, code: 'VIPACCESS', discount: '15%', status: 'EXPIRED', uses: 128 }
  ]);

  // Refs for file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);

  // Update active tab if initialTab changes
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Init CMS Form
  useEffect(() => {
      if (cmsContent) setCmsForm(cmsContent);
  }, [cmsContent]);

  // Init Storefront Form
  useEffect(() => {
    if (role === UserRole.VENDOR && vendors.length > 0 && !storefrontForm) {
        const v = vendors.find(v => v.email === auth.currentUser?.email);
        if (v) setStorefrontForm(v);
    }
  }, [vendors, role, storefrontForm]);

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
        const vendor = vendors.find(v => v.email === currentUser?.email);
        if (!vendor) return [];
        return orders.filter(o => o.items.some(i => i.designer === vendor.name));
    }
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

  const totalRevenue = useMemo(() => myOrders.reduce((sum, order) => sum + order.total, 0), [myOrders]);
  const totalSales = myOrders.length;

  // Chart Data Preparation
  const revenueData = useMemo(() => {
      return myOrders.slice(0, 7).map(o => ({ 
          name: new Date(o.date).toLocaleDateString(undefined, { weekday: 'short' }), 
          amount: o.total 
      })).reverse();
  }, [myOrders]);

  const categoryData = useMemo(() => {
      const data: Record<string, number> = {};
      myOrders.forEach(o => {
          o.items.forEach(i => {
              if (data[i.category]) data[i.category] += 1;
              else data[i.category] = 1;
          });
      });
      return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [myOrders]);
  
  // Handlers for Profile
  const handlePasswordUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPassword) return;
      try {
          if (auth.currentUser) {
              await updateUserPassword(auth.currentUser as any, newPassword);
              setPasswordMsg('Password updated successfully.');
              setNewPassword('');
          }
      } catch (err: any) {
          setPasswordMsg('Error updating password: ' + err.message);
      }
  };

  const handleCMSUpdate = async () => {
      if (cmsForm && onUpdateCMSContent) {
          await onUpdateCMSContent(cmsForm);
          alert("Landing page updated successfully.");
      }
  };

  const handleStorefrontSave = async () => {
    if (storefrontForm && setVendors) {
        try {
            await setVendors([storefrontForm]);
            alert("Storefront updated successfully.");
        } catch (e) {
            console.error(e);
            alert("Failed to update storefront.");
        }
    }
  };

  const handleVerifyVendor = async (vendor: Vendor, status: 'VERIFIED' | 'REJECTED') => {
      if (setVendors) {
          await setVendors([{ ...vendor, verificationStatus: status }]);
          setSelectedVendorForReview(null);
      }
  };

  const handleImageUpload = (file: File, type: 'AVATAR' | 'COVER' | 'GALLERY', index?: number) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          const result = reader.result as string;
          if (storefrontForm) {
              if (type === 'AVATAR') {
                  setStorefrontForm({ ...storefrontForm, avatar: result });
              } else if (type === 'COVER') {
                  setStorefrontForm({ ...storefrontForm, coverImage: result });
              } else if (type === 'GALLERY') {
                   // If index is provided, replace. If not (or -1), add.
                   const currentGallery = [...(storefrontForm.gallery || [])];
                   if (index !== undefined && index >= 0) {
                       currentGallery[index] = result;
                   } else {
                       currentGallery.push(result);
                   }
                   setStorefrontForm({ ...storefrontForm, gallery: currentGallery });
              }
          }
      };
      reader.readAsDataURL(file);
  };

  const removeFromGallery = (index: number) => {
      if (storefrontForm && storefrontForm.gallery) {
          const newGallery = [...storefrontForm.gallery];
          newGallery.splice(index, 1);
          setStorefrontForm({ ...storefrontForm, gallery: newGallery });
      }
  };

  // Product Management Handlers
  const handleProductImageUpload = (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          setProductForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
  };

  const handleSaveProduct = async () => {
      if (!productForm.name || !productForm.price || !productForm.category) {
          alert("Please fill in all required fields.");
          return;
      }

      setIsSavingProduct(true);
      try {
          const currentVendor = role === UserRole.VENDOR ? vendors.find(v => v.email === currentUser?.email) : null;
          
          const newProduct: Product = {
              id: productForm.id || `prod_${Date.now()}`,
              name: productForm.name,
              designer: currentVendor?.name || productForm.designer || 'MyFitStore',
              price: Number(productForm.price),
              category: productForm.category,
              image: productForm.image || 'https://via.placeholder.com/400x600',
              description: productForm.description || '',
              rating: productForm.rating || 5,
              stock: Number(productForm.stock) || 0,
              sizes: Array.isArray(productForm.sizes) ? productForm.sizes : (typeof productForm.sizes === 'string' ? (productForm.sizes as string).split(',').map((s: string) => s.trim()) : ['S', 'M', 'L']),
              isNewSeason: !!productForm.isNewSeason,
              isPreOrder: !!productForm.isPreOrder
          };

          if (productForm.id) {
              if (onUpdateProduct) await onUpdateProduct(newProduct);
          } else {
              if (onAddProduct) await onAddProduct(newProduct);
          }
          
          setIsProductFormOpen(false);
          setProductForm({});
      } catch (e) {
          console.error(e);
          alert("Failed to save product.");
      } finally {
          setIsSavingProduct(false);
      }
  };

  const openProductForm = (product?: Product) => {
      if (product) {
          setProductForm({ ...product });
      } else {
          const currentVendor = role === UserRole.VENDOR ? vendors.find(v => v.email === currentUser?.email) : null;
          setProductForm({
              designer: currentVendor?.name || '',
              category: 'Outerwear',
              stock: 10,
              sizes: ['S', 'M', 'L']
          });
      }
      setIsProductFormOpen(true);
  };

  // Render Sidebar
  const renderSidebar = () => {
    const tabs = [
      { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.VENDOR, UserRole.BUYER] },
      { id: 'ORDERS', label: 'Orders', icon: ShoppingBag, roles: [UserRole.ADMIN, UserRole.VENDOR, UserRole.BUYER] },
      { id: 'PRODUCTS', label: 'Products', icon: Shirt, roles: [UserRole.ADMIN, UserRole.VENDOR] },
      { id: 'STOREFRONT', label: 'Design Store', icon: Palette, roles: [UserRole.VENDOR] },
      { id: 'FINANCE', label: 'Finance', icon: Wallet, roles: [UserRole.VENDOR] },
      { id: 'MARKETING', label: 'Marketing', icon: Tag, roles: [UserRole.VENDOR] },
      { id: 'SUBSCRIPTION', label: 'Subscription', icon: CreditCard, roles: [UserRole.VENDOR] },
      { id: 'SHIPPING', label: 'Delivery', icon: Truck, roles: [UserRole.VENDOR] },
      { id: 'CUSTOMERS', label: 'Customers', icon: Users, roles: [UserRole.ADMIN] },
      { id: 'VENDORS', label: 'Ateliers', icon: Store, roles: [UserRole.ADMIN] },
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
        <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out z-50 w-64 pt-6 md:pt-20 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:translate-x-0 flex flex-col shadow-xl md:shadow-none`}>
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
                    onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); setIsProductFormOpen(false); setSelectedVendorForReview(null); }}
                    className={`w-full flex items-center gap-4 p-3 text-sm font-medium transition-all rounded-sm ${activeTab === tab.id ? 'bg-luxury-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
                >
                    <tab.icon size={18} />
                    <span className="tracking-wide">{tab.label}</span>
                </button>
                ))}
            </div>
            
            <div className="p-6 border-t border-gray-100 space-y-2">
                <button 
                    onClick={() => onNavigate('MARKETPLACE')}
                    className="flex items-center gap-4 text-gray-400 hover:text-black transition-colors w-full p-2 text-sm"
                >
                    <ArrowLeft size={18} />
                    <span className="tracking-wide">Back to Store</span>
                </button>
                <div className="hidden md:block text-center pt-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-300">MyFitStore</span>
                </div>
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
                 <h2 className="text-3xl font-serif italic">Dashboard Overview</h2>
                 <div className="flex gap-4">
                    {role === UserRole.VENDOR && storefrontForm && (
                        <button 
                            onClick={() => onDesignerClick && onDesignerClick(storefrontForm.name)}
                            className="hidden md:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-sm text-xs font-bold uppercase tracking-widest hover:border-black transition-colors"
                        >
                            <ExternalLink size={14} /> Preview Live Boutique
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

                <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm h-96">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                        <PieChartIcon size={14} /> Sales by Category
                    </h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                            <Pie 
                                data={categoryData} 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', fontSize: '12px' }} />
                            <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
             </div>
          </div>
        );

      case 'FINANCE':
          return (
              <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
                  <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-serif italic">Finance & Payouts</h2>
                      <div className="flex gap-4">
                          <button className="bg-luxury-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hidden md:flex items-center gap-2 hover:bg-luxury-gold transition-colors">
                              <Download size={16} /> Export CSV
                          </button>
                          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                              <Menu size={20} />
                          </button>
                      </div>
                  </div>

                  {/* Wallet Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-luxury-black text-white p-8 rounded-sm shadow-lg relative overflow-hidden">
                          <div className="relative z-10">
                              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Available Balance</p>
                              <h3 className="text-4xl font-serif mb-6">${(totalRevenue * 0.85).toLocaleString()}</h3>
                              <button className="bg-white text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-white transition-colors">
                                  Request Payout
                              </button>
                          </div>
                          <div className="absolute -right-6 -bottom-6 text-white/5">
                              <Wallet size={150} />
                          </div>
                      </div>

                      <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-full">
                                  <Clock size={20} />
                              </div>
                              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Pending Clearance</span>
                          </div>
                          <h3 className="text-3xl font-serif">$1,250.00</h3>
                          <p className="text-[10px] text-gray-400 mt-2">Available on Nov 1st</p>
                      </div>

                      <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-green-50 text-green-600 rounded-full">
                                  <TrendingUp size={20} />
                              </div>
                              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Earnings</span>
                          </div>
                          <h3 className="text-3xl font-serif">${totalRevenue.toLocaleString()}</h3>
                          <p className="text-[10px] text-gray-400 mt-2">Lifetime volume</p>
                      </div>
                  </div>

                  {/* Transaction Table */}
                  <div className="bg-white border border-gray-100 overflow-hidden rounded-sm shadow-sm">
                      <div className="p-6 border-b border-gray-100">
                          <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                              <Activity size={14} /> Recent Transactions
                          </h3>
                      </div>
                      <table className="w-full text-left text-sm min-w-full">
                          <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500 font-bold">
                              <tr>
                                  <th className="p-6">Date</th>
                                  <th className="p-6">Description</th>
                                  <th className="p-6">Type</th>
                                  <th className="p-6 text-right">Amount</th>
                                  <th className="p-6 text-center">Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {myOrders.slice(0, 5).map((order) => (
                                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="p-6 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                      <td className="p-6 font-medium">Order #{order.id.slice(-6)}</td>
                                      <td className="p-6"><span className="bg-green-50 text-green-700 px-2 py-1 rounded-sm text-[10px] uppercase font-bold">Sale</span></td>
                                      <td className="p-6 text-right font-mono text-green-600">+${(order.total * 0.85).toFixed(2)}</td>
                                      <td className="p-6 text-center">
                                          <span className="text-green-600 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                                              <CheckCircle size={10} /> Cleared
                                          </span>
                                      </td>
                                  </tr>
                              ))}
                              {/* Mock Payout */}
                              <tr className="hover:bg-gray-50/50 transition-colors">
                                  <td className="p-6 text-gray-500">Oct 15, 2024</td>
                                  <td className="p-6 font-medium">Payout to Bank •••• 4242</td>
                                  <td className="p-6"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-sm text-[10px] uppercase font-bold">Withdrawal</span></td>
                                  <td className="p-6 text-right font-mono text-black">-$2,400.00</td>
                                  <td className="p-6 text-center">
                                      <span className="text-gray-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                                          <CheckCircle size={10} /> Processed
                                      </span>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>
          );

      case 'MARKETING':
          return (
              <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
                  <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-serif italic">Marketing Tools</h2>
                      <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                          <Menu size={20} />
                      </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Create Promo */}
                      <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm h-fit">
                          <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                              <Tag size={14} /> Create Promotion
                          </h3>
                          <div className="space-y-4">
                              <div>
                                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Discount Code</label>
                                  <input className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent uppercase" placeholder="e.g. WINTERSALE" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Discount %</label>
                                      <input type="number" className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent" placeholder="20" />
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Limit (Uses)</label>
                                      <input type="number" className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent" placeholder="100" />
                                  </div>
                              </div>
                              <button className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors mt-4">
                                  Launch Campaign
                              </button>
                          </div>
                      </div>

                      {/* Active Campaigns */}
                      <div className="lg:col-span-2 bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-gray-400">
                                  <Layers size={14} /> Active Campaigns
                              </h3>
                          </div>
                          <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500 font-bold">
                                  <tr>
                                      <th className="p-6">Code</th>
                                      <th className="p-6">Discount</th>
                                      <th className="p-6">Usage</th>
                                      <th className="p-6">Status</th>
                                      <th className="p-6 text-right">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {promotions.map((promo) => (
                                      <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                                          <td className="p-6 font-mono font-bold">{promo.code}</td>
                                          <td className="p-6">{promo.discount} Off</td>
                                          <td className="p-6 text-gray-500">{promo.uses} redemptions</td>
                                          <td className="p-6">
                                              <span className={`px-2 py-1 rounded-sm text-[10px] uppercase font-bold ${
                                                  promo.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 
                                                  promo.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                                              }`}>
                                                  {promo.status}
                                              </span>
                                          </td>
                                          <td className="p-6 text-right">
                                              <button className="text-gray-400 hover:text-red-500 transition-colors">
                                                  <Trash2 size={16} />
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          );

      case 'STOREFRONT':
          if (!storefrontForm) return <div className="p-8"><Loader className="animate-spin text-luxury-gold" /></div>;
          
          return (
            <div className="space-y-8 animate-fade-in pb-20 md:pb-0 max-w-7xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-serif italic">Design Store Editor</h2>
                    <div className="flex gap-4">
                        <button 
                            onClick={handleStorefrontSave}
                            className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors hidden md:block"
                        >
                            Save Changes
                        </button>
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                            <Menu size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Brand & Visuals */}
                    <div className="space-y-8">
                        {/* Brand Identity */}
                        <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                                <BadgeCheck size={14} /> Brand Identity
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Atelier Name</label>
                                    <input 
                                        value={storefrontForm.name} 
                                        onChange={(e) => setStorefrontForm({...storefrontForm, name: e.target.value})}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Location</label>
                                    <div className="relative">
                                        <input 
                                            value={storefrontForm.location} 
                                            onChange={(e) => setStorefrontForm({...storefrontForm, location: e.target.value})}
                                            className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent pl-6"
                                        />
                                        <MapPin size={14} className="absolute left-0 top-2.5 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Bio / Philosophy</label>
                                    <textarea 
                                        value={storefrontForm.bio} 
                                        onChange={(e) => setStorefrontForm({...storefrontForm, bio: e.target.value})}
                                        className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none bg-gray-50 h-32 resize-none"
                                        placeholder="Tell your story..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Visual Assets */}
                        <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                             <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                                <ImageIcon size={14} /> Visual Assets
                            </h3>
                            
                            <div className="flex gap-8 items-start">
                                {/* Avatar */}
                                <div className="text-center">
                                    <div className="relative w-24 h-24 rounded-full bg-gray-50 border border-gray-200 overflow-hidden group cursor-pointer mb-2 mx-auto">
                                        <img src={storefrontForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Camera className="text-white" size={20} />
                                        </div>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            ref={avatarInputRef}
                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'AVATAR')}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400">Profile Logo</span>
                                </div>

                                {/* Cover Image */}
                                <div className="flex-1">
                                     <div className="relative w-full h-24 bg-gray-50 border border-gray-200 overflow-hidden group cursor-pointer mb-2 rounded-sm">
                                        <img src={storefrontForm.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Upload className="text-white" size={20} />
                                        </div>
                                         <input 
                                            type="file" 
                                            accept="image/*"
                                            ref={coverInputRef}
                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'COVER')}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400">Cover Image</span>
                                </div>
                            </div>
                        </div>

                        {/* Theme */}
                         <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                                <Palette size={14} /> Visual Theme
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                {['MINIMALIST', 'DARK', 'GOLD'].map((theme) => (
                                    <button
                                        key={theme}
                                        onClick={() => setStorefrontForm({...storefrontForm, visualTheme: theme as any})}
                                        className={`p-4 border rounded-sm text-xs font-bold uppercase transition-all ${
                                            storefrontForm.visualTheme === theme 
                                            ? 'border-black bg-black text-white' 
                                            : 'border-gray-200 text-gray-500 hover:border-gray-400'
                                        }`}
                                    >
                                        {theme}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Moodboard & Socials */}
                    <div className="space-y-8">
                         {/* Moodboard Gallery */}
                        <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-gray-400">
                                    <Grid size={14} /> Moodboard Gallery
                                </h3>
                                <div className="relative overflow-hidden">
                                     <button className="text-[10px] bg-black text-white px-3 py-1 uppercase font-bold tracking-widest flex items-center gap-1 hover:bg-luxury-gold transition-colors">
                                        <Plus size={12} /> Add Image
                                     </button>
                                     <input 
                                        type="file" 
                                        accept="image/*"
                                        ref={galleryInputRef}
                                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'GALLERY')}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                                {storefrontForm.gallery?.map((img, idx) => (
                                    <div key={idx} className="aspect-square bg-gray-50 relative group overflow-hidden rounded-sm">
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                        <button 
                                            onClick={() => removeFromGallery(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                                {(!storefrontForm.gallery || storefrontForm.gallery.length === 0) && (
                                    <div className="col-span-3 py-8 text-center border border-dashed border-gray-200 rounded-sm text-gray-400 text-xs">
                                        Upload images to showcase your aesthetic.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                                <Link size={14} /> Connections
                            </h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Globe size={14} className="absolute left-0 top-3 text-gray-400" />
                                    <input 
                                        placeholder="Website URL"
                                        value={storefrontForm.website || ''}
                                        onChange={(e) => setStorefrontForm({...storefrontForm, website: e.target.value})}
                                        className="w-full border-b border-gray-200 py-2 pl-6 text-sm focus:border-black outline-none bg-transparent"
                                    />
                                </div>
                                <div className="relative">
                                    <Instagram size={14} className="absolute left-0 top-3 text-gray-400" />
                                    <input 
                                        placeholder="Instagram Handle"
                                        value={storefrontForm.instagram || ''}
                                        onChange={(e) => setStorefrontForm({...storefrontForm, instagram: e.target.value})}
                                        className="w-full border-b border-gray-200 py-2 pl-6 text-sm focus:border-black outline-none bg-transparent"
                                    />
                                </div>
                                <div className="relative">
                                    <Twitter size={14} className="absolute left-0 top-3 text-gray-400" />
                                    <input 
                                        placeholder="Twitter Handle"
                                        value={storefrontForm.twitter || ''}
                                        onChange={(e) => setStorefrontForm({...storefrontForm, twitter: e.target.value})}
                                        className="w-full border-b border-gray-200 py-2 pl-6 text-sm focus:border-black outline-none bg-transparent"
                                    />
                                </div>
                                 <div className="relative">
                                    <Facebook size={14} className="absolute left-0 top-3 text-gray-400" />
                                    <input 
                                        placeholder="Facebook URL"
                                        value={storefrontForm.facebook || ''}
                                        onChange={(e) => setStorefrontForm({...storefrontForm, facebook: e.target.value})}
                                        className="w-full border-b border-gray-200 py-2 pl-6 text-sm focus:border-black outline-none bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:hidden mt-6 pb-20">
                      <button 
                          onClick={handleStorefrontSave}
                          className="w-full bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors"
                      >
                          Save Changes
                      </button>
                  </div>
            </div>
          );

      case 'SUBSCRIPTION':
          if (!storefrontForm) return <div className="p-8"><Loader className="animate-spin text-luxury-gold" /></div>;
          
          return (
              <div className="space-y-8 animate-fade-in pb-20 md:pb-0 max-w-7xl">
                  <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-serif italic">Membership & Plan</h2>
                      <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                          <Menu size={20} />
                      </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm md:col-span-2">
                          <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                              <BadgeCheck size={14} /> Current Status
                          </h3>
                          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-sm mb-6">
                              <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Plan</p>
                                  <p className="text-2xl font-serif italic">{storefrontForm.subscriptionPlan || 'Atelier'}</p>
                              </div>
                              <div className="text-right">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${storefrontForm.subscriptionStatus === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                      {storefrontForm.subscriptionStatus || 'Inactive'}
                                  </span>
                                  <p className="text-[10px] text-gray-400 mt-2">Renews automatically</p>
                              </div>
                          </div>
                          
                          <div className="space-y-4">
                              <h4 className="text-sm font-bold uppercase tracking-wide">Billing History</h4>
                              <div className="border border-gray-100 rounded-sm overflow-hidden">
                                  {[1, 2].map(i => (
                                      <div key={i} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                          <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                                  <FileText size={14} />
                                              </div>
                                              <div>
                                                  <p className="text-xs font-bold">Invoice #{2024000 + i}</p>
                                                  <p className="text-[10px] text-gray-400">Oct {10 - i}, 2024</p>
                                              </div>
                                          </div>
                                          <div className="flex items-center gap-4">
                                              <span className="text-sm font-medium">$165.00</span>
                                              <button className="text-[10px] uppercase font-bold text-luxury-gold hover:underline">Download</button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                          <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                              <CreditCard size={14} /> Payment Method
                          </h3>
                          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-sm mb-4">
                              <div className="w-10 h-6 bg-blue-900 rounded-sm" /> 
                              <div>
                                  <p className="text-xs font-bold">•••• 4242</p>
                                  <p className="text-[10px] text-gray-400">Expires 12/25</p>
                              </div>
                          </div>
                          <button className="w-full border border-black text-black py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                              Update Card
                          </button>
                      </div>
                  </div>

                  <div className="bg-luxury-black text-white p-8 md:p-12 rounded-sm shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                          <div>
                              <h3 className="text-2xl font-serif italic mb-2">Upgrade to Couture Tier</h3>
                              <p className="text-gray-400 text-sm max-w-lg">Unlock white-glove logistics, priority placement in "The Drop", and reduced commission rates.</p>
                          </div>
                          <button className="bg-luxury-gold text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
                              View Plans
                          </button>
                      </div>
                  </div>
              </div>
          );

      case 'SHIPPING':
          if (!storefrontForm) return <div className="p-8"><Loader className="animate-spin text-luxury-gold" /></div>;

          return (
              <div className="space-y-8 animate-fade-in pb-20 md:pb-0 max-w-5xl">
                  <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-serif italic">Delivery & Logistics</h2>
                      <div className="flex gap-4">
                          <button 
                              className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors hidden md:block"
                              onClick={() => alert("Shipping settings saved.")}
                          >
                              Save Settings
                          </button>
                          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                              <Menu size={20} />
                          </button>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                          <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                              <Truck size={14} /> Shipping Zones
                          </h3>
                          
                          <div className="space-y-6">
                              <div>
                                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Dispatch Origin</label>
                                  <input 
                                      value={storefrontForm.location || ''}
                                      disabled
                                      className="w-full bg-gray-50 border border-gray-200 py-3 px-4 text-sm text-gray-500"
                                  />
                                  <p className="text-[10px] text-gray-400 mt-1">Based on your atelier location</p>
                              </div>

                              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                  <div>
                                      <p className="text-sm font-bold">International Shipping</p>
                                      <p className="text-[10px] text-gray-400">Enable worldwide delivery</p>
                                  </div>
                                  <div className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${shippingSettings.shipsInternationally ? 'bg-green-500' : 'bg-gray-200'}`} onClick={() => setShippingSettings({...shippingSettings, shipsInternationally: !shippingSettings.shipsInternationally})}>
                                      <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${shippingSettings.shipsInternationally ? 'translate-x-5' : 'translate-x-0'}`} />
                                  </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Domestic Rate ($)</label>
                                      <input 
                                          type="number"
                                          value={shippingSettings.domesticRate}
                                          onChange={(e) => setShippingSettings({...shippingSettings, domesticRate: Number(e.target.value)})}
                                          className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                      />
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Intl Rate ($)</label>
                                      <input 
                                          type="number"
                                          value={shippingSettings.internationalRate}
                                          onChange={(e) => setShippingSettings({...shippingSettings, internationalRate: Number(e.target.value)})}
                                          disabled={!shippingSettings.shipsInternationally}
                                          className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent disabled:text-gray-300"
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                          <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                              <Clock size={14} /> Processing & Returns
                          </h3>
                          
                          <div className="space-y-6">
                              <div>
                                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Processing Time</label>
                                  <select 
                                      value={shippingSettings.processingTime}
                                      onChange={(e) => setShippingSettings({...shippingSettings, processingTime: e.target.value})}
                                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                  >
                                      <option>1-2 business days</option>
                                      <option>3-5 business days</option>
                                      <option>1-2 weeks (Made to Order)</option>
                                      <option>3-4 weeks (Couture)</option>
                                  </select>
                              </div>

                              <div>
                                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Free Shipping Threshold ($)</label>
                                  <input 
                                      type="number"
                                      value={shippingSettings.freeShippingThreshold}
                                      onChange={(e) => setShippingSettings({...shippingSettings, freeShippingThreshold: Number(e.target.value)})}
                                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                  />
                              </div>

                              <div>
                                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Return Policy</label>
                                  <textarea 
                                      value={shippingSettings.returnPolicy}
                                      onChange={(e) => setShippingSettings({...shippingSettings, returnPolicy: e.target.value})}
                                      className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none bg-gray-50 h-24 resize-none"
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="md:hidden mt-6">
                      <button 
                          className="w-full bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors"
                          onClick={() => alert("Shipping settings saved.")}
                      >
                          Save Settings
                      </button>
                  </div>
              </div>
          );

      case 'ORDERS':
        return (
          <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
             <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-serif italic">Order History</h2>
                 <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                     <Menu size={20} />
                 </button>
             </div>
             
             <div className="bg-white border border-gray-100 overflow-x-auto rounded-sm shadow-sm">
                <table className="w-full text-left text-sm min-w-full">
                   <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500 font-bold border-b border-gray-100">
                      <tr>
                         <th className="p-6">Order ID</th>
                         <th className="p-6">Date</th>
                         <th className="p-6">Customer</th>
                         <th className="p-6">Items</th>
                         <th className="p-6">Total</th>
                         <th className="p-6">Status</th>
                         {role !== UserRole.BUYER && <th className="p-6">Actions</th>}
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {myOrders.map(order => (
                         <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-6 font-medium text-xs font-mono">{order.id}</td>
                            <td className="p-6 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                            <td className="p-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">
                                        {order.customerName.charAt(0)}
                                    </div>
                                    <span className="truncate max-w-[150px]">{order.customerName}</span>
                                </div>
                            </td>
                            <td className="p-6 text-gray-500">{order.items.length} items</td>
                            <td className="p-6 font-bold text-luxury-gold">${order.total}</td>
                            <td className="p-6">
                               <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                  order.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-100' :
                                  order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                  'bg-yellow-50 text-yellow-700 border border-yellow-100'
                               }`}>
                                  {order.status}
                               </span>
                            </td>
                            {role !== UserRole.BUYER && (
                               <td className="p-6">
                                  {onUpdateOrderStatus && order.status !== 'Delivered' && (
                                     <button 
                                        onClick={() => onUpdateOrderStatus(order.id, order.status === 'Processing' ? 'Shipped' : 'Delivered')}
                                        className="text-[10px] uppercase font-bold tracking-wider hover:text-luxury-gold border-b border-transparent hover:border-luxury-gold transition-all"
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
                              <td colSpan={7} className="p-12 text-center text-gray-400">No orders found.</td>
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
                        <h2 className="text-3xl font-serif italic">Products</h2>
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                            <Menu size={20} />
                        </button>
                     </div>
                     {onAddProduct && (
                         <button 
                            onClick={() => openProductForm()}
                            className="bg-luxury-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-luxury-gold transition-colors shadow-lg"
                         >
                             <Plus size={16} /> <span className="hidden md:inline">Add New Piece</span>
                         </button>
                     )}
                 </div>
                 
                 {myProducts.length === 0 ? (
                     <div className="py-20 text-center border border-dashed border-gray-200 rounded-sm">
                         <Shirt size={48} className="mx-auto mb-4 text-gray-200" />
                         <p className="text-gray-400 mb-6">Your collection is empty.</p>
                         <button 
                            onClick={() => openProductForm()}
                            className="text-xs font-bold uppercase tracking-widest underline hover:text-luxury-gold"
                         >
                             Create your first product
                         </button>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                         {myProducts.map(product => (
                             <div key={product.id} className="bg-white border border-gray-100 group relative rounded-sm overflow-hidden hover:shadow-lg transition-shadow">
                                 <div className="aspect-[3/4] bg-gray-50 overflow-hidden relative">
                                     <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                     {product.stock < 5 && (
                                         <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wide">
                                             Low Stock
                                         </div>
                                     )}
                                 </div>
                                 <div className="p-5">
                                     <div className="flex justify-between items-start mb-2">
                                         <h3 className="font-bold text-sm truncate pr-2">{product.name}</h3>
                                         <span className="text-sm font-medium">${product.price}</span>
                                     </div>
                                     <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">{product.category}</p>
                                     <div className="flex justify-between items-center text-[10px] text-gray-400 pt-3 border-t border-gray-50">
                                         <span>{product.stock} units</span>
                                         <span>{product.rating} ★</span>
                                     </div>
                                 </div>
                                 <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                                     <button 
                                        onClick={() => openProductForm(product)}
                                        className="p-2 bg-white rounded-full shadow-md hover:text-luxury-gold transition-colors"
                                     >
                                         <Edit2 size={14} />
                                     </button>
                                     {onDeleteProduct && (
                                         <button onClick={() => onDeleteProduct(product.id)} className="p-2 bg-white rounded-full shadow-md hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                     )}
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
         );

      case 'CUSTOMERS':
          return (
              <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
                  <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-serif italic">Registered Buyers</h2>
                      <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                          <Menu size={20} />
                      </button>
                  </div>
                  
                  <div className="bg-white border border-gray-100 overflow-x-auto rounded-sm shadow-sm">
                      <table className="w-full text-left text-sm min-w-full">
                          <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500 font-bold border-b border-gray-100">
                              <tr>
                                  <th className="p-6">User</th>
                                  <th className="p-6">Email</th>
                                  <th className="p-6">Joined</th>
                                  <th className="p-6">Total Spend</th>
                                  <th className="p-6">Status</th>
                                  <th className="p-6">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {users?.filter(u => u.role === UserRole.BUYER).map(user => (
                                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="p-6 flex items-center gap-4">
                                          <img src={user.avatar || 'https://via.placeholder.com/32'} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="" />
                                          <span className="font-medium">{user.name}</span>
                                      </td>
                                      <td className="p-6 text-gray-600">{user.email}</td>
                                      <td className="p-6 text-gray-500">{new Date(user.joined).toLocaleDateString()}</td>
                                      <td className="p-6 font-mono text-luxury-gold font-bold">{user.spend || '$0.00'}</td>
                                      <td className="p-6">
                                          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full flex w-fit items-center gap-1 ${user.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                              {user.status === 'ACTIVE' && <CheckCircle size={10} />}
                                              {user.status}
                                          </span>
                                      </td>
                                      <td className="p-6">
                                          {onUpdateUser && (
                                              <button 
                                                  onClick={() => onUpdateUser({ ...user, status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })}
                                                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded transition-colors ${
                                                      user.status === 'ACTIVE' 
                                                      ? 'text-red-500 hover:bg-red-50' 
                                                      : 'text-green-500 hover:bg-green-50'
                                                  }`}
                                              >
                                                  {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                              </button>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          );

      case 'VENDORS':
          if (selectedVendorForReview) {
              return (
                  <div className="space-y-8 animate-slide-up pb-20 md:pb-0 max-w-5xl">
                      <button onClick={() => setSelectedVendorForReview(null)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black mb-4">
                          <ArrowLeft size={16} /> Back to List
                      </button>
                      
                      <div className="flex justify-between items-start">
                          <div>
                              <h2 className="text-3xl font-serif italic mb-2">Review Application</h2>
                              <p className="text-gray-500">Review submitted documents and verify vendor identity.</p>
                          </div>
                          <div className="flex gap-4">
                              <button 
                                  onClick={() => handleVerifyVendor(selectedVendorForReview, 'REJECTED')}
                                  className="border border-red-200 text-red-600 px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-colors rounded-sm flex items-center gap-2"
                              >
                                  <XCircle size={16} /> Reject Application
                              </button>
                              <button 
                                  onClick={() => handleVerifyVendor(selectedVendorForReview, 'VERIFIED')}
                                  className="bg-green-600 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-colors rounded-sm flex items-center gap-2"
                              >
                                  <CheckCircle size={16} /> Approve & Verify
                              </button>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Vendor Details */}
                          <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                                  <User size={14} /> Business Details
                              </h3>
                              <div className="space-y-4">
                                  <div className="text-center mb-6">
                                      <img src={selectedVendorForReview.avatar} className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border border-gray-200" alt="" />
                                      <h4 className="font-bold text-lg">{selectedVendorForReview.name}</h4>
                                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border inline-block mt-2 ${
                                          selectedVendorForReview.verificationStatus === 'VERIFIED' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                          selectedVendorForReview.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                      }`}>
                                          {selectedVendorForReview.verificationStatus}
                                      </span>
                                  </div>
                                  <div className="space-y-3 text-sm">
                                      <div>
                                          <p className="text-[10px] font-bold uppercase text-gray-400">Email</p>
                                          <p>{selectedVendorForReview.email}</p>
                                      </div>
                                      <div>
                                          <p className="text-[10px] font-bold uppercase text-gray-400">Location</p>
                                          <p>{selectedVendorForReview.location || 'N/A'}</p>
                                      </div>
                                      <div>
                                          <p className="text-[10px] font-bold uppercase text-gray-400">Website</p>
                                          <p className="text-blue-600 truncate">{selectedVendorForReview.website || 'N/A'}</p>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Documents */}
                          <div className="md:col-span-2 space-y-6">
                              <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                                  <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                                      <FileCheck size={14} /> KYC Documents
                                  </h3>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                          <p className="text-[10px] font-bold uppercase text-gray-400">ID / Passport (Front)</p>
                                          <div className="aspect-video bg-gray-50 border border-gray-200 rounded-sm flex items-center justify-center overflow-hidden relative group">
                                              {selectedVendorForReview.kycDocuments?.idFront ? (
                                                  <img src={selectedVendorForReview.kycDocuments.idFront} className="w-full h-full object-cover" alt="ID Front" />
                                              ) : (
                                                  <div className="text-gray-400 flex flex-col items-center">
                                                      <FileText size={24} className="mb-2" />
                                                      <span className="text-xs">Not Submitted</span>
                                                  </div>
                                              )}
                                              {selectedVendorForReview.kycDocuments?.idFront && (
                                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                      <button className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Eye size={16} /> View</button>
                                                  </div>
                                              )}
                                          </div>
                                      </div>

                                      <div className="space-y-2">
                                          <p className="text-[10px] font-bold uppercase text-gray-400">Proof of Address</p>
                                          <div className="aspect-video bg-gray-50 border border-gray-200 rounded-sm flex items-center justify-center overflow-hidden relative group">
                                               {selectedVendorForReview.kycDocuments?.proofOfAddress ? (
                                                  <img src={selectedVendorForReview.kycDocuments.proofOfAddress} className="w-full h-full object-cover" alt="POA" />
                                              ) : (
                                                  <div className="text-gray-400 flex flex-col items-center">
                                                      <FileText size={24} className="mb-2" />
                                                      <span className="text-xs">Not Submitted</span>
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-sm">
                                  <h4 className="text-yellow-800 font-bold text-sm mb-2 flex items-center gap-2"><AlertTriangle size={16} /> Admin Note</h4>
                                  <p className="text-yellow-700 text-xs leading-relaxed">
                                      Verify that the name on the ID matches the business representative name. Check proof of address is dated within the last 3 months.
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
              );
          }

          return (
              <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
                  <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-serif italic">Atelier Management</h2>
                      <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                          <Menu size={20} />
                      </button>
                  </div>
                  
                  <div className="bg-white border border-gray-100 overflow-x-auto rounded-sm shadow-sm">
                      <table className="w-full text-left text-sm min-w-full">
                          <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500 font-bold border-b border-gray-100">
                              <tr>
                                  <th className="p-6">Brand</th>
                                  <th className="p-6">Email</th>
                                  <th className="p-6">Plan</th>
                                  <th className="p-6">Verification</th>
                                  <th className="p-6">Subscription</th>
                                  <th className="p-6">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {vendors.map(vendor => (
                                  <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="p-6 flex items-center gap-4">
                                          <img src={vendor.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" alt="" />
                                          <div>
                                              <p className="font-bold text-sm uppercase tracking-wide">{vendor.name}</p>
                                              <p className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin size={10} /> {vendor.location || 'Unknown'}</p>
                                          </div>
                                      </td>
                                      <td className="p-6 text-gray-600">{vendor.email}</td>
                                      <td className="p-6">
                                          <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide">{vendor.subscriptionPlan}</span>
                                      </td>
                                      <td className="p-6">
                                          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full flex w-fit items-center gap-1 ${
                                              vendor.verificationStatus === 'VERIFIED' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                                              vendor.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                                          }`}>
                                              {vendor.verificationStatus === 'VERIFIED' && <BadgeCheck size={12} />}
                                              {vendor.verificationStatus}
                                          </span>
                                      </td>
                                      <td className="p-6">
                                          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${vendor.subscriptionStatus === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                              {vendor.subscriptionStatus}
                                          </span>
                                      </td>
                                      <td className="p-6">
                                          <div className="flex gap-3">
                                              {setVendors && (
                                                  <button 
                                                      onClick={() => setSelectedVendorForReview(vendor)}
                                                      className="text-luxury-black hover:bg-gray-50 p-2 rounded-full transition-colors border border-gray-200 hover:border-black"
                                                      title="Review Application"
                                                  >
                                                      <FileText size={16} />
                                                  </button>
                                              )}
                                              {setVendors && (
                                                  <button 
                                                      onClick={() => setVendors && setVendors([{ ...vendor, subscriptionStatus: vendor.subscriptionStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }])}
                                                      className={`p-2 rounded-full transition-colors border border-transparent ${vendor.subscriptionStatus === 'ACTIVE' ? 'text-red-500 hover:bg-red-50 hover:border-red-100' : 'text-green-600 hover:bg-green-50 hover:border-green-100'}`}
                                                      title={vendor.subscriptionStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                                  >
                                                      {vendor.subscriptionStatus === 'ACTIVE' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                  </button>
                                              )}
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          );

      case 'MESSAGES':
          return (
              <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
                  <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-serif italic">Concierge Inbox</h2>
                      <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                          <Menu size={20} />
                      </button>
                  </div>
                  
                  <div className="bg-white border border-gray-100 rounded-sm divide-y divide-gray-100 shadow-sm max-w-5xl">
                      {contactSubmissions.length === 0 ? (
                          <div className="p-12 text-center text-gray-400">No messages found.</div>
                      ) : (
                          contactSubmissions.map(msg => (
                              <div key={msg.id} className={`p-6 transition-colors ${msg.status === 'NEW' ? 'bg-luxury-cream/20' : 'hover:bg-gray-50'}`}>
                                  <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-3">
                                          <div className={`w-2 h-2 rounded-full ${msg.status === 'NEW' ? 'bg-luxury-gold' : 'bg-transparent'}`} />
                                          <div>
                                              <h4 className={`text-sm ${msg.status === 'NEW' ? 'font-bold' : 'font-medium'}`}>{msg.subject}</h4>
                                              <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                  <span className="font-bold text-black">{msg.name}</span> &lt;{msg.email}&gt;
                                              </p>
                                          </div>
                                      </div>
                                      <span className="text-[10px] text-gray-400 uppercase tracking-widest whitespace-nowrap">{new Date(msg.date).toLocaleString()}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-4 leading-relaxed border-l-2 border-gray-100 pl-4 ml-5">
                                      {msg.message}
                                  </p>
                                  <div className="mt-4 flex gap-4 ml-5">
                                      {msg.status === 'NEW' && onUpdateContact && (
                                          <button 
                                              onClick={() => onUpdateContact(msg.id, 'READ')}
                                              className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold hover:underline flex items-center gap-1"
                                          >
                                              <Check size={12} /> Mark Read
                                          </button>
                                      )}
                                      <a href={`mailto:${msg.email}`} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black flex items-center gap-1">
                                          <ArrowUpRight size={12} /> Reply
                                      </a>
                                      {msg.status !== 'ARCHIVED' && onUpdateContact && (
                                          <button 
                                              onClick={() => onUpdateContact(msg.id, 'ARCHIVED')}
                                              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 flex items-center gap-1"
                                          >
                                              <Trash2 size={12} /> Archive
                                          </button>
                                      )}
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          );

      case 'CMS':
          return (
              <div className="space-y-8 animate-fade-in pb-20 md:pb-0 max-w-7xl">
                  <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-serif italic">Content Management</h2>
                      <div className="flex gap-4">
                          <button 
                              onClick={handleCMSUpdate}
                              className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors hidden md:block"
                          >
                              Save All Changes
                          </button>
                          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                              <Menu size={20} />
                          </button>
                      </div>
                  </div>
                  
                  {cmsForm && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left Column */}
                          <div className="space-y-6">
                              {/* Hero Section */}
                              <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                                  <button 
                                    onClick={() => setExpandedSection(expandedSection === 'hero' ? null : 'hero')}
                                    className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                  >
                                    <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Video size={14} /> Hero Section</span>
                                    <ChevronDown size={16} className={`transition-transform ${expandedSection === 'hero' ? 'rotate-180' : ''}`} />
                                  </button>
                                  
                                  {expandedSection === 'hero' && (
                                    <div className="p-6 space-y-4 border-t border-gray-100">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Title Line 1</label>
                                            <input 
                                                value={cmsForm.hero.titleLine1}
                                                onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, titleLine1: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Title Line 2 (Italic)</label>
                                            <input 
                                                value={cmsForm.hero.titleLine2}
                                                onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, titleLine2: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Subtitle</label>
                                            <input 
                                                value={cmsForm.hero.subtitle}
                                                onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, subtitle: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Video URL</label>
                                                <input 
                                                    value={cmsForm.hero.videoUrl}
                                                    onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, videoUrl: e.target.value}})}
                                                    className="w-full border border-gray-200 p-3 text-xs focus:border-black outline-none font-mono text-gray-500 transition-colors bg-gray-50 focus:bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Poster URL</label>
                                                <input 
                                                    value={cmsForm.hero.posterUrl}
                                                    onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, posterUrl: e.target.value}})}
                                                    className="w-full border border-gray-200 p-3 text-xs focus:border-black outline-none font-mono text-gray-500 transition-colors bg-gray-50 focus:bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Button Text</label>
                                            <input 
                                                value={cmsForm.hero.buttonText}
                                                onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, buttonText: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                  )}
                              </div>

                              {/* Sections */}
                              <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                                  <button 
                                    onClick={() => setExpandedSection(expandedSection === 'sections' ? null : 'sections')}
                                    className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                  >
                                    <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Type size={14} /> Sections</span>
                                    <ChevronDown size={16} className={`transition-transform ${expandedSection === 'sections' ? 'rotate-180' : ''}`} />
                                  </button>
                                  
                                  {expandedSection === 'sections' && (
                                    <div className="p-6 space-y-4 border-t border-gray-100">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Marquee Text</label>
                                            <textarea 
                                                value={cmsForm.marquee?.text || ''}
                                                onChange={e => setCmsForm({...cmsForm, marquee: { text: e.target.value }})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white min-h-[80px]"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Designers Title</label>
                                                <input 
                                                    value={cmsForm.designers?.title || ''}
                                                    onChange={e => setCmsForm({...cmsForm, designers: { ...cmsForm.designers, title: e.target.value }})}
                                                    className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Spotlight Title</label>
                                                <input 
                                                    value={cmsForm.spotlight?.title || ''}
                                                    onChange={e => setCmsForm({...cmsForm, spotlight: { title: e.target.value }})}
                                                    className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                  )}
                              </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-6">
                              {/* Campaign */}
                              <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                                  <button 
                                    onClick={() => setExpandedSection(expandedSection === 'campaign' ? null : 'campaign')}
                                    className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                  >
                                    <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14} /> Campaign</span>
                                    <ChevronDown size={16} className={`transition-transform ${expandedSection === 'campaign' ? 'rotate-180' : ''}`} />
                                  </button>
                                  
                                  {expandedSection === 'campaign' && (
                                    <div className="p-6 space-y-4 border-t border-gray-100">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Campaign Title</label>
                                            <input 
                                                value={cmsForm.campaign.title}
                                                onChange={e => setCmsForm({...cmsForm, campaign: {...cmsForm.campaign, title: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Overlay Text</label>
                                            <input 
                                                value={cmsForm.campaign.overlayText1}
                                                onChange={e => setCmsForm({...cmsForm, campaign: {...cmsForm.campaign, overlayText1: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[1, 2, 3, 4].map(num => (
                                                <div key={num}>
                                                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Image {num} URL</label>
                                                    <input 
                                                        // @ts-ignore
                                                        value={cmsForm.campaign[`image${num}`]}
                                                        // @ts-ignore
                                                        onChange={e => setCmsForm({...cmsForm, campaign: {...cmsForm.campaign, [`image${num}`]: e.target.value}})}
                                                        className="w-full border border-gray-200 p-3 text-xs focus:border-black outline-none font-mono text-gray-500 transition-colors bg-gray-50 focus:bg-white"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                  )}
                              </div>

                              {/* About Page */}
                              <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                                  <button 
                                    onClick={() => setExpandedSection(expandedSection === 'about' ? null : 'about')}
                                    className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                  >
                                    <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> About & Contact</span>
                                    <ChevronDown size={16} className={`transition-transform ${expandedSection === 'about' ? 'rotate-180' : ''}`} />
                                  </button>
                                  
                                  {expandedSection === 'about' && (
                                    <div className="p-6 space-y-4 border-t border-gray-100">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Philosophy Text 1</label>
                                            <textarea 
                                                value={cmsForm.about.philosophy.description1}
                                                onChange={e => setCmsForm({...cmsForm, about: {...cmsForm.about, philosophy: {...cmsForm.about.philosophy, description1: e.target.value}}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none h-32 transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Email</label>
                                                <input 
                                                    value={cmsForm.about.contact.email}
                                                    onChange={e => setCmsForm({...cmsForm, about: {...cmsForm.about, contact: {...cmsForm.about.contact, email: e.target.value}}})}
                                                    className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Phone</label>
                                                <input 
                                                    value={cmsForm.about.contact.phone}
                                                    onChange={e => setCmsForm({...cmsForm, about: {...cmsForm.about, contact: {...cmsForm.about.contact, phone: e.target.value}}})}
                                                    className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  )}
                  
                  <div className="md:hidden mt-6">
                      <button 
                          onClick={handleCMSUpdate}
                          className="w-full bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors"
                      >
                          Save Changes
                      </button>
                  </div>
              </div>
          );
      
      case 'FOLLOWING':
          return (
              <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
                  <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-serif italic">Ateliers You Follow</h2>
                      <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                          <Menu size={20} />
                      </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {followedVendors.map(vendor => (
                          <div key={vendor.id} className="bg-white border border-gray-100 p-8 flex flex-col items-center text-center rounded-sm hover:shadow-lg transition-all">
                              <img src={vendor.avatar} alt={vendor.name} className="w-24 h-24 rounded-full object-cover mb-4 border border-gray-100" />
                              <h3 className="font-bold text-lg mb-1">{vendor.name}</h3>
                              <p className="text-xs text-gray-500 mb-6 line-clamp-2 h-8">{vendor.bio}</p>
                              <div className="flex gap-2 w-full mt-auto">
                                  <button 
                                    onClick={() => onDesignerClick && onDesignerClick(vendor.name)}
                                    className="flex-1 bg-black text-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors"
                                  >
                                      View Profile
                                  </button>
                                  {onToggleFollow && (
                                      <button 
                                        onClick={() => onToggleFollow(vendor)}
                                        className="border border-gray-200 px-3 py-3 text-black hover:text-red-500 hover:border-red-500 transition-colors"
                                      >
                                          <X size={16} />
                                      </button>
                                  )}
                              </div>
                          </div>
                      ))}
                      {followedVendors.length === 0 && (
                          <div className="col-span-full text-center py-20 text-gray-400 bg-gray-50 rounded-sm border border-dashed border-gray-200">
                              <Heart size={48} className="mx-auto mb-4 opacity-20" />
                              <p>You are not following any ateliers yet.</p>
                          </div>
                      )}
                  </div>
              </div>
          );

      case 'PROFILE':
        return (
          <div className="max-w-3xl space-y-8 animate-fade-in pb-20 md:pb-0">
             <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-serif italic">Account Settings</h2>
                 <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                     <Menu size={20} />
                 </button>
             </div>
             
             {/* Profile Update */}
             <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2"><User size={14} /> Personal Details</h3>
                <div className="flex items-center gap-8 mb-8">
                    <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-md">
                        {auth.currentUser?.photoURL ? (
                            <img src={auth.currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={32} className="m-auto mt-8 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-xl mb-1">{auth.currentUser?.displayName || 'User'}</p>
                        <p className="text-gray-500 text-sm mb-3">{auth.currentUser?.email}</p>
                        <div className="flex gap-2">
                           <span className="bg-gray-100 text-[10px] px-3 py-1 uppercase tracking-wider font-bold rounded-full border border-gray-200">{role}</span>
                           {auth.currentUser?.emailVerified && <span className="bg-green-50 text-green-700 text-[10px] px-3 py-1 uppercase tracking-wider font-bold flex items-center gap-1 rounded-full border border-green-100"><CheckCircle size={10} /> Verified</span>}
                        </div>
                    </div>
                </div>
             </div>

             {/* Security */}
             <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                 <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2"><Lock size={14} /> Security</h3>
                 <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
                     <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">New Password</label>
                         <input 
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors"
                            placeholder="••••••••"
                         />
                     </div>
                     {passwordMsg && (
                         <div className={`text-xs p-3 rounded-sm flex items-center gap-2 ${passwordMsg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                             {passwordMsg.includes('success') ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                             {passwordMsg}
                         </div>
                     )}
                     <button 
                        type="submit" 
                        disabled={!newPassword}
                        className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                     >
                         Update Password
                     </button>
                 </form>
             </div>
             
             {/* Feature Flags (Admin Only) */}
             {role === UserRole.ADMIN && (
                 <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                     <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2"><Settings size={14} /> System Controls</h3>
                     <div className="space-y-4">
                         {Object.entries(featureFlags).map(([key, value]) => (
                             <div key={key} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                 <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                 <button 
                                    onClick={() => toggleFeatureFlag(key as keyof FeatureFlags)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${value ? 'bg-green-500' : 'bg-gray-200'}`}
                                 >
                                     <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
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
