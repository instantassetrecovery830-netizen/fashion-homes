
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Area, AreaChart, Legend 
} from 'recharts';
import { 
  Package, Users, DollarSign, Activity, Settings, ToggleRight, 
  Plus, Image as ImageIcon, LayoutDashboard, Shirt, ShoppingBag, 
  ChevronRight, Sparkles, UploadCloud, Trash2, ArrowUpRight, Eye,
  Palette, Layout, Type, FileText, Newspaper, ExternalLink,
  MapPin, Mail, Globe, Instagram, Twitter, Heart, Truck, CheckCircle, AlertCircle, CreditCard,
  UserX, Camera, MessageCircle, Ban, Diamond, Check, Edit2, X, ShieldCheck, ShieldAlert, Shield,
  Power, Lock, MessageSquare, Flag, Store, Grid, Columns, ChevronDown, Loader, Star, Ruler, Save, Video, Menu, Wallet, Banknote, Bitcoin, ArrowLeft, Inbox
} from 'lucide-react';
import { FeatureFlags, UserRole, Product, ViewState, Vendor, Order, SubscriptionStatus, VerificationStatus, User, LandingPageContent, PaymentMethod, ContactSubmission } from '../types';

// Initial Empty Data for real-time start
const SALES_DATA = [
  { name: 'Mon', sales: 0 },
  { name: 'Tue', sales: 0 },
  { name: 'Wed', sales: 0 },
  { name: 'Thu', sales: 0 },
  { name: 'Fri', sales: 0 },
  { name: 'Sat', sales: 0 },
  { name: 'Sun', sales: 0 },
];

const COLORS = ['#0a0a0a', '#C5A059', '#8B8580', '#E5E5E5', '#4A0404'];

interface DashboardProps {
  role: UserRole;
  featureFlags: FeatureFlags;
  toggleFeatureFlag: (key: keyof FeatureFlags) => void;
  onNavigate: (view: ViewState) => void;
  initialTab?: DashboardTab;
  vendors?: Vendor[];
  setVendors?: (vendors: Vendor[]) => void;
  orders?: Order[];
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
  products?: Product[];
  users?: User[];
  onAddProduct?: (product: Product) => Promise<void>;
  onUpdateProduct?: (product: Product) => Promise<void>;
  onDeleteProduct?: (productId: string) => Promise<void>;
  onProductSelect?: (product: Product) => void;
  onUpdateUser?: (user: User) => Promise<void>;
  cmsContent?: LandingPageContent;
  onUpdateCMSContent?: (content: LandingPageContent) => Promise<void>;
  contactSubmissions?: ContactSubmission[];
}

type DashboardTab = 'OVERVIEW' | 'PRODUCTS' | 'UPLOAD' | 'ORDERS' | 'SETTINGS' | 'MARKETPLACE' | 'PROFILE' | 'STORE_DESIGN' | 'SAVED' | 'FULFILLMENT' | 'SUBSCRIPTIONS' | 'FOLLOWERS' | 'SUBSCRIPTION_PLAN' | 'VERIFICATION' | 'USERS' | 'REVIEWS' | 'TRANSACTIONS' | 'STORE_PREVIEW' | 'CMS' | 'PAYOUTS' | 'INBOX';

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '39', '40', '41', '42', 'One Size'];

const SUBSCRIPTION_PLANS = [
  {
    name: "Atelier",
    price: "Free",
    period: "forever",
    description: "For emerging designers starting their digital journey.",
    features: ["5 Product Listings", "Standard Marketplace Visibility", "15% Commission Rate"]
  },
  {
    name: "Maison",
    price: "$299",
    period: "/ month",
    description: "For established brands scaling their presence.",
    features: ["Unlimited Listings", "Priority Placement", "10% Commission Rate", "Analytics"]
  },
  {
    name: "Couture",
    price: "Custom",
    period: "",
    description: "Enterprise solutions for global fashion houses.",
    features: ["0% Commission Rate", "Dedicated Account Manager", "Custom Brand Experience"]
  }
];

export const Dashboard: React.FC<DashboardProps> = ({ 
  role, 
  featureFlags, 
  toggleFeatureFlag, 
  onNavigate, 
  initialTab,
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
  contactSubmissions = []
}) => {
  const isAdmin = role === UserRole.ADMIN;
  const isVendor = role === UserRole.VENDOR;
  const isBuyer = role === UserRole.BUYER;
  
  const currentVendor = isVendor && vendors.length > 0 ? vendors[0] : null;
  
  const isSubscribed = currentVendor?.subscriptionStatus === 'ACTIVE';
  const isVerified = currentVendor?.verificationStatus === 'VERIFIED';

  const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<Product[]>([]); 
  const [followers, setFollowers] = useState<any[]>([]);
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File Input Refs for Uploads
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Editable Profile State
  const [profileForm, setProfileForm] = useState({
    name: currentVendor?.name || '',
    email: currentVendor?.email || '',
    avatar: currentVendor?.avatar || '',
    website: currentVendor?.website || '',
    instagram: currentVendor?.instagram || '',
    twitter: currentVendor?.twitter || ''
  });
  
  // Payment Method State
  const [isAddingPayout, setIsAddingPayout] = useState(false);
  const [payoutForm, setPayoutForm] = useState<Partial<PaymentMethod>>({
      type: 'BANK',
      details: {}
  });
  
  // Admin Vendor Inspection State
  const [selectedVendorForDetails, setSelectedVendorForDetails] = useState<Vendor | null>(null);

  // CMS Form State
  const [cmsForm, setCmsForm] = useState<LandingPageContent | null>(null);

  useEffect(() => {
    if (cmsContent) {
      setCmsForm(cmsContent);
    }
  }, [cmsContent]);

  // Store Design State
  const [storeDesign, setStoreDesign] = useState({
    brandName: currentVendor?.name || '',
    location: currentVendor?.location || '',
    coverImage: currentVendor?.coverImage || '',
    bio: currentVendor?.bio || "",
    theme: 'Editorial',
    layout: 'Grid',
    accentColor: '#000000'
  });
  
  // Form State for Upload / Edit
  const [isEditing, setIsEditing] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Outerwear',
    description: '',
    image: '',
    designer: currentVendor?.name || '', 
    stock: 1, 
    sizes: ['S', 'M', 'L']
  });

  // Filter products for the current vendor view
  const vendorProducts = isVendor 
    ? products.filter(p => p.designer === (currentVendor?.name || ''))
    : products; // Admin sees all

  // Calculate stats dynamically for Vendors/Buyers (Original Logic)
  const stats = useMemo(() => {
    let revenue = 0;
    let activeOrders = 0;
    let clients = new Set<string>();
    
    // Filter orders based on role
    const relevantOrders = isVendor && currentVendor
      ? orders.filter(o => o.items.some(i => i.designer === currentVendor.name))
      : orders;

    relevantOrders.forEach(order => {
       if (isVendor && currentVendor) {
           // Calculate only vendor's share of the revenue
           const vendorItems = order.items.filter(i => i.designer === currentVendor.name);
           revenue += vendorItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
       } else {
           revenue += order.total;
       }
       
       if (order.status !== 'Delivered') activeOrders++;
       clients.add(order.customerName);
    });

    return {
        revenue,
        activeOrders,
        clients: clients.size,
        aov: relevantOrders.length ? revenue / relevantOrders.length : 0
    };
  }, [orders, isVendor, currentVendor]);

  // Admin Specific Stats Calculation
  const adminStats = useMemo(() => {
    if (!isAdmin) return null;

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = totalRevenue / (orders.length || 1);
    const pendingVerifications = vendors.filter(v => v.verificationStatus === 'PENDING').length;

    // Category Distribution
    const categoryCounts: Record<string, number> = {};
    products.forEach(p => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });
    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

    // Top Vendors
    const vendorPerformance: Record<string, number> = {};
    orders.forEach(o => {
        o.items.forEach(item => {
            vendorPerformance[item.designer] = (vendorPerformance[item.designer] || 0) + (item.price * item.quantity);
        });
    });
    const topVendors = Object.entries(vendorPerformance)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    return {
        totalRevenue,
        avgOrderValue,
        pendingVerifications,
        categoryData,
        topVendors
    };
  }, [isAdmin, orders, vendors, products]);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);
  
  useEffect(() => {
    if (currentVendor) {
      setProfileForm({
        name: currentVendor.name,
        email: currentVendor.email || '',
        avatar: currentVendor.avatar,
        website: currentVendor.website || '',
        instagram: currentVendor.instagram || '',
        twitter: currentVendor.twitter || ''
      });
      setStoreDesign(prev => ({
        ...prev,
        brandName: currentVendor.name,
        location: currentVendor.location || '',
        coverImage: currentVendor.coverImage || '',
        bio: currentVendor.bio
      }));
    }
  }, [currentVendor]);

  // Generic File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            onSuccess(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleEditProduct = (product: Product) => {
    setNewProduct(product);
    setIsEditing(true);
    setActiveTab('UPLOAD');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewProduct({ 
      name: '', 
      price: 0, 
      category: 'Outerwear', 
      description: '', 
      image: '', 
      designer: currentVendor?.name || '', 
      stock: 1, 
      sizes: ['S', 'M', 'L'] 
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!currentVendor) {
        alert("Vendor profile not found.");
        setIsSubmitting(false);
        return;
    }

    if (!isSubscribed) {
        alert("Please subscribe to publish products.");
        setIsSubmitting(false);
        return;
    }
    
    if (!isVerified) {
        alert("Your vendor profile must be verified by our team before listing products.");
        setIsSubmitting(false);
        return;
    }

    try {
        if (isEditing && onUpdateProduct && newProduct.id) {
            await onUpdateProduct(newProduct as Product);
            setIsEditing(false);
        } else {
            const product: Product = {
                id: `new-${Date.now()}`,
                name: newProduct.name || 'Untitled Piece',
                price: newProduct.price || 0,
                category: newProduct.category || 'Uncategorized',
                description: newProduct.description || '',
                image: newProduct.image || 'https://picsum.photos/600/800',
                designer: currentVendor.name,
                rating: 0,
                stock: newProduct.stock || 1,
                isNewSeason: true,
                sizes: newProduct.sizes || ['M']
            };
            
            if (onAddProduct) {
                await onAddProduct(product);
            }
        }
        
        setActiveTab('PRODUCTS');
        setNewProduct({ name: '', price: 0, category: 'Outerwear', description: '', image: '', designer: currentVendor?.name || '', stock: 1, sizes: ['S', 'M', 'L'] });
    } catch (err) {
        alert('Failed to save product. Please try again.');
        console.error(err);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleSaveCMS = async () => {
    if (onUpdateCMSContent && cmsForm) {
      setIsSubmitting(true);
      try {
        await onUpdateCMSContent(cmsForm);
        alert('Site content updated successfully!');
      } catch (e) {
        console.error("CMS Update failed", e);
        alert('Failed to update landing page.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCmsImageUpload = (e: React.ChangeEvent<HTMLInputElement>, section: 'auth', field: 'loginImage' | 'registerImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCmsForm(prev => {
            if (!prev) return null;
            return {
                ...prev,
                auth: {
                    ...(prev.auth || { loginImage: '', registerImage: '' }),
                    [field]: result
                }
            }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (currentVendor && setVendors) {
      const updatedVendors = vendors.map(v => 
        v.id === currentVendor.id 
          ? { 
              ...v, 
              name: profileForm.name, 
              email: profileForm.email, 
              avatar: profileForm.avatar,
              website: profileForm.website,
              instagram: profileForm.instagram,
              twitter: profileForm.twitter
            } 
          : v
      );
      setVendors(updatedVendors);
      alert("Profile updated successfully.");
    }
  };
  
  const handleSaveStoreDesign = () => {
     if (currentVendor && setVendors) {
      const updatedVendors = vendors.map(v => 
        v.id === currentVendor.id 
          ? { ...v, name: storeDesign.brandName, bio: storeDesign.bio, location: storeDesign.location, coverImage: storeDesign.coverImage } 
          : v
      );
      setVendors(updatedVendors);
      alert("Storefront updated successfully.");
    }
  };

  // Payment Methods Handling
  const handleAddPaymentMethod = () => {
      if (!currentVendor || !setVendors) return;
      
      const newMethod: PaymentMethod = {
          id: `pm_${Date.now()}`,
          type: payoutForm.type as any,
          details: payoutForm.details as any
      };

      const updatedMethods = [...(currentVendor.paymentMethods || []), newMethod];
      
      const updatedVendors = vendors.map(v => 
        v.id === currentVendor.id 
          ? { ...v, paymentMethods: updatedMethods } 
          : v
      );
      
      setVendors(updatedVendors);
      setIsAddingPayout(false);
      setPayoutForm({ type: 'BANK', details: {} });
  };

  const handleDeletePaymentMethod = (id: string) => {
      if (!currentVendor || !setVendors) return;
      
      const updatedMethods = (currentVendor.paymentMethods || []).filter(pm => pm.id !== id);
      
      const updatedVendors = vendors.map(v => 
        v.id === currentVendor.id 
          ? { ...v, paymentMethods: updatedMethods } 
          : v
      );
      setVendors(updatedVendors);
  };

  const removeFromSaved = (id: string) => {
    setSavedItems(prev => prev.filter(p => p.id !== id));
  };

  const removeFollower = (id: string) => {
    setFollowers(prev => prev.filter(f => f.id !== id));
  };
  
  const blockFollower = (id: string) => {
    setFollowers(prev => prev.map(f => f.id === id ? { ...f, status: 'BLOCKED' } : f));
  };
  
  const toggleUserStatus = async (user: User & { isVendor?: boolean }) => {
     const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
     
     if (user.isVendor && setVendors) {
        // Find vendor and toggle subscription status or verification as a proxy for banning
        // We'll use subscriptionStatus = 'INACTIVE' as suspended
        const vendor = vendors.find(v => v.id === user.id);
        if (vendor) {
           const updatedVendors = vendors.map(v => 
             v.id === user.id 
              ? { ...v, subscriptionStatus: newStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE' } as Vendor
              : v
           );
           setVendors(updatedVendors);
        }
     } else if (!user.isVendor && onUpdateUser) {
        await onUpdateUser({ ...user, status: newStatus as any });
     }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
      // Find user
      const user = users.find(u => u.id === userId);
      if (user && onUpdateUser) {
          await onUpdateUser({ ...user, role: newRole as any });
      }
  };

  const handleSubscriptionToggle = (vendorId: string) => {
    if (!setVendors) return;
    const updatedVendors = vendors.map(v => {
      if (v.id === vendorId) {
        return { ...v, subscriptionStatus: v.subscriptionStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } as Vendor;
      }
      return v;
    });
    setVendors(updatedVendors);
  };
  
  const handleVerificationStatus = (vendorId: string, status: VerificationStatus) => {
    if (!setVendors) return;
    const updatedVendors = vendors.map(v => {
      if (v.id === vendorId) {
        return { ...v, verificationStatus: status } as Vendor;
      }
      return v;
    });
    setVendors(updatedVendors);
  };

  const handleReviewAction = (reviewId: string, action: 'APPROVE' | 'DELETE' | 'FLAG') => {
    if (action === 'DELETE') {
        setAdminReviews(prev => prev.filter(r => r.id !== reviewId));
    } else {
        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'FLAGGED';
        setAdminReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: newStatus } : r));
    }
  };

  const handlePlanChange = (planName: string) => {
      if (currentVendor && setVendors) {
        const updatedVendors = vendors.map(v => {
            if (v.id === currentVendor.id) {
                return { ...v, subscriptionPlan: planName as any, subscriptionStatus: 'ACTIVE' } as Vendor;
            }
            return v;
        });
        setVendors(updatedVendors);
        alert(`Plan switched to ${planName} and subscription activated.`);
    }
  };
  
  // ... Sidebar logic (omitted for brevity as it doesn't change much, but kept in full component)
  const getSidebarItems = () => {
    if (isBuyer) {
      return [
        { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
        { id: 'ORDERS', label: 'My Orders', icon: Package },
        { id: 'SAVED', label: 'Saved Items', icon: Heart },
        { id: 'MARKETPLACE', label: 'Shop Now', icon: ShoppingBag, action: () => onNavigate('MARKETPLACE') },
        { id: 'PROFILE', label: 'Profile', icon: Settings },
      ];
    }
    
    const items: { id: string; label: string; icon: any; action?: () => void }[] = [
      { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
      { id: 'PRODUCTS', label: 'My Collection', icon: Shirt },
      { id: 'UPLOAD', label: 'Add New Piece', icon: Plus },
    ];
    
    if (isVendor) {
      items.push({ id: 'STORE_PREVIEW', label: 'View Live Store', icon: Store });
      items.push({ id: 'FULFILLMENT', label: 'Client Orders', icon: Truck });
      items.push({ id: 'ORDERS', label: 'My Purchases', icon: ShoppingBag });
      items.push({ id: 'PAYOUTS', label: 'Payouts & Wallet', icon: Wallet });
      items.push({ id: 'FOLLOWERS', label: 'Followers', icon: Users });
      items.push({ id: 'STORE_DESIGN', label: 'Design Store', icon: Palette });
      items.push({ id: 'SUBSCRIPTION_PLAN', label: 'My Subscription', icon: Diamond });
      items.push({ id: 'SAVED', label: 'Saved Items', icon: Heart });
      items.push({ id: 'MARKETPLACE', label: 'View Storefront', icon: Eye, action: () => onNavigate('DESIGNERS') });
      items.push({ id: 'PROFILE', label: 'Profile Settings', icon: Settings });
    }
    
    if (isAdmin) {
      items.push({ id: 'CMS', label: 'Content Management', icon: Layout });
      items.push({ id: 'INBOX', label: 'Inbox', icon: Inbox });
      items.push({ id: 'ORDERS', label: 'All Orders', icon: Package });
      items.push({ id: 'VERIFICATION', label: 'Vendor Verification', icon: ShieldCheck });
      items.push({ id: 'SUBSCRIPTIONS', label: 'Subscriptions', icon: Users });
      items.push({ id: 'USERS', label: 'User Management', icon: Users });
      items.push({ id: 'REVIEWS', label: 'Content Moderation', icon: MessageSquare });
      items.push({ id: 'TRANSACTIONS', label: 'Transactions', icon: CreditCard });
      items.push({ id: 'SETTINGS', label: 'Platform Settings', icon: Settings });
    }
    return items;
  };

  const renderSidebar = () => (
    <div className="w-full md:w-64 bg-white border-r border-gray-100 min-h-screen p-6 fixed md:relative z-10 hidden md:block">
      <div className="mb-12">
        <h2 className="text-xl font-serif font-bold italic">MyFitStore</h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{role} Portal</p>
      </div>

      <nav className="space-y-2">
        {getSidebarItems().map((item) => (
          <button
            key={item.id}
            onClick={() => item.action ? item.action() : setActiveTab(item.id as DashboardTab)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
              activeTab === item.id 
                ? 'bg-black text-white shadow-lg' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <item.icon size={16} />
            {item.label}
            {item.id === 'MARKETPLACE' && <ArrowUpRight size={14} className="ml-auto" />}
          </button>
        ))}
      </nav>
      
      {isVendor && (
         <div className="mt-8 space-y-4">
             {!isSubscribed && (
                 <div className="p-4 bg-luxury-gold/10 border border-luxury-gold/20 rounded-sm">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-luxury-gold mb-2">Account Inactive</h4>
                    <p className="text-[10px] text-gray-600 mb-3">Subscribe to publish your items to the marketplace.</p>
                    <button 
                        onClick={() => setActiveTab('SUBSCRIPTION_PLAN')}
                        className="w-full bg-luxury-gold text-white py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors"
                    >
                        View Plans
                    </button>
                 </div>
             )}
             
             {isSubscribed && !isVerified && (
                 <div className="p-4 bg-blue-50 border border-blue-100 rounded-sm">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 flex items-center gap-1"><ShieldCheck size={12}/> Verification Pending</h4>
                     <p className="text-[10px] text-gray-600">Your profile is currently under review by our curation team. Product uploads are disabled until verified.</p>
                 </div>
             )}
         </div>
      )}
    </div>
  );

  const renderInbox = () => (
      <div className="space-y-6 animate-fade-in">
          <h3 className="text-lg font-serif italic mb-4">Messages & Inquiries</h3>
          {contactSubmissions && contactSubmissions.length > 0 ? (
              <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                              <th className="p-4 font-bold uppercase text-xs text-gray-500">Sender</th>
                              <th className="p-4 font-bold uppercase text-xs text-gray-500">Subject</th>
                              <th className="p-4 font-bold uppercase text-xs text-gray-500">Date</th>
                              <th className="p-4 font-bold uppercase text-xs text-gray-500">Status</th>
                              <th className="p-4 font-bold uppercase text-xs text-gray-500 text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {contactSubmissions.map((msg) => (
                              <tr key={msg.id} className="hover:bg-gray-50/50">
                                  <td className="p-4">
                                      <p className="font-bold text-sm">{msg.name}</p>
                                      <p className="text-xs text-gray-400">{msg.email}</p>
                                  </td>
                                  <td className="p-4">
                                      <p className="font-medium text-sm">{msg.subject}</p>
                                      <p className="text-xs text-gray-500 line-clamp-1">{msg.message}</p>
                                  </td>
                                  <td className="p-4 text-xs text-gray-500">
                                      {new Date(msg.date).toLocaleDateString()}
                                  </td>
                                  <td className="p-4">
                                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${msg.status === 'NEW' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                          {msg.status}
                                      </span>
                                  </td>
                                  <td className="p-4 text-right">
                                      <button className="text-xs font-bold underline hover:text-luxury-gold">View</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          ) : (
              <div className="p-12 text-center text-gray-400 border border-dashed border-gray-200 bg-white">
                  <Mail size={32} className="mx-auto mb-4 opacity-50" />
                  <p>No messages in inbox.</p>
              </div>
          )}
      </div>
  );

  const renderOverview = () => {
    // Admin Dashboard View
    if (isAdmin && adminStats) {
        return (
            <div className="space-y-8 animate-fade-in">
                {/* Header & KPI Cards */}
                <div>
                    <h2 className="text-3xl font-serif italic mb-6">System Analytics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Revenue Card */}
                        <div className="bg-luxury-black text-white p-6 shadow-sm">
                            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Total Volume</p>
                            <p className="text-3xl font-bold font-serif italic">${adminStats.totalRevenue.toLocaleString()}</p>
                            <div className="mt-4 text-[10px] flex items-center gap-1 text-green-400">
                                <ArrowUpRight size={10} /> +12.5% vs last week
                            </div>
                        </div>
                        {/* Users Card */}
                        <div className="bg-white border border-gray-100 p-6 shadow-sm">
                            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Total Users</p>
                            <p className="text-3xl font-bold">{users.length.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{vendors.length} Vendors / {users.length - vendors.length} Buyers</p>
                        </div>
                        {/* Orders Card */}
                        <div className="bg-white border border-gray-100 p-6 shadow-sm">
                            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Total Orders</p>
                            <p className="text-3xl font-bold">{orders.length.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 mt-1">Avg. Order: ${adminStats.avgOrderValue.toFixed(0)}</p>
                        </div>
                        {/* Action Card */}
                        <div className="bg-luxury-gold text-white p-6 shadow-sm">
                            <p className="text-xs uppercase tracking-widest text-white/80 mb-1">Pending Actions</p>
                            <p className="text-3xl font-bold">{adminStats.pendingVerifications}</p>
                            <button onClick={() => setActiveTab('VERIFICATION')} className="mt-4 text-[10px] font-bold uppercase underline hover:text-black transition-colors">
                                Review Applications
                            </button>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Area Chart */}
                    <div className="lg:col-span-2 bg-white p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold mb-6">Revenue Trajectory</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={SALES_DATA}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                                    <Tooltip contentStyle={{border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px'}} />
                                    <Area type="monotone" dataKey="sales" stroke="#000000" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Categories Pie Chart */}
                    <div className="bg-white p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold mb-6">Category Split</h3>
                        <div className="h-72 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={adminStats.categoryData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {adminStats.categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                                <span className="text-xs font-bold text-gray-400 uppercase">Mix</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Top Vendors & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold mb-6">Top Performing Ateliers</h3>
                        <div className="space-y-4">
                            {adminStats.topVendors.map((v, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl font-serif italic text-gray-300">0{i+1}</span>
                                        <p className="font-bold text-sm">{v.name}</p>
                                    </div>
                                    <p className="font-mono text-sm">${v.revenue.toLocaleString()}</p>
                                </div>
                            ))}
                            {adminStats.topVendors.length === 0 && <p className="text-gray-400 italic">No sales data yet.</p>}
                        </div>
                    </div>

                    <div className="bg-white p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold mb-6">Recent System Events</h3>
                        <div className="space-y-6">
                            {orders.slice(0, 5).map(o => (
                                <div key={o.id} className="flex items-start gap-3">
                                    <div className="mt-1 p-1.5 bg-green-100 text-green-600 rounded-full">
                                        <DollarSign size={10} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">New Order Recieved</p>
                                        <p className="text-[10px] text-gray-500">Order {o.id} • {o.customerName} • ${o.total}</p>
                                    </div>
                                    <span className="ml-auto text-[10px] text-gray-400">{o.date}</span>
                                </div>
                            ))}
                            {/* Inject some fake events if empty for visual fullness */}
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-1.5 bg-blue-100 text-blue-600 rounded-full">
                                    <Users size={10} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">New User Registration</p>
                                    <p className="text-[10px] text-gray-500">A new buyer joined the platform.</p>
                                </div>
                                <span className="ml-auto text-[10px] text-gray-400">2h ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } 

    // Regular Vendor / Buyer View
    return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-serif italic mb-2">Dashboard Overview</h2>
           <p className="text-gray-500 text-sm">Welcome back, {role === UserRole.VENDOR ? currentVendor?.name : 'Admin'}</p>
        </div>
        <div className="text-right">
           <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Total Revenue</p>
           <p className="text-3xl font-bold">${stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-gray-50 rounded-md"><DollarSign size={20} /></div>
               <span className="text-xs text-gray-400 font-bold">--</span>
            </div>
            <p className="text-2xl font-bold mb-1">${stats.revenue.toLocaleString()}</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Total Sales</p>
         </div>
         <div className="bg-white p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-gray-50 rounded-md"><Package size={20} /></div>
               <span className="text-xs text-gray-400 font-bold">--</span>
            </div>
            <p className="text-2xl font-bold mb-1">{stats.activeOrders}</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Active Orders</p>
         </div>
         <div className="bg-white p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-gray-50 rounded-md"><Users size={20} /></div>
               <span className="text-xs text-gray-400 font-bold">--</span>
            </div>
            <p className="text-2xl font-bold mb-1">{stats.clients}</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Total Clients</p>
         </div>
         <div className="bg-white p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-gray-50 rounded-md"><Activity size={20} /></div>
               <span className="text-xs text-gray-400 font-bold">--</span>
            </div>
            <p className="text-2xl font-bold mb-1">${stats.aov.toFixed(0)}</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Avg. Order Value</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Revenue Analytics</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SALES_DATA}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                     <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                     <Bar dataKey="sales" fill="#000000" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
         
         <div className="bg-white p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
            <div className="space-y-6">
                <p className="text-sm text-gray-400 italic text-center py-12">No recent activity recorded.</p>
            </div>
         </div>
      </div>
    </div>
  );
  };

  const renderProducts = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
          <h2 className="text-2xl font-serif italic">My Collection</h2>
          <button 
            onClick={() => setActiveTab('UPLOAD')}
            className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2"
          >
             <Plus size={16} /> Add New Piece
          </button>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vendorProducts.map((product) => (
             <div key={product.id} className="group bg-white border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="aspect-[3/4] overflow-hidden relative bg-gray-100">
                   <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                   <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="p-2 bg-white text-black hover:bg-black hover:text-white transition-colors"
                      >
                         <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteProduct && onDeleteProduct(product.id)}
                        className="p-2 bg-white text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>
                <div className="p-4">
                   <h3 className="font-bold text-sm mb-1 truncate">{product.name}</h3>
                   <p className="text-xs text-gray-500 mb-3">{product.category}</p>
                   <div className="flex justify-between items-center">
                      <span className="font-mono text-sm">${product.price}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {product.stock > 0 ? 'In Stock' : 'Sold Out'}
                      </span>
                   </div>
                </div>
             </div>
          ))}
          {vendorProducts.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-400 border border-dashed border-gray-200">
                <p>No products found in your collection.</p>
             </div>
          )}
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-luxury-black">
      {/* Mobile Header / Nav Toggle */}
      <div className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-20">
         <div className="flex items-center gap-2">
            <span className="font-serif font-bold italic text-lg">MyFitStore</span>
            <span className="text-[10px] uppercase bg-black text-white px-2 py-0.5 rounded-full">{role}</span>
         </div>
         <button onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-white p-6 animate-fade-in md:hidden overflow-y-auto">
           <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif italic">Menu</h2>
              <button onClick={() => setMobileNavOpen(false)}><X size={24} /></button>
           </div>
           <nav className="space-y-4">
              {getSidebarItems().map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                     if (item.action) item.action();
                     else setActiveTab(item.id as DashboardTab);
                     setMobileNavOpen(false);
                  }}
                  className={`w-full text-left py-3 text-sm font-bold uppercase tracking-widest border-b border-gray-100 ${activeTab === item.id ? 'text-luxury-gold' : 'text-gray-500'}`}
                >
                  <div className="flex items-center gap-3">
                     <item.icon size={18} /> {item.label}
                  </div>
                </button>
              ))}
              <button 
                onClick={() => onNavigate('LANDING')}
                className="w-full text-left py-3 text-sm font-bold uppercase tracking-widest border-b border-gray-100 text-red-500 flex items-center gap-3 mt-8"
              >
                <ArrowLeft size={18} /> Exit Dashboard
              </button>
           </nav>
        </div>
      )}

      {renderSidebar()}

      <div className="flex-1 p-6 md:p-12 overflow-y-auto h-screen">
        {activeTab === 'OVERVIEW' && renderOverview()}
        {activeTab === 'PRODUCTS' && renderProducts()}
        {activeTab === 'UPLOAD' && (
             // Upload Form Logic
             <div className="max-w-2xl mx-auto bg-white p-8 border border-gray-100 shadow-sm animate-fade-in">
                <h2 className="text-2xl font-serif italic mb-6">{isEditing ? 'Edit Piece' : 'New Collection Item'}</h2>
                <form onSubmit={handleUpload} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Product Name</label>
                            <input 
                                required
                                type="text" 
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Price ($)</label>
                            <input 
                                required
                                type="number" 
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Category</label>
                        <select
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                            className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-white"
                        >
                            {['Outerwear', 'Bottoms', 'Knitwear', 'Footwear', 'Accessories'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Description</label>
                        <textarea 
                            required
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none h-32 resize-none"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Stock</label>
                            <input 
                                type="number" 
                                value={newProduct.stock}
                                onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                            />
                        </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Available Sizes</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {STANDARD_SIZES.map(size => (
                                    <button
                                        type="button"
                                        key={size}
                                        onClick={() => {
                                            const currentSizes = newProduct.sizes || [];
                                            const newSizes = currentSizes.includes(size) 
                                                ? currentSizes.filter(s => s !== size)
                                                : [...currentSizes, size];
                                            setNewProduct({...newProduct, sizes: newSizes});
                                        }}
                                        className={`px-3 py-1 text-[10px] border ${
                                            (newProduct.sizes || []).includes(size) 
                                                ? 'bg-black text-white border-black' 
                                                : 'bg-white text-gray-500 border-gray-200'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Product Imagery</label>
                        <div className="border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black transition-colors cursor-pointer relative">
                             {newProduct.image ? (
                                <img src={newProduct.image} alt="Preview" className="h-48 object-contain" />
                             ) : (
                                <>
                                    <ImageIcon size={32} className="mb-2" />
                                    <span className="text-xs uppercase font-bold">Upload Image</span>
                                </>
                             )}
                             <input 
                                type="file" 
                                accept="image/*"
                                ref={productFileInputRef}
                                onChange={(e) => handleFileUpload(e, (base64) => setNewProduct({...newProduct, image: base64}))}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                             />
                        </div>
                    </div>
                    
                    {/* Pre-Order Toggle */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-sm">
                        <button
                            type="button"
                            onClick={() => setNewProduct({...newProduct, isPreOrder: !newProduct.isPreOrder})}
                            className={`w-10 h-6 rounded-full p-1 transition-colors ${newProduct.isPreOrder ? 'bg-luxury-gold' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${newProduct.isPreOrder ? 'translate-x-4' : ''}`} />
                        </button>
                        <div>
                            <p className="text-xs font-bold uppercase">Made-to-Order / Pre-Order</p>
                            <p className="text-[10px] text-gray-500">Enable if this item requires custom measurements or has a lead time.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-1 bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? <Loader className="animate-spin" size={16} /> : (isEditing ? 'Update Product' : 'Publish Product')}
                        </button>
                        {isEditing && (
                             <button 
                                type="button" 
                                onClick={handleCancelEdit}
                                className="px-6 border border-gray-200 text-black text-xs font-bold uppercase tracking-widest hover:border-black transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
             </div>
        )}
        
        {activeTab === 'ORDERS' && (
             <div className="space-y-6 animate-fade-in">
                 <h2 className="text-2xl font-serif italic mb-6">{isAdmin ? 'All Orders' : 'Order History'}</h2>
                 {orders.length === 0 ? (
                     <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200">
                         <p>No orders found.</p>
                     </div>
                 ) : (
                     <div className="space-y-4">
                         {orders.map(order => (
                             <div key={order.id} className="bg-white border border-gray-100 p-6 shadow-sm">
                                 <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4">
                                     <div>
                                         <p className="font-bold text-sm">Order #{order.id}</p>
                                         <p className="text-xs text-gray-400">{order.date}</p>
                                     </div>
                                     <div className="text-right">
                                         <p className="font-bold text-sm">${order.total}</p>
                                         <span className={`text-[10px] font-bold uppercase px-2 py-1 ${
                                             order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                             order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                             'bg-yellow-100 text-yellow-700'
                                         }`}>
                                             {order.status}
                                         </span>
                                     </div>
                                 </div>
                                 <div className="space-y-2">
                                     {order.items.map((item, idx) => (
                                         <div key={idx} className="flex justify-between text-sm">
                                             <span className="text-gray-600">{item.name} x{item.quantity}</span>
                                             <span>${item.price * item.quantity}</span>
                                         </div>
                                     ))}
                                 </div>
                                 {(isAdmin || isVendor) && order.status !== 'Delivered' && (
                                     <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                                         <button 
                                            onClick={() => onUpdateOrderStatus && onUpdateOrderStatus(order.id, 'Shipped')}
                                            className="text-[10px] font-bold uppercase border border-gray-200 px-3 py-1 hover:bg-black hover:text-white transition-colors"
                                         >
                                             Mark Shipped
                                         </button>
                                         <button 
                                            onClick={() => onUpdateOrderStatus && onUpdateOrderStatus(order.id, 'Delivered')}
                                            className="text-[10px] font-bold uppercase border border-gray-200 px-3 py-1 hover:bg-black hover:text-white transition-colors"
                                         >
                                             Mark Delivered
                                         </button>
                                     </div>
                                 )}
                             </div>
                         ))}
                     </div>
                 )}
             </div>
        )}

        {activeTab === 'CMS' && isAdmin && (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-serif italic mb-6">Content Management</h2>
                {cmsForm ? (
                    <div className="bg-white p-6 border border-gray-100 space-y-6">
                         {/* Auth Images */}
                         <div>
                            <h3 className="text-sm font-bold uppercase mb-4">Auth Page Imagery</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Login Image</p>
                                    <div className="relative h-48 bg-gray-100 overflow-hidden group">
                                        <img src={cmsForm.auth?.loginImage} className="w-full h-full object-cover" />
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleCmsImageUpload(e, 'auth', 'loginImage')} />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold uppercase transition-opacity pointer-events-none">Change</div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Register Image</p>
                                    <div className="relative h-48 bg-gray-100 overflow-hidden group">
                                        <img src={cmsForm.auth?.registerImage} className="w-full h-full object-cover" />
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleCmsImageUpload(e, 'auth', 'registerImage')} />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold uppercase transition-opacity pointer-events-none">Change</div>
                                    </div>
                                </div>
                            </div>
                         </div>
                         <button onClick={handleSaveCMS} className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors">
                            {isSubmitting ? <Loader className="animate-spin" size={14}/> : 'Save Changes'}
                         </button>
                    </div>
                ) : <p>Loading CMS...</p>}
            </div>
        )}

        {activeTab === 'PROFILE' && (
            <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
                <h2 className="text-2xl font-serif italic mb-6">Profile Settings</h2>
                <div className="bg-white p-8 border border-gray-100 shadow-sm">
                    <div className="flex justify-center mb-8">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-200 group">
                            <img src={profileForm.avatar || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Camera className="text-white" />
                            </div>
                            <input 
                                type="file" 
                                accept="image/*"
                                ref={avatarFileInputRef}
                                onChange={(e) => handleFileUpload(e, (base64) => setProfileForm({...profileForm, avatar: base64}))}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                             <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Display Name</label>
                             <input 
                                value={profileForm.name}
                                onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                             />
                        </div>
                        <div>
                             <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email</label>
                             <input 
                                value={profileForm.email}
                                onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                             />
                        </div>
                        <button onClick={handleSaveProfile} className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors mt-4">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'INBOX' && renderInbox()}

        {activeTab === 'USERS' && isAdmin && (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-serif italic mb-6">User Management</h2>
                <div className="bg-white border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td className="p-4 flex items-center gap-3">
                                        <img src={u.avatar} className="w-8 h-8 rounded-full bg-gray-100" />
                                        <div>
                                            <p className="font-bold">{u.name}</p>
                                            <p className="text-xs text-gray-400">{u.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4"><span className="text-[10px] font-bold uppercase bg-gray-100 px-2 py-1 rounded-sm">{u.role}</span></td>
                                    <td className="p-4 text-gray-500">{u.joined}</td>
                                    <td className="p-4">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-sm ${u.status === 'ACTIVE' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => toggleUserStatus(u)}
                                            className="text-xs underline hover:text-red-500"
                                        >
                                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
        
        {['STORE_PREVIEW', 'FULFILLMENT', 'PAYOUTS', 'FOLLOWERS', 'STORE_DESIGN', 'SUBSCRIPTION_PLAN', 'SAVED', 'VERIFICATION', 'SUBSCRIPTIONS', 'REVIEWS', 'TRANSACTIONS', 'SETTINGS'].includes(activeTab) && !['OVERVIEW', 'PRODUCTS', 'UPLOAD', 'ORDERS', 'CMS', 'PROFILE', 'INBOX', 'USERS'].includes(activeTab) && (
            <div className="h-full flex items-center justify-center text-gray-400 animate-fade-in">
                 <div className="text-center">
                    <Settings size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-serif italic">This module is under development.</p>
                 </div>
            </div>
        )}

      </div>
    </div>
  );
};
