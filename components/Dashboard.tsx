import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid 
} from 'recharts';
import { 
  Package, Users, DollarSign, Activity, Settings, ToggleRight, 
  Plus, Image as ImageIcon, LayoutDashboard, Shirt, ShoppingBag, 
  ChevronRight, Sparkles, UploadCloud, Trash2, ArrowUpRight, Eye,
  Palette, Layout, Type, FileText, Newspaper, ExternalLink,
  MapPin, Mail, Globe, Instagram, Twitter, Heart, Truck, CheckCircle, AlertCircle, CreditCard,
  UserX, Camera, MessageCircle, Ban, Diamond, Check, Edit2, X, ShieldCheck, ShieldAlert, Shield,
  Power, Lock, MessageSquare, Flag, Store, Grid, Columns, ChevronDown
} from 'lucide-react';
import { FeatureFlags, UserRole, Product, ViewState, Vendor, Order, SubscriptionStatus, VerificationStatus } from '../types';
import { MOCK_PRODUCTS } from '../constants';

const SALES_DATA = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

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
  onAddProduct?: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onProductSelect?: (product: Product) => void;
}

type DashboardTab = 'OVERVIEW' | 'PRODUCTS' | 'UPLOAD' | 'ORDERS' | 'SETTINGS' | 'MARKETPLACE' | 'PROFILE' | 'STORE_DESIGN' | 'SAVED' | 'FULFILLMENT' | 'SUBSCRIPTIONS' | 'FOLLOWERS' | 'SUBSCRIPTION_PLAN' | 'VERIFICATION' | 'USERS' | 'REVIEWS' | 'TRANSACTIONS' | 'STORE_PREVIEW';

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '39', '40', '41', '42', 'One Size'];

const MOCK_FOLLOWERS = [
  { id: 'f1', name: 'Sophie L.', handle: '@sophie_style', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop', since: 'Oct 2023', status: 'ACTIVE' },
  { id: 'f2', name: 'Arthur B.', handle: '@art_b', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop', since: 'Nov 2023', status: 'ACTIVE' },
  { id: 'f3', name: 'Chloé M.', handle: '@chloe_paris', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop', since: 'Dec 2023', status: 'ACTIVE' },
  { id: 'f4', name: 'James D.', handle: '@jd_design', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop', since: 'Jan 2024', status: 'ACTIVE' },
];

const MOCK_USERS_LIST = [
  { id: 'u0', name: 'Admin', email: 'instantassetrecovery830@gmail.com', role: 'ADMIN', status: 'ACTIVE', joined: 'Jan 2024', spend: '-', location: 'Global' },
  { id: 'u1', name: 'Alice V.', email: 'alice@example.com', role: 'BUYER', status: 'ACTIVE', joined: 'Oct 2023', spend: '$12,450', location: 'New York, USA' },
  { id: 'u2', name: 'James B.', email: 'james@example.com', role: 'BUYER', status: 'ACTIVE', joined: 'Nov 2023', spend: '$8,200', location: 'London, UK' },
  { id: 'u3', name: 'Elena K.', email: 'elena@example.com', role: 'BUYER', status: 'SUSPENDED', joined: 'Dec 2023', spend: '$1,500', location: 'Moscow, RU' },
  { id: 'u4', name: 'Marc D.', email: 'marc@example.com', role: 'BUYER', status: 'ACTIVE', joined: 'Jan 2024', spend: '$24,000', location: 'Paris, FR' },
];

const MOCK_ADMIN_REVIEWS = [
  { id: 'r1', productId: 'p1', productName: 'Asymmetric Silk Trench', author: 'Elena K.', rating: 5, content: 'The fabric quality is unmatched. Fits perfectly.', status: 'APPROVED', date: '2023-10-24' },
  { id: 'r2', productId: 'p2', productName: 'Obsidian Cargo Pant', author: 'Marc D.', rating: 2, content: 'Stitching came loose after two wears. Disappointed given the price point.', status: 'FLAGGED', date: '2023-10-22' },
  { id: 'r3', productId: 'p4', productName: 'Void Runner Sneakers', author: 'Sophie L.', rating: 5, content: 'Absolute fire. Comfortable and stylish.', status: 'APPROVED', date: '2023-10-20' },
  { id: 'r4', productId: 'p1', productName: 'Asymmetric Silk Trench', author: 'Bot_User_99', rating: 1, content: 'SCAM SITE DO NOT BUY CLICK LINK HERE', status: 'PENDING', date: '2023-10-25' },
];

const MOCK_TRANSACTIONS = [
  { id: 'tx_8823', date: '2023-10-24', customer: 'Alice V.', vendor: 'Maison Margaux', amount: 1250.00, platformFee: 187.50, status: 'CLEARED' },
  { id: 'tx_8824', date: '2023-10-22', customer: 'James B.', vendor: 'KAIZEN Studios', amount: 890.00, platformFee: 133.50, status: 'CLEARED' },
  { id: 'tx_8825', date: '2023-10-25', customer: 'Elena K.', vendor: 'Studio Null', amount: 1500.00, platformFee: 225.00, status: 'PENDING' },
];

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
  products = MOCK_PRODUCTS,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onProductSelect
}) => {
  const isAdmin = role === UserRole.ADMIN;
  const isVendor = role === UserRole.VENDOR;
  const isBuyer = role === UserRole.BUYER;
  
  // Assume current vendor is Maison Margaux for demo purposes if logged in as Vendor
  const currentVendor = isVendor ? vendors.find(v => v.name === 'Maison Margaux') : null;
  const isSubscribed = currentVendor?.subscriptionStatus === 'ACTIVE';
  const isVerified = currentVendor?.verificationStatus === 'VERIFIED';

  const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');
  const [savedItems, setSavedItems] = useState<Product[]>(products.slice(0, 3)); 
  const [followers, setFollowers] = useState(MOCK_FOLLOWERS);
  const [users, setUsers] = useState(MOCK_USERS_LIST);
  const [adminReviews, setAdminReviews] = useState(MOCK_ADMIN_REVIEWS);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);

  // Editable Profile State
  const [profileForm, setProfileForm] = useState({
    name: currentVendor?.name || '',
    email: currentVendor?.email || 'contact@lumierre.com',
    avatar: currentVendor?.avatar || '',
    website: currentVendor?.website || '',
    instagram: currentVendor?.instagram || '',
    twitter: currentVendor?.twitter || ''
  });

  // Store Design State
  const [storeDesign, setStoreDesign] = useState({
    brandName: currentVendor?.name || 'Maison Margaux',
    location: currentVendor?.location || 'Paris, France',
    coverImage: currentVendor?.coverImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070',
    bio: currentVendor?.bio || "Founded in 2023...",
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
    designer: currentVendor?.name || 'Maison Margaux', 
    stock: 1,
    sizes: ['S', 'M', 'L']
  });

  // Filter products for the current vendor view
  const vendorProducts = isVendor 
    ? products.filter(p => p.designer === (currentVendor?.name || 'Maison Margaux'))
    : products; // Admin sees all (or logic could differ)

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (currentVendor) {
      setProfileForm({
        name: currentVendor.name,
        email: currentVendor.email || 'contact@lumierre.com',
        avatar: currentVendor.avatar,
        website: currentVendor.website || '',
        instagram: currentVendor.instagram || '',
        twitter: currentVendor.twitter || ''
      });
      setStoreDesign(prev => ({
        ...prev,
        brandName: currentVendor.name,
        location: currentVendor.location || 'Paris, France',
        coverImage: currentVendor.coverImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070',
        bio: currentVendor.bio
      }));
    }
  }, [currentVendor]);

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
      designer: currentVendor?.name || 'Maison Margaux', 
      stock: 1, 
      sizes: ['S', 'M', 'L'] 
    });
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSubscribed) {
        alert("Please subscribe to publish products.");
        return;
    }
    
    if (!isVerified) {
        alert("Your vendor profile must be verified by our team before listing products.");
        return;
    }

    if (isEditing && onUpdateProduct && newProduct.id) {
        onUpdateProduct(newProduct as Product);
        setIsEditing(false);
    } else {
        const product: Product = {
            id: `new-${Date.now()}`,
            name: newProduct.name || 'Untitled Piece',
            price: newProduct.price || 0,
            category: newProduct.category || 'Uncategorized',
            description: newProduct.description || '',
            image: newProduct.image || 'https://picsum.photos/600/800',
            designer: currentVendor?.name || 'Maison Margaux',
            rating: 0,
            stock: newProduct.stock || 1,
            isNewSeason: true,
            sizes: newProduct.sizes || ['M']
        };
        
        if (onAddProduct) {
            onAddProduct(product);
        }
    }
    
    setActiveTab('PRODUCTS');
    setNewProduct({ name: '', price: 0, category: 'Outerwear', description: '', image: '', designer: currentVendor?.name || 'Maison Margaux', stock: 1, sizes: ['S', 'M', 'L'] });
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

  const removeFromSaved = (id: string) => {
    setSavedItems(prev => prev.filter(p => p.id !== id));
  };

  const removeFollower = (id: string) => {
    setFollowers(prev => prev.filter(f => f.id !== id));
  };
  
  const blockFollower = (id: string) => {
    setFollowers(prev => prev.map(f => f.id === id ? { ...f, status: 'BLOCKED' } : f));
  };
  
  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u));
  };

  const handleRoleUpdate = (userId: string, newRole: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
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
  
  const handleSubscriptionPlanUpdate = (vendorId: string, newPlan: any) => {
    if (!setVendors) return;
    const updatedVendors = vendors.map(v => {
      if (v.id === vendorId) {
        return { ...v, subscriptionPlan: newPlan } as Vendor;
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

  const handleVendorSelfSubscribe = () => {
    if (currentVendor && setVendors) {
        const updatedVendors = vendors.map(v => {
            if (v.id === currentVendor.id) {
                return { ...v, subscriptionStatus: 'ACTIVE' } as Vendor;
            }
            return v;
        });
        setVendors(updatedVendors);
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
    
    // Base items for Vendor/Admin
    const items: { id: string; label: string; icon: any; action?: () => void }[] = [
      { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
      { id: 'PRODUCTS', label: 'My Collection', icon: Shirt },
      { id: 'UPLOAD', label: 'Add New Piece', icon: Plus },
    ];
    
    if (isVendor) {
      items.push({ id: 'STORE_PREVIEW', label: 'View Live Store', icon: Store });
      items.push({ id: 'FULFILLMENT', label: 'Client Orders', icon: Truck });
      items.push({ id: 'ORDERS', label: 'My Purchases', icon: ShoppingBag });
      items.push({ id: 'FOLLOWERS', label: 'Followers', icon: Users });
      items.push({ id: 'STORE_DESIGN', label: 'Design Store', icon: Palette });
      items.push({ id: 'SUBSCRIPTION_PLAN', label: 'My Subscription', icon: Diamond });
      items.push({ id: 'SAVED', label: 'Saved Items', icon: Heart });
      items.push({ id: 'MARKETPLACE', label: 'View Storefront', icon: Eye, action: () => onNavigate('DESIGNERS') });
      items.push({ id: 'PROFILE', label: 'Profile Settings', icon: Settings });
    }
    
    if (isAdmin) {
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
        <h2 className="text-xl font-serif font-bold italic">Atelier.</h2>
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

  const renderSubscriptionPlan = () => (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
        <h3 className="text-xl font-serif italic mb-6">Subscription Plan</h3>
        <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-gray-500">
                Current Plan: <span className="font-bold text-black uppercase">{currentVendor?.subscriptionPlan || 'None'}</span>
            </p>
            {!isSubscribed && (
                 <span className="bg-red-100 text-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    Subscription Expired
                 </span>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan, idx) => {
                const isCurrentPlan = currentVendor?.subscriptionPlan === plan.name;
                // It is the active plan if it matches AND the subscription is active.
                const isActivePlan = isCurrentPlan && isSubscribed;
                
                return (
                    <div key={idx} className={`border p-6 relative flex flex-col ${isActivePlan ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                        {isActivePlan && <div className="absolute top-0 right-0 bg-black text-white px-2 py-1 text-[10px] uppercase font-bold">Active</div>}
                        <h4 className="text-lg font-serif italic mb-2">{plan.name}</h4>
                        <p className="text-2xl font-bold mb-4">{plan.price}<span className="text-xs font-normal text-gray-500">{plan.period}</span></p>
                        <ul className="text-xs text-gray-500 space-y-2 mb-6 flex-1">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex gap-2">
                                    <Check size={12} className="text-luxury-gold mt-0.5" /> {f}
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={() => handlePlanChange(plan.name)}
                            disabled={isActivePlan} 
                            className={`w-full py-3 text-xs font-bold uppercase tracking-widest ${
                                isActivePlan 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-black text-white hover:bg-luxury-gold'
                            }`}
                        >
                            {isActivePlan ? 'Current Plan' : (isCurrentPlan && !isSubscribed ? 'Renew Plan' : 'Switch Plan')}
                        </button>
                    </div>
                );
            })}
        </div>
    </div>
  );

  const renderFulfillment = () => {
    // Filter orders to only those containing items from the current vendor
    const vendorOrders = orders.filter(order => 
       order.items.some(item => item.designer === currentVendor?.name)
    ).map(order => ({
        ...order,
        // Only show items relevant to this vendor
        items: order.items.filter(item => item.designer === currentVendor?.name)
    }));

    return (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
       <h3 className="text-xl font-serif italic mb-2">Order Fulfillment</h3>
       <p className="text-gray-500 text-sm mb-8">Manage logistics and delivery status for your clientele.</p>
       
       <div className="space-y-4">
          {vendorOrders.map((order) => (
              <div key={order.id} className="border border-gray-100 p-6 rounded-sm flex flex-col md:flex-row justify-between items-start gap-6">
                 <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="font-bold text-lg">{order.id}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">{order.date}</span>
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded ${
                            order.status === 'Delivered' ? 'bg-green-50 text-green-700' : 
                            order.status === 'Shipped' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                            {order.status}
                        </span>
                    </div>
                    <p className="text-sm font-bold mb-4">Client: {order.customerName}</p>
                    <div className="space-y-2">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-2">
                                <img src={item.image} className="w-10 h-10 object-cover" alt="product"/>
                                <div>
                                    <p className="text-xs font-bold uppercase">{item.name}</p>
                                    <p className="text-[10px] text-gray-500">Size: {item.size} | Qty: {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
                 
                 <div className="w-full md:w-48 shrink-0">
                    <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">Update Status</label>
                    <select 
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus && onUpdateOrderStatus(order.id, e.target.value as any)}
                        className="w-full p-2 border border-gray-200 text-sm focus:border-black outline-none mb-2"
                    >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                    </select>
                    <button className="w-full bg-black text-white py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-800">
                        Print Label
                    </button>
                 </div>
              </div>
          ))}
          {vendorOrders.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                  <p>No active orders to fulfill.</p>
              </div>
          )}
       </div>
    </div>
    );
  };

  const renderFollowers = () => (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
        <h3 className="text-xl font-serif italic mb-2">Community & Followers</h3>
        <p className="text-gray-500 text-sm mb-8">Manage your brand's audience.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followers.map(follower => (
                <div key={follower.id} className={`border p-6 flex items-center justify-between group transition-colors ${follower.status === 'BLOCKED' ? 'bg-gray-50 border-gray-100 opacity-50' : 'border-gray-100 hover:border-black'}`}>
                    <div className="flex items-center gap-4">
                        <img src={follower.avatar} alt={follower.name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                            <p className="font-bold text-sm">{follower.name}</p>
                            <p className="text-xs text-gray-400">{follower.handle}</p>
                            <p className="text-[10px] text-gray-300 mt-1">Joined {follower.since}</p>
                            {follower.status === 'BLOCKED' && <span className="text-[10px] text-red-500 font-bold uppercase">Blocked</span>}
                        </div>
                    </div>
                    {follower.status !== 'BLOCKED' && (
                        <div className="flex gap-2">
                             <button className="text-gray-300 hover:text-black transition-colors p-2" title="Message">
                                <MessageCircle size={16} />
                            </button>
                             <button 
                                onClick={() => blockFollower(follower.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                title="Block User"
                            >
                                <Ban size={16} />
                            </button>
                            <button 
                                onClick={() => removeFollower(follower.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                title="Remove Follower"
                            >
                                <UserX size={16} />
                            </button>
                        </div>
                    )}
                </div>
            ))}
             {followers.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400">
                  <p>No followers yet.</p>
              </div>
          )}
        </div>
    </div>
  );

  const renderVerification = () => (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
        <h3 className="text-xl font-serif italic mb-8">Vendor Verification Queue</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-gray-100">
                    <tr>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Vendor</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Details</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {vendors.map((vendor) => (
                        <tr key={vendor.id}>
                            <td className="py-4">
                                <div className="flex items-center gap-3">
                                    <img src={vendor.avatar} className="w-8 h-8 rounded-full object-cover" alt={vendor.name} />
                                    <div>
                                        <p className="font-bold text-sm">{vendor.name}</p>
                                        <p className="text-[10px] text-gray-400">{vendor.email}</p>
                                    </div>
                                </div>
                            </td>
                             <td className="py-4">
                                <p className="text-xs text-gray-600 mb-1"><span className="font-bold">Loc:</span> {vendor.location}</p>
                                <p className="text-[10px] text-gray-400">{vendor.bio.substring(0, 40)}...</p>
                            </td>
                            <td className="py-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                                    vendor.verificationStatus === 'VERIFIED' ? 'bg-blue-50 text-blue-700' :
                                    vendor.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-700' : 
                                    'bg-yellow-50 text-yellow-700'
                                }`}>
                                    {vendor.verificationStatus}
                                </span>
                            </td>
                            <td className="py-4 text-right">
                                <div className="flex justify-end gap-2">
                                     <button 
                                        onClick={() => handleVerificationStatus(vendor.id, 'VERIFIED')}
                                        className="p-1 text-green-500 hover:bg-green-50 rounded" title="Approve"
                                     >
                                        <CheckCircle size={16} />
                                     </button>
                                     <button 
                                        onClick={() => handleVerificationStatus(vendor.id, 'PENDING')}
                                        className="p-1 text-yellow-500 hover:bg-yellow-50 rounded" title="Set Pending"
                                     >
                                        <Shield size={16} />
                                     </button>
                                     <button 
                                        onClick={() => handleVerificationStatus(vendor.id, 'REJECTED')}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded" title="Reject"
                                     >
                                        <Ban size={16} />
                                     </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
  
  const renderUsers = () => (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
        <h3 className="text-xl font-serif italic mb-8">User & Role Management</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-gray-100">
                    <tr>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">User</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Role</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Location</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Lifetime Spend</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{user.name}</p>
                                        <p className="text-[10px] text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4">
                                <div className="relative">
                                    <select 
                                        value={user.role}
                                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                        className="bg-transparent border-b border-gray-200 text-xs font-bold uppercase py-1 pr-6 focus:border-black outline-none cursor-pointer hover:border-luxury-gold transition-colors appearance-none"
                                    >
                                        <option value="BUYER">Buyer</option>
                                        <option value="VENDOR">Vendor</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown size={12} />
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 text-sm text-gray-500">{user.location}</td>
                             <td className="py-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                                    user.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                    {user.status}
                                </span>
                            </td>
                            <td className="py-4 text-sm font-bold">{user.spend}</td>
                            <td className="py-4 text-right">
                                <button 
                                    onClick={() => toggleUserStatus(user.id)}
                                    className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                                        user.status === 'ACTIVE' 
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                                    }`}
                                >
                                    {user.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderSubscriptions = () => (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
        <h3 className="text-xl font-serif italic mb-8">Manage Vendor Subscriptions</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-gray-100">
                    <tr>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Vendor</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Plan</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Verified</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {vendors.map((vendor) => (
                        <tr key={vendor.id}>
                            <td className="py-4">
                                <div className="flex items-center gap-3">
                                    <img src={vendor.avatar} className="w-8 h-8 rounded-full object-cover" alt={vendor.name} />
                                    <span className="font-bold text-sm">{vendor.name}</span>
                                </div>
                            </td>
                            <td className="py-4">
                                <select
                                    value={vendor.subscriptionPlan || 'Atelier'}
                                    onChange={(e) => handleSubscriptionPlanUpdate(vendor.id, e.target.value)}
                                    className="bg-gray-50 border border-gray-200 text-xs font-bold uppercase p-2 rounded outline-none focus:border-black cursor-pointer hover:border-black transition-colors"
                                >
                                    {SUBSCRIPTION_PLANS.map(p => (
                                        <option key={p.name} value={p.name}>{p.name}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="py-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                                    vendor.subscriptionStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {vendor.subscriptionStatus}
                                </span>
                            </td>
                            <td className="py-4">
                                {vendor.verificationStatus === 'VERIFIED' ? 
                                    <span className="text-blue-500 flex items-center gap-1 text-xs"><ShieldCheck size={14} /> Verified</span> : 
                                    <span className="text-gray-300 text-xs">{vendor.verificationStatus}</span>
                                }
                            </td>
                            <td className="py-4 text-right">
                                <button 
                                    onClick={() => handleSubscriptionToggle(vendor.id)}
                                    className="text-xs font-bold underline hover:text-luxury-gold"
                                >
                                    {vendor.subscriptionStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
  
  const renderReviews = () => (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
        <h3 className="text-xl font-serif italic mb-8">Content Moderation & Reviews</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-gray-100">
                    <tr>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Content</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Product</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Rating</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {adminReviews.map((review) => (
                        <tr key={review.id}>
                            <td className="py-4 max-w-xs">
                                <p className="text-sm font-bold mb-1">{review.author}</p>
                                <p className="text-xs text-gray-600 italic">"{review.content}"</p>
                                <p className="text-[10px] text-gray-400 mt-1">{review.date}</p>
                            </td>
                             <td className="py-4">
                                <span className="text-xs font-bold uppercase">{review.productName}</span>
                                <p className="text-[10px] text-gray-400">ID: {review.productId}</p>
                            </td>
                            <td className="py-4">
                                <div className="flex text-luxury-gold">
                                    {[...Array(5)].map((_, i) => (
                                         <Heart key={i} size={10} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-gray-200'} />
                                    ))}
                                </div>
                            </td>
                            <td className="py-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                                    review.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                                    review.status === 'FLAGGED' ? 'bg-red-50 text-red-700' : 
                                    'bg-yellow-50 text-yellow-700'
                                }`}>
                                    {review.status}
                                </span>
                            </td>
                            <td className="py-4 text-right">
                                <div className="flex justify-end gap-2">
                                     {review.status !== 'APPROVED' && (
                                         <button 
                                            onClick={() => handleReviewAction(review.id, 'APPROVE')}
                                            className="text-green-500 hover:bg-green-50 p-1 rounded" title="Approve"
                                        >
                                            <CheckCircle size={14} />
                                        </button>
                                     )}
                                     <button 
                                        onClick={() => handleReviewAction(review.id, 'FLAG')}
                                        className="text-yellow-500 hover:bg-yellow-50 p-1 rounded" title="Flag"
                                    >
                                        <Flag size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleReviewAction(review.id, 'DELETE')}
                                        className="text-red-500 hover:bg-red-50 p-1 rounded" title="Remove"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
        <h3 className="text-xl font-serif italic mb-8">Transactions Ledger</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-gray-100">
                    <tr>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Transaction ID</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Parties</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Amount</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Commission (15%)</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {transactions.map((tx) => (
                        <tr key={tx.id}>
                            <td className="py-4">
                                <p className="text-xs font-mono font-bold">{tx.id}</p>
                                <p className="text-[10px] text-gray-400">{tx.date}</p>
                            </td>
                            <td className="py-4">
                                <p className="text-xs font-bold">{tx.vendor}</p>
                                <p className="text-[10px] text-gray-500">Buyer: {tx.customer}</p>
                            </td>
                            <td className="py-4 text-sm font-medium">${tx.amount.toFixed(2)}</td>
                            <td className="py-4 text-sm font-medium text-green-600">+${tx.platformFee.toFixed(2)}</td>
                            <td className="py-4 text-right">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                                    tx.status === 'CLEARED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                                }`}>
                                    {tx.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
  
  const renderProfile = () => (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
      <h3 className="text-xl font-serif italic mb-8">Profile & Settings</h3>
      
      {isVendor && (
          <div className="mb-8 p-6 bg-gray-50 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-1">Account Status</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                       <span className={`flex items-center gap-1 ${isSubscribed ? 'text-green-600' : 'text-red-500'}`}>
                           <CheckCircle size={14} /> {isSubscribed ? 'Subscription Active' : 'Subscription Inactive'}
                       </span>
                       <span className={`flex items-center gap-1 ${isVerified ? 'text-blue-600' : 'text-yellow-600'}`}>
                           {isVerified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />} 
                           {isVerified ? 'Verified Designer' : `Verification: ${currentVendor?.verificationStatus}`}
                       </span>
                  </div>
              </div>
              <div className="flex gap-4">
                  {!isSubscribed && (
                      <button 
                        onClick={() => setActiveTab('SUBSCRIPTION_PLAN')}
                        className="bg-luxury-gold text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                      >
                          Subscribe Now
                      </button>
                  )}
              </div>
          </div>
      )}

      {/* Standard Profile Fields */}
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-gray-50">
          <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden shrink-0">
             <img src={profileForm.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200"} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-bold text-lg">{role === 'VENDOR' ? profileForm.name : 'Jane Doe'}</h4>
            <p className="text-gray-400 text-sm mb-2">{role}</p>
            <button 
              onClick={() => alert("Image upload mock: Please change the URL in the Settings for now.")}
              className="text-xs font-bold uppercase tracking-widest bg-gray-100 px-4 py-2 hover:bg-black hover:text-white transition-colors"
            >
              Change Avatar
            </button>
          </div>
        </div>
        
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
             <label className="text-xs text-gray-500 uppercase tracking-widest">Display Name</label>
             <input 
                type="text" 
                value={profileForm.name} 
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full p-3 border border-gray-200 bg-gray-50 text-sm focus:border-black outline-none" 
             />
           </div>
           <div className="space-y-2">
             <label className="text-xs text-gray-500 uppercase tracking-widest">Email Address</label>
             <input 
                type="email" 
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full p-3 border border-gray-200 bg-gray-50 text-sm focus:border-black outline-none" 
             />
           </div>
        </div>
        
        {/* Social Links Section */}
        <div className="pt-6 border-t border-gray-50">
           <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Social & Web</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest">Website</label>
                 <div className="flex items-center border border-gray-200 bg-gray-50">
                    <Globe size={14} className="ml-3 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="https://"
                        value={profileForm.website} 
                        onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                        className="w-full p-3 bg-transparent text-sm focus:outline-none" 
                     />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest">Instagram</label>
                 <div className="flex items-center border border-gray-200 bg-gray-50">
                    <Instagram size={14} className="ml-3 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="@username"
                        value={profileForm.instagram} 
                        onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                        className="w-full p-3 bg-transparent text-sm focus:outline-none" 
                     />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest">Twitter</label>
                  <div className="flex items-center border border-gray-200 bg-gray-50">
                    <Twitter size={14} className="ml-3 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="@username"
                        value={profileForm.twitter} 
                        onChange={(e) => setProfileForm({ ...profileForm, twitter: e.target.value })}
                        className="w-full p-3 bg-transparent text-sm focus:outline-none" 
                     />
                 </div>
               </div>
           </div>
        </div>

        <button 
            onClick={handleSaveProfile}
            className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors"
        >
            Save Changes
        </button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
        <h3 className="text-xl font-serif italic mb-6">Platform Settings</h3>
        
        <div className="space-y-6">
            <div className="p-6 bg-gray-50 border border-gray-100">
                <h4 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={16} /> Feature Flags
                </h4>
                <div className="space-y-4">
                    {Object.entries(featureFlags).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-white border border-gray-200">
                             <div>
                                <p className="text-xs font-bold uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="text-[10px] text-gray-500">Enable or disable this module globally.</p>
                             </div>
                             <button 
                                onClick={() => toggleFeatureFlag(key as keyof FeatureFlags)}
                                className={`w-12 h-6 rounded-full relative transition-colors ${value ? 'bg-black' : 'bg-gray-300'}`}
                             >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-7' : 'left-1'}`} />
                             </button>
                        </div>
                    ))}
                </div>
            </div>
             
             <div className="p-6 bg-red-50 border border-red-100">
                <h4 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-red-600">
                    <AlertCircle size={16} /> Danger Zone
                </h4>
                <div className="flex items-center justify-between">
                     <div>
                        <p className="text-xs font-bold uppercase tracking-wide">System Reset</p>
                        <p className="text-[10px] text-gray-500">Clear all temporary caches and restart services.</p>
                     </div>
                     <button className="bg-white border border-red-200 text-red-500 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">
                        Restart
                     </button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '$45,231', icon: DollarSign, trend: '+12%' },
          { label: 'Active Orders', value: '12', icon: Package, trend: '+2' },
          { label: 'Total Clients', value: '1,203', icon: Users, trend: '+5%' },
          { label: 'Avg. Order Value', value: '$340', icon: Activity, trend: '-1%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-xs text-gray-400 uppercase tracking-widest">{stat.label}</p>
                 <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
               </div>
               <div className="p-2 bg-gray-50 rounded-full text-gray-400">
                 <stat.icon size={18} />
               </div>
            </div>
            <p className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {stat.trend} <span className="text-gray-300 font-normal">vs last month</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="bg-white p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-serif italic mb-6">Revenue Analytics</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChartComponent data={SALES_DATA} />
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-6 border border-gray-100 shadow-sm">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-serif italic">Recent Activity</h3>
             <button className="text-xs uppercase text-gray-400 hover:text-black">View All</button>
           </div>
           <div className="space-y-6">
             {[1, 2, 3].map((_, i) => (
               <div key={i} className="flex gap-4 items-start pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <ShoppingBag size={16} />
                 </div>
                 <div>
                   <p className="text-sm font-bold">New order #ORD-29{i}</p>
                   <p className="text-xs text-gray-500">2 minutes ago</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
        <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-serif italic">My Collection</h3>
              <p className="text-gray-500 text-sm mt-1">Manage your active listings and inventory.</p>
            </div>
            <button 
              onClick={() => setActiveTab('UPLOAD')}
              className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2"
            >
              <Plus size={14} /> Add Piece
            </button>
        </div>

        {vendorProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-gray-50 border-2 border-dashed border-gray-200 rounded-sm">
            <Shirt size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest mb-2">No items in collection</p>
            <p className="text-xs mb-6">Start by uploading your first piece.</p>
            <button 
              onClick={() => setActiveTab('UPLOAD')}
              className="text-xs underline hover:text-black"
            >
              Upload Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400 pl-4">Product</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Price</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Stock</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Category</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vendorProducts.map((product) => (
                  <tr key={product.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-gray-100 overflow-hidden">
                           <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-black">{product.name}</p>
                          <p className="text-[10px] text-gray-400">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm">${product.price}</td>
                    <td className="py-4">
                       <span className={`text-xs font-bold px-2 py-1 rounded ${product.stock < 5 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                         {product.stock} Units
                       </span>
                    </td>
                    <td className="py-4 text-xs uppercase tracking-wide text-gray-500">{product.category}</td>
                    <td className="py-4 pr-4 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => handleEditProduct(product)}
                           className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all"
                           title="Edit"
                         >
                           <Edit2 size={14} />
                         </button>
                         <button 
                           onClick={() => onDeleteProduct && onDeleteProduct(product.id)}
                           className="p-2 hover:bg-white hover:shadow-md rounded-full text-red-500 transition-all"
                           title="Delete"
                         >
                           <Trash2 size={14} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );

  const renderUpload = () => (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up max-w-3xl mx-auto">
        <h3 className="text-xl font-serif italic mb-2">{isEditing ? 'Edit Masterpiece' : 'Upload New Piece'}</h3>
        <p className="text-gray-500 text-sm mb-8">Complete the details below to list your item on the marketplace.</p>

        <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest">Product Name</label>
                    <input 
                      required
                      type="text" 
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full p-3 border border-gray-200 bg-gray-50 text-sm focus:border-black outline-none" 
                      placeholder="e.g. Deconstructed Wool Coat"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest">Category</label>
                    <select 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full p-3 border border-gray-200 bg-gray-50 text-sm focus:border-black outline-none"
                    >
                      <option>Outerwear</option>
                      <option>Bottoms</option>
                      <option>Knitwear</option>
                      <option>Footwear</option>
                      <option>Accessories</option>
                      <option>Clothing</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest">Price ($)</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                      className="w-full p-3 border border-gray-200 bg-gray-50 text-sm focus:border-black outline-none" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest">Stock Qty</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-200 bg-gray-50 text-sm focus:border-black outline-none" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest">Image URL</label>
                    <div className="flex gap-2">
                         <input 
                          type="text" 
                          value={newProduct.image}
                          onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                          className="w-full p-3 border border-gray-200 bg-gray-50 text-sm focus:border-black outline-none" 
                          placeholder="https://..."
                        />
                        <button type="button" className="p-3 bg-gray-100 hover:bg-black hover:text-white transition-colors">
                           <UploadCloud size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase tracking-widest">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full p-3 border border-gray-200 bg-gray-50 text-sm focus:border-black outline-none resize-none" 
                  placeholder="Describe the materials, fit, and design philosophy..."
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                    {STANDARD_SIZES.map(size => (
                        <button
                           key={size}
                           type="button"
                           onClick={() => {
                               const currentSizes = newProduct.sizes || [];
                               const newSizes = currentSizes.includes(size) 
                                 ? currentSizes.filter(s => s !== size)
                                 : [...currentSizes, size];
                               setNewProduct({...newProduct, sizes: newSizes});
                           }}
                           className={`px-4 py-2 text-xs font-bold border ${
                               (newProduct.sizes || []).includes(size)
                               ? 'bg-black text-white border-black'
                               : 'bg-white text-gray-500 border-gray-200 hover:border-black'
                           } transition-all`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                <button 
                  type="submit"
                  className="flex-1 bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors"
                >
                  {isEditing ? 'Update Listing' : 'Publish to Marketplace'}
                </button>
                {isEditing && (
                    <button 
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-8 py-4 border border-gray-200 text-xs font-bold uppercase tracking-widest hover:border-black transition-colors"
                    >
                      Cancel
                    </button>
                )}
            </div>
        </form>
    </div>
  );

  const renderOrders = () => {
    // Filter logic based on role
    // For Vendor, orders that contain at least one item from them (already filtered in Fulfillment but here we can show overview)
    // For Buyer, their own orders (assuming MOCK_ORDERS are theirs for now as we don't have full auth id match)
    // For Admin, all orders.
    
    // Simplification for demo:
    let displayOrders = orders;
    if (isVendor) {
         displayOrders = orders.filter(order => order.items.some(item => item.designer === currentVendor?.name));
    } else if (isBuyer) {
        // Just show all mock orders for demo "My Orders"
    }

    return (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
        <h3 className="text-xl font-serif italic mb-8">Order History</h3>
        
        {displayOrders.length === 0 ? (
           <div className="text-center py-12 text-gray-400">
               <p>No orders found.</p>
           </div>
        ) : (
        <div className="space-y-6">
            {displayOrders.map((order) => (
                <div key={order.id} className="border border-gray-100 p-6 rounded-sm">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 pb-6 border-b border-gray-50 gap-4">
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                               <span className="font-bold text-lg">{order.id}</span>
                               <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded ${
                                   order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                   order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                               }`}>
                                   {order.status}
                               </span>
                           </div>
                           <p className="text-xs text-gray-400 uppercase tracking-widest">{order.date}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total</p>
                           <p className="text-xl font-serif italic">${order.total}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {order.items.map((item, i) => (
                           <div key={i} className="flex gap-4 items-center">
                               <div className="w-12 h-16 bg-gray-100 shrink-0">
                                   <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                               </div>
                               <div className="flex-1">
                                   <p className="text-sm font-bold">{item.name}</p>
                                   <p className="text-xs text-gray-500">{item.designer} | Size: {item.size}</p>
                               </div>
                               <div className="text-sm font-medium">
                                   ${item.price}
                               </div>
                           </div> 
                        ))}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-50 flex justify-end gap-4">
                        <button className="text-xs font-bold underline hover:text-luxury-gold">View Invoice</button>
                        <button className="text-xs font-bold underline hover:text-luxury-gold">Track Shipment</button>
                    </div>
                </div>
            ))}
        </div>
        )}
    </div>
    );
  };

  const renderStoreDesign = () => (
      <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
        <h3 className="text-xl font-serif italic mb-6">Storefront Customization</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest">Brand Name</label>
                    <input 
                      type="text" 
                      value={storeDesign.brandName}
                      onChange={(e) => setStoreDesign({...storeDesign, brandName: e.target.value})}
                      className="w-full p-3 border border-gray-200 bg-gray-50 text-sm focus:border-black outline-none" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest">Bio / Manifesto</label>
                    <textarea 
                      rows={5}
                      value={storeDesign.bio}
                      onChange={(e) => setStoreDesign({...storeDesign, bio: e.target.value})}
                      className="w-full p-3 border border-gray-200 bg-gray-50 text-sm focus:border-black outline-none resize-none" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest">Location</label>
                    <input 
                      type="text" 
                      value={storeDesign.location}
                      onChange={(e) => setStoreDesign({...storeDesign, location: e.target.value})}
                      className="w-full p-3 border border-gray-200 bg-gray-50 text-sm focus:border-black outline-none" 
                    />
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest">Cover Image</label>
                    <div className="aspect-[2/1] bg-gray-100 overflow-hidden relative group">
                        <img src={storeDesign.coverImage} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button className="bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-widest">Change Image</button>
                        </div>
                    </div>
                    <input 
                      type="text" 
                      value={storeDesign.coverImage}
                      onChange={(e) => setStoreDesign({...storeDesign, coverImage: e.target.value})}
                      className="w-full p-3 border border-gray-200 bg-gray-50 text-xs text-gray-400 focus:border-black outline-none mt-2" 
                      placeholder="Image URL"
                    />
                </div>
            </div>
        </div>

        {/* Visual Identity Section */}
        <div className="mt-12 pt-8 border-t border-gray-100">
            <h4 className="text-lg font-serif italic mb-6">Visual Identity</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Theme Selection */}
                <div>
                    <label className="text-xs text-gray-500 uppercase tracking-widest mb-4 block">Aesthetic Theme</label>
                    <div className="space-y-4">
                        {['Editorial', 'Minimalist', 'Avant-Garde'].map((theme) => (
                            <button
                                key={theme}
                                onClick={() => setStoreDesign({...storeDesign, theme})}
                                className={`w-full text-left p-4 border transition-all flex justify-between items-center ${
                                    storeDesign.theme === theme 
                                    ? 'border-black bg-gray-50' 
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-wide">{theme}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {theme === 'Editorial' ? 'Classic serif typography, balanced spacing.' : 
                                         theme === 'Minimalist' ? 'Clean sans-serif, maximizing white space.' : 
                                         'Bold monochrome contrasts, heavy structure.'}
                                    </p>
                                </div>
                                {storeDesign.theme === theme && <CheckCircle size={16} className="text-black" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accent Color & Layout */}
                <div className="space-y-8">
                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-widest mb-4 block">Brand Accent Color</label>
                        <div className="flex gap-4">
                            {[
                                { color: '#000000', name: 'Noir' },
                                { color: '#D4AF37', name: 'Gold' },
                                { color: '#800020', name: 'Burgundy' },
                                { color: '#2E4A3B', name: 'Hunter' },
                                { color: '#1E3A8A', name: 'Royal' }
                            ].map((preset) => (
                                <button
                                    key={preset.color}
                                    onClick={() => setStoreDesign({...storeDesign, accentColor: preset.color})}
                                    className={`w-10 h-10 rounded-full border-2 transition-all relative ${
                                        storeDesign.accentColor === preset.color ? 'border-black scale-110' : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: preset.color }}
                                    title={preset.name}
                                >
                                    {storeDesign.accentColor === preset.color && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Check size={12} className="text-white mix-blend-difference" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-widest mb-4 block">Product Grid Layout</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setStoreDesign({...storeDesign, layout: 'Grid'})}
                                className={`flex-1 p-4 border flex flex-col items-center justify-center gap-2 transition-all ${
                                    storeDesign.layout === 'Grid' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                <Grid size={20} />
                                <span className="text-[10px] font-bold uppercase">Standard Grid</span>
                            </button>
                            <button
                                onClick={() => setStoreDesign({...storeDesign, layout: 'Masonry'})}
                                className={`flex-1 p-4 border flex flex-col items-center justify-center gap-2 transition-all ${
                                    storeDesign.layout === 'Masonry' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                <Columns size={20} />
                                <span className="text-[10px] font-bold uppercase">Editorial Masonry</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100">
             <button 
                onClick={handleSaveStoreDesign}
                className="bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors"
            >
                Save Design
            </button>
        </div>
      </div>
  );

  const renderStorePreview = () => (
    <div className="bg-white rounded-sm shadow-sm border border-gray-100 animate-slide-up overflow-hidden">
        {/* Cover Image */}
      <div className="h-64 w-full relative overflow-hidden bg-gray-200">
         <img 
           src={storeDesign.coverImage || currentVendor?.coverImage} 
           alt="Cover" 
           className="w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-black/10" />
         <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/60 to-transparent text-white">
             <h1 className="text-4xl font-serif italic mb-2">{storeDesign.brandName || currentVendor?.name}</h1>
             <p className="text-sm opacity-90 flex items-center gap-2"><MapPin size={14}/> {storeDesign.location || currentVendor?.location}</p>
         </div>
      </div>

      <div className="p-8">
          <div className="flex gap-8">
               <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden -mt-20 relative z-10 bg-white">
                   <img src={profileForm.avatar || currentVendor?.avatar} className="w-full h-full object-cover" alt="Profile" />
               </div>
               <div className="flex-1 pt-2">
                   <p className="text-gray-600 font-light leading-relaxed max-w-2xl mb-8">
                      {storeDesign.bio || currentVendor?.bio}
                   </p>
               </div>
          </div>

          <div className="border-t border-gray-100 pt-8 mt-4">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold uppercase tracking-widest">Store Inventory</h3>
                  <span className="text-xs text-gray-400">{vendorProducts.length} Items</span>
              </div>
              
              {vendorProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                      <p>No active listings visible to customers.</p>
                  </div>
              ) : (
                  <div className={`grid gap-6 ${storeDesign.layout === 'Masonry' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'}`}>
                      {vendorProducts.map((product, index) => (
                          <div key={product.id} className={`group cursor-pointer ${storeDesign.layout === 'Masonry' && index % 2 !== 0 ? 'mt-12' : ''}`}>
                              <div className="aspect-[3/4] bg-gray-100 mb-3 overflow-hidden relative">
                                  <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
                                  {product.isNewSeason && <span className="absolute top-2 left-2 bg-white text-[10px] font-bold px-2 py-1 uppercase" style={{ color: storeDesign.accentColor }}>New</span>}
                              </div>
                              <h4 className="font-bold text-sm" style={{ fontFamily: storeDesign.theme === 'Minimalist' ? 'sans-serif' : 'serif' }}>{product.name}</h4>
                              <p className="text-xs text-gray-500" style={{ color: storeDesign.accentColor }}>${product.price}</p>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
    </div>
  );

  const renderSaved = () => (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
        <h3 className="text-xl font-serif italic mb-8">Wishlist</h3>
        {savedItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
                <Heart size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest">Your wishlist is empty</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedItems.map(item => (
                    <div key={item.id} className="group relative">
                        <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-4 relative">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <button 
                                onClick={() => removeFromSaved(item.id)}
                                className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-red-50 hover:text-red-500 transition-colors rounded-full"
                            >
                                <Trash2 size={14} />
                            </button>
                            {/* Quick Add overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <button 
                                    onClick={() => onProductSelect && onProductSelect(item)}
                                    className="w-full text-xs font-bold uppercase tracking-widest hover:text-luxury-gold"
                                >
                                    View Product
                                </button>
                            </div>
                        </div>
                        <h4 className="text-sm font-bold">{item.name}</h4>
                        <p className="text-xs text-gray-500 mb-1">{item.designer}</p>
                        <p className="text-sm font-medium">${item.price}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-luxury-cream flex flex-col md:flex-row">
      {renderSidebar()}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
           {/* Mobile Header Logic same as before... */}
           <div className="md:hidden mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-serif italic">Atelier.</h1>
           </div>

          <div className="mb-8">
            <h1 className="text-3xl font-serif font-medium mb-2 capitalize">
              {activeTab === 'MARKETPLACE' ? 'Marketplace' : activeTab === 'SUBSCRIPTION_PLAN' ? 'My Subscription' : activeTab === 'VERIFICATION' ? 'Verification' : activeTab === 'USERS' ? 'User Management' : activeTab === 'REVIEWS' ? 'Review Moderation' : activeTab === 'STORE_PREVIEW' ? 'Live Store Preview' : activeTab.toLowerCase().replace('_', ' ')}
            </h1>
          </div>

          {activeTab === 'OVERVIEW' && renderOverview()}
          {activeTab === 'PRODUCTS' && renderProducts()}
          {activeTab === 'UPLOAD' && renderUpload()}
          {activeTab === 'ORDERS' && renderOrders()}
          {activeTab === 'SETTINGS' && isAdmin && renderSettings()}
          {activeTab === 'PROFILE' && renderProfile()}
          {activeTab === 'STORE_DESIGN' && renderStoreDesign()}
          {activeTab === 'SAVED' && renderSaved()}
          {activeTab === 'FULFILLMENT' && isVendor && renderFulfillment()}
          {activeTab === 'SUBSCRIPTIONS' && isAdmin && renderSubscriptions()}
          {activeTab === 'VERIFICATION' && isAdmin && renderVerification()}
          {activeTab === 'USERS' && isAdmin && renderUsers()}
          {activeTab === 'REVIEWS' && isAdmin && renderReviews()}
          {activeTab === 'TRANSACTIONS' && isAdmin && renderTransactions()}
          {activeTab === 'FOLLOWERS' && renderFollowers()}
          {activeTab === 'SUBSCRIPTION_PLAN' && renderSubscriptionPlan()}
          {activeTab === 'STORE_PREVIEW' && renderStorePreview()}
        </div>
      </div>
    </div>
  );
};

const AreaChartComponent = ({ data }: { data: any[] }) => (
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
    <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#9ca3af" axisLine={false} tickLine={false} />
    <YAxis tick={{fontSize: 12}} stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: 'none', borderRadius: '0px', color: '#fff' }} />
    <Line type="monotone" dataKey="sales" stroke="#0a0a0a" strokeWidth={2} />
  </LineChart>
);