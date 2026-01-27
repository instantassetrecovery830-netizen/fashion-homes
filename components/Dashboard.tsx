import React, { useState, useEffect, useMemo } from 'react';
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
  Power, Lock, MessageSquare, Flag, Store, Grid, Columns, ChevronDown, Loader, Star, Ruler
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
  onAddProduct?: (product: Product) => Promise<void>;
  onUpdateProduct?: (product: Product) => Promise<void>;
  onDeleteProduct?: (productId: string) => Promise<void>;
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
  { id: 'u_admin2', name: 'Julie M.', email: 'juliemtrice7@proton.me', role: 'ADMIN', status: 'ACTIVE', joined: 'Feb 2024', spend: '-', location: 'Global' },
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editable Profile State
  const [profileForm, setProfileForm] = useState({
    name: currentVendor?.name || '',
    email: currentVendor?.email || 'contact@myfitstore.com',
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
    : products; // Admin sees all

  // Calculate stats dynamically
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

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (currentVendor) {
      setProfileForm({
        name: currentVendor.name,
        email: currentVendor.email || 'contact@myfitstore.com',
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
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
                designer: currentVendor?.name || 'Maison Margaux',
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
        setNewProduct({ name: '', price: 0, category: 'Outerwear', description: '', image: '', designer: currentVendor?.name || 'Maison Margaux', stock: 1, sizes: ['S', 'M', 'L'] });
    } catch (err) {
        alert('Failed to save product. Please try again.');
        console.error(err);
    } finally {
        setIsSubmitting(false);
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
                  disabled={isSubmitting}
                  className="flex-1 bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting && <Loader className="animate-spin" size={14} />}
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

  const renderProducts = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {vendorProducts.map((product) => (
        <div key={product.id} className="bg-white border border-gray-100 p-4 relative group">
          <div className="aspect-[3/4] bg-gray-50 mb-4 overflow-hidden">
             <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide">{product.name}</h3>
              <p className="text-xs text-gray-500">{product.category}</p>
            </div>
            <span className="text-sm font-medium">${product.price}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50">
             <span>Stock: {product.stock}</span>
             <div className="flex gap-2">
                <button 
                  onClick={() => handleEditProduct(product)} 
                  className="hover:text-black flex items-center gap-1"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button 
                  onClick={() => onDeleteProduct && onDeleteProduct(product.id)} 
                  className="hover:text-red-500 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Delete
                </button>
             </div>
          </div>
        </div>
      ))}
      <div 
        onClick={() => { setActiveTab('UPLOAD'); setIsEditing(false); }}
        className="border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-black hover:bg-gray-50 transition-all min-h-[300px]"
      >
        <Plus size={32} className="text-gray-300 mb-2" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Add New Item</span>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4 animate-fade-in">
       {orders.length === 0 ? (
           <p className="text-gray-400 text-sm italic">No active orders.</p>
       ) : (
           orders.map((order) => (
               <div key={order.id} className="bg-white border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                   <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-gray-400">
                           <Package size={20} />
                       </div>
                       <div>
                           <p className="text-xs font-bold uppercase tracking-widest mb-1">{order.id} • {order.date}</p>
                           <p className="font-serif italic text-lg">{order.customerName}</p>
                           <p className="text-xs text-gray-500">{order.items.length} Items • Total: ${order.total}</p>
                       </div>
                   </div>
                   <div className="flex items-center gap-4">
                       <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                           order.status === 'Delivered' ? 'border-green-500 text-green-500' :
                           order.status === 'Shipped' ? 'border-blue-500 text-blue-500' :
                           'border-orange-500 text-orange-500'
                       }`}>
                           {order.status}
                       </span>
                       {(isAdmin || isVendor) && (
                           <select 
                             value={order.status}
                             onChange={(e) => onUpdateOrderStatus && onUpdateOrderStatus(order.id, e.target.value as any)}
                             className="text-xs border-b border-gray-200 py-1 bg-transparent outline-none focus:border-black"
                           >
                               <option value="Processing">Processing</option>
                               <option value="Shipped">Shipped</option>
                               <option value="Delivered">Delivered</option>
                           </select>
                       )}
                   </div>
               </div>
           ))
       )}
    </div>
  );

  const renderSettings = () => (
      <div className="bg-white border border-gray-100 p-8 max-w-2xl animate-fade-in">
          <h3 className="text-lg font-serif italic mb-6">Platform Configuration</h3>
          <div className="space-y-6">
              {Object.entries(featureFlags).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0">
                      <div>
                          <p className="text-xs font-bold uppercase tracking-widest mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-[10px] text-gray-400">Toggle system-wide feature availability.</p>
                      </div>
                      <button 
                        onClick={() => toggleFeatureFlag(key as keyof FeatureFlags)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${value ? 'bg-black' : 'bg-gray-200'}`}
                      >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderProfile = () => (
      <div className="bg-white border border-gray-100 p-8 max-w-2xl animate-fade-in">
          <h3 className="text-lg font-serif italic mb-6">Profile Settings</h3>
          <div className="space-y-6">
              <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden">
                      <img src={profileForm.avatar || "https://via.placeholder.com/150"} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <button className="text-xs font-bold uppercase tracking-widest border border-gray-200 px-4 py-2 hover:bg-black hover:text-white transition-colors">
                      Change Avatar
                  </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Display Name</label>
                      <input 
                        type="text" 
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                      />
                  </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                      <input 
                        type="email" 
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                      />
                  </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Instagram</label>
                      <input 
                        type="text" 
                        value={profileForm.instagram}
                        onChange={(e) => setProfileForm({...profileForm, instagram: e.target.value})}
                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                        placeholder="@username"
                      />
                  </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Twitter / X</label>
                      <input 
                        type="text" 
                        value={profileForm.twitter}
                        onChange={(e) => setProfileForm({...profileForm, twitter: e.target.value})}
                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                        placeholder="@username"
                      />
                  </div>
              </div>
              <button 
                  onClick={handleSaveProfile}
                  className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors mt-4"
              >
                  Save Changes
              </button>
          </div>
      </div>
  );

  const renderStoreDesign = () => (
      <div className="bg-white border border-gray-100 p-8 max-w-4xl animate-fade-in">
          <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-serif italic">Storefront Customization</h3>
              <button onClick={() => setActiveTab('STORE_PREVIEW')} className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-luxury-gold">
                  <Eye size={14} /> Preview
              </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Brand Name</label>
                      <input 
                        value={storeDesign.brandName}
                        onChange={(e) => setStoreDesign({...storeDesign, brandName: e.target.value})}
                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                      />
                  </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bio / Philosophy</label>
                      <textarea 
                        value={storeDesign.bio}
                        onChange={(e) => setStoreDesign({...storeDesign, bio: e.target.value})}
                        rows={4}
                        className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none resize-none"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Location</label>
                      <input 
                        value={storeDesign.location}
                        onChange={(e) => setStoreDesign({...storeDesign, location: e.target.value})}
                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                      />
                  </div>
              </div>
              <div className="space-y-6">
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cover Image URL</label>
                       <div className="aspect-[21/9] bg-gray-100 mb-2 overflow-hidden">
                           <img src={storeDesign.coverImage} alt="Cover" className="w-full h-full object-cover" />
                       </div>
                      <input 
                        value={storeDesign.coverImage}
                        onChange={(e) => setStoreDesign({...storeDesign, coverImage: e.target.value})}
                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                      />
                  </div>
              </div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-8 flex justify-end">
              <button 
                  onClick={handleSaveStoreDesign}
                  className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors"
              >
                  Update Storefront
              </button>
          </div>
      </div>
  );

  const renderSaved = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          {savedItems.length === 0 ? (
              <p className="col-span-4 text-center text-gray-400 italic py-12">No saved items.</p>
          ) : (
              savedItems.map(item => (
                  <div key={item.id} className="group relative">
                      <div className="aspect-[3/4] bg-gray-100 mb-4 overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <button 
                              onClick={() => removeFromSaved(item.id)}
                              className="absolute top-2 right-2 bg-white/80 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                              <X size={14} />
                          </button>
                      </div>
                      <h3 className="font-bold text-xs uppercase tracking-widest">{item.designer}</h3>
                      <p className="text-sm font-serif italic text-gray-600">{item.name}</p>
                      <p className="text-sm font-medium mt-1">${item.price}</p>
                  </div>
              ))
          )}
      </div>
  );

  const renderFulfillment = () => {
    // Determine the relevant vendor name.
    const vendorName = currentVendor?.name;
    
    if (!vendorName) return <p className="text-center py-12 text-gray-500">Vendor profile not active.</p>;

    const vendorOrders = orders.filter(order => 
      order.items.some(item => item.designer === vendorName)
    );

    return (
      <div className="space-y-8 animate-fade-in">
          {vendorOrders.length === 0 ? (
              <div className="text-center py-24 bg-white border border-dashed border-gray-200">
                  <Package size={48} className="mx-auto text-gray-200 mb-4" />
                  <h3 className="text-lg font-serif italic text-gray-400">No pending orders</h3>
                  <p className="text-xs text-gray-300 uppercase tracking-widest mt-2">New client purchases will appear here</p>
              </div>
          ) : (
              vendorOrders.map(order => {
                  const myItems = order.items.filter(item => item.designer === vendorName);
                  const orderValue = myItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

                  return (
                      <div key={order.id} className="bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-50 pb-6 mb-6 gap-6">
                              <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-black text-white flex items-center justify-center">
                                       <span className="font-bold text-xs">#{order.id.split('_')[1] || order.id.slice(-4)}</span>
                                   </div>
                                   <div>
                                       <div className="flex items-center gap-2">
                                           <h4 className="font-serif italic text-xl">{order.customerName}</h4>
                                           <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{order.date}</span>
                                       </div>
                                       <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                                           {myItems.length} Item{myItems.length > 1 ? 's' : ''} to Fulfill
                                       </p>
                                   </div>
                              </div>

                              <div className="flex items-center gap-8">
                                  <div className="text-right">
                                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Revenue</p>
                                      <p className="font-bold text-lg">${orderValue}</p>
                                  </div>
                                  
                                  <div className="flex flex-col items-end gap-2">
                                     <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1 ${
                                         order.status === 'Delivered' ? 'border-green-200 bg-green-50 text-green-600' :
                                         order.status === 'Shipped' ? 'border-blue-200 bg-blue-50 text-blue-600' :
                                         'border-orange-200 bg-orange-50 text-orange-600'
                                     }`}>
                                         {order.status === 'Delivered' && <CheckCircle size={10} />}
                                         {order.status === 'Shipped' && <Truck size={10} />}
                                         {order.status === 'Processing' && <Loader className="animate-spin" size={10} />}
                                         {order.status}
                                     </div>
                                     <select 
                                         value={order.status} 
                                         onChange={(e) => onUpdateOrderStatus && onUpdateOrderStatus(order.id, e.target.value as any)}
                                         className="text-xs border-b border-gray-200 py-1 outline-none focus:border-black cursor-pointer bg-transparent text-right"
                                     >
                                         <option value="Processing">Mark Processing</option>
                                         <option value="Shipped">Mark Shipped</option>
                                         <option value="Delivered">Mark Delivered</option>
                                     </select>
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-3">
                              {myItems.map((item, idx) => (
                                  <div key={`${order.id}-item-${idx}`} className="flex gap-4 p-4 bg-gray-50 border border-gray-100">
                                      <div className="w-16 h-20 bg-white shrink-0">
                                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <h5 className="font-bold text-sm">{item.name}</h5>
                                                  <p className="text-xs text-gray-500 mt-1">Size: <span className="text-black font-medium">{item.size}</span></p>
                                                  <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                                              </div>
                                              <span className="font-medium text-sm">${item.price}</span>
                                          </div>
                                          
                                          {item.measurements && (
                                              <div className="mt-3 text-xs bg-white border border-gray-200 p-3">
                                                  <p className="font-bold text-[10px] uppercase tracking-widest text-luxury-gold mb-1 flex items-center gap-1">
                                                      <Ruler size={10} /> Custom Measurements
                                                  </p>
                                                  <p className="text-gray-600 font-mono text-[10px]">{item.measurements}</p>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              ))}
                          </div>

                          <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end gap-3">
                              <button className="px-6 py-3 border border-gray-200 text-xs font-bold uppercase tracking-widest hover:border-black transition-colors">
                                  Invoice
                              </button>
                              <button className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2">
                                  <Truck size={14} /> Generate Shipping Label
                              </button>
                          </div>
                      </div>
                  )
              })
          )}
      </div>
    );
  };

  const renderSubscriptions = () => (
      <div className="space-y-4 animate-fade-in">
          {vendors.map(vendor => (
              <div key={vendor.id} className="bg-white border border-gray-100 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <img src={vendor.avatar} alt={vendor.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                          <h4 className="font-bold text-sm uppercase tracking-widest">{vendor.name}</h4>
                          <p className="text-xs text-gray-500">{vendor.email}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-8">
                       <div className="text-right">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current Plan</p>
                           <p className="text-sm font-serif italic">{vendor.subscriptionPlan || 'None'}</p>
                       </div>
                       <div className="text-right">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</p>
                           <span className={`text-xs font-bold ${vendor.subscriptionStatus === 'ACTIVE' ? 'text-green-500' : 'text-red-500'}`}>
                               {vendor.subscriptionStatus}
                           </span>
                       </div>
                       <button 
                          onClick={() => handleSubscriptionToggle(vendor.id)}
                          className="p-2 border border-gray-200 hover:bg-black hover:text-white transition-colors"
                          title="Toggle Status"
                       >
                           <Power size={16} />
                       </button>
                  </div>
              </div>
          ))}
      </div>
  );

  const renderVerification = () => (
      <div className="space-y-4 animate-fade-in">
          {vendors.filter(v => v.verificationStatus === 'PENDING').length === 0 && (
               <p className="text-gray-400 text-center italic py-12">No pending verifications.</p>
          )}
          {vendors.map(vendor => (
              <div key={vendor.id} className="bg-white border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                   <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-16 h-16 bg-gray-100 shrink-0">
                          <img src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                          <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm uppercase tracking-widest">{vendor.name}</h4>
                              <span className={`text-[10px] px-2 py-0.5 border ${
                                  vendor.verificationStatus === 'VERIFIED' ? 'border-blue-500 text-blue-500' :
                                  vendor.verificationStatus === 'REJECTED' ? 'border-red-500 text-red-500' :
                                  'border-yellow-500 text-yellow-500'
                              }`}>{vendor.verificationStatus}</span>
                          </div>
                          <p className="text-xs text-gray-500 max-w-md mt-1">{vendor.bio}</p>
                          <a href={vendor.website} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline mt-1 block">{vendor.website}</a>
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <button 
                          onClick={() => handleVerificationStatus(vendor.id, 'VERIFIED')}
                          className="bg-green-50 text-green-600 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-green-100"
                      >
                          Verify
                      </button>
                      <button 
                          onClick={() => handleVerificationStatus(vendor.id, 'REJECTED')}
                          className="bg-red-50 text-red-600 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-100"
                      >
                          Reject
                      </button>
                  </div>
              </div>
          ))}
      </div>
  );

  const renderUsers = () => (
      <div className="overflow-x-auto bg-white border border-gray-100 animate-fade-in">
          <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">User</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Role</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Location</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Spend</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Actions</th>
                  </tr>
              </thead>
              <tbody>
                  {users.map(user => (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                              <div className="font-bold text-sm">{user.name}</div>
                              <div className="text-xs text-gray-400">{user.email}</div>
                          </td>
                          <td className="p-4">
                              <select 
                                  value={user.role}
                                  onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                  className="bg-transparent text-xs border border-gray-200 rounded px-2 py-1"
                              >
                                  <option value="BUYER">Buyer</option>
                                  <option value="VENDOR">Vendor</option>
                                  <option value="ADMIN">Admin</option>
                              </select>
                          </td>
                          <td className="p-4 text-xs text-gray-600">{user.location}</td>
                          <td className="p-4 text-xs font-mono">{user.spend}</td>
                          <td className="p-4">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                  user.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                  {user.status}
                              </span>
                          </td>
                          <td className="p-4">
                              <button onClick={() => toggleUserStatus(user.id)} className="text-gray-400 hover:text-black">
                                  {user.status === 'ACTIVE' ? <Ban size={16} /> : <CheckCircle size={16} />}
                              </button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );

  const renderReviews = () => (
      <div className="space-y-4 animate-fade-in">
          {adminReviews.map(review => (
              <div key={review.id} className="bg-white border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h4 className="font-bold text-sm mb-1">{review.productName}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>by {review.author}</span>
                              <span>•</span>
                              <span>{review.date}</span>
                          </div>
                      </div>
                       <span className={`text-[10px] font-bold px-2 py-1 border ${
                           review.status === 'APPROVED' ? 'border-green-500 text-green-500' : 
                           review.status === 'FLAGGED' ? 'border-red-500 text-red-500' : 
                           'border-orange-500 text-orange-500'
                       }`}>
                           {review.status}
                       </span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                           <Star key={i} size={12} className={i < review.rating ? "fill-luxury-gold text-luxury-gold" : "text-gray-200"} />
                      ))}
                  </div>
                  <p className="text-sm text-gray-600 italic font-serif mb-6">"{review.content}"</p>
                  <div className="flex gap-3 border-t border-gray-50 pt-4">
                      <button onClick={() => handleReviewAction(review.id, 'APPROVE')} className="text-xs font-bold uppercase tracking-widest text-green-600 hover:bg-green-50 px-3 py-1">Approve</button>
                      <button onClick={() => handleReviewAction(review.id, 'FLAG')} className="text-xs font-bold uppercase tracking-widest text-orange-500 hover:bg-orange-50 px-3 py-1">Flag</button>
                      <button onClick={() => handleReviewAction(review.id, 'DELETE')} className="text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 px-3 py-1">Delete</button>
                  </div>
              </div>
          ))}
      </div>
  );

  const renderTransactions = () => (
      <div className="bg-white border border-gray-100 animate-fade-in">
           <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">ID</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Date</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Entity</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Amount</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Fee</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                  </tr>
              </thead>
              <tbody>
                  {transactions.map(tx => (
                      <tr key={tx.id} className="border-b border-gray-50">
                          <td className="p-4 text-xs font-mono text-gray-500">#{tx.id.split('_')[1]}</td>
                          <td className="p-4 text-xs">{tx.date}</td>
                          <td className="p-4">
                              <div className="text-xs font-bold">{tx.vendor}</div>
                              <div className="text-[10px] text-gray-400">from {tx.customer}</div>
                          </td>
                          <td className="p-4 text-sm font-medium">${tx.amount.toFixed(2)}</td>
                          <td className="p-4 text-xs text-gray-500">${tx.platformFee.toFixed(2)}</td>
                          <td className="p-4">
                               <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                  tx.status === 'CLEARED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                              }`}>
                                  {tx.status}
                              </span>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );

  const renderFollowers = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {followers.map(follower => (
              <div key={follower.id} className="bg-white border border-gray-100 p-6 flex flex-col items-center text-center relative group">
                  <button 
                      onClick={() => removeFollower(follower.id)}
                      className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                      <X size={16} />
                  </button>
                  <img src={follower.avatar} alt={follower.name} className="w-16 h-16 rounded-full object-cover mb-4" />
                  <h4 className="font-bold text-sm">{follower.name}</h4>
                  <p className="text-xs text-gray-500 mb-2">{follower.handle}</p>
                  <p className="text-[10px] text-gray-400 mb-4">Following since {follower.since}</p>
                  <div className="flex gap-2 w-full">
                       <button className="flex-1 border border-gray-200 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">Message</button>
                       <button onClick={() => blockFollower(follower.id)} className="p-2 border border-gray-200 text-gray-400 hover:text-red-500 transition-colors" title="Block">
                           <Ban size={16} />
                       </button>
                  </div>
              </div>
          ))}
      </div>
  );

  const renderSubscriptionPlan = () => (
      <div className="space-y-8 animate-fade-in">
          <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-serif italic mb-4">Choose Your Subscription Plan</h2>
              <p className="text-gray-500 font-light">Scale your digital presence with tools designed for luxury commerce.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {SUBSCRIPTION_PLANS.map((plan) => (
                  <div 
                    key={plan.name} 
                    className={`border p-8 relative transition-all hover:-translate-y-2 hover:shadow-xl ${
                        currentVendor?.subscriptionPlan === plan.name 
                        ? 'border-black bg-gray-50 ring-1 ring-black' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                      {currentVendor?.subscriptionPlan === plan.name && (
                          <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                              Current Plan
                          </div>
                      )}
                      <h3 className="text-xl font-serif italic mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-3xl font-bold">{plan.price}</span>
                          <span className="text-xs text-gray-500">{plan.period}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-8 h-10">{plan.description}</p>
                      <ul className="space-y-3 mb-8">
                          {plan.features.map((f, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                  <Check size={14} className="mt-1 text-green-600" />
                                  <span>{f}</span>
                              </li>
                          ))}
                      </ul>
                      <button 
                          onClick={() => handlePlanChange(plan.name)}
                          disabled={currentVendor?.subscriptionPlan === plan.name}
                          className="w-full py-3 text-xs font-bold uppercase tracking-widest border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {currentVendor?.subscriptionPlan === plan.name ? 'Active' : 'Select Plan'}
                      </button>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderStorePreview = () => (
      <div className="bg-white border border-gray-100 shadow-xl overflow-hidden animate-fade-in">
          <div className="bg-gray-100 border-b border-gray-200 p-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded text-[10px] text-center text-gray-400 py-1">
                  myfitstore.com/designers/{storeDesign.brandName.toLowerCase().replace(/\s+/g, '-')}
              </div>
          </div>
          <div className="h-[600px] overflow-y-auto relative bg-white">
              <div className="h-48 relative">
                   <img src={storeDesign.coverImage} className="w-full h-full object-cover" alt="cover" />
                   <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="px-8 relative -mt-12">
                   <div className="flex items-end gap-6 mb-6">
                       <img src={profileForm.avatar} className="w-24 h-24 rounded-full border-4 border-white object-cover" alt="avatar" />
                       <div className="mb-2">
                           <h2 className="text-2xl font-serif italic">{storeDesign.brandName}</h2>
                           <p className="text-xs text-gray-500">{storeDesign.location}</p>
                       </div>
                   </div>
                   <p className="text-sm text-gray-600 font-serif italic max-w-xl mb-12">{storeDesign.bio}</p>
                   <div className="grid grid-cols-3 gap-4">
                       {[1,2,3].map(i => (
                           <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
                       ))}
                   </div>
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-luxury-cream flex flex-col md:flex-row">
      {renderSidebar()}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
           {/* Mobile Header */}
           <div className="md:hidden mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-serif italic">MyFitStore</h1>
           </div>

          <div className="mb-8">
            <h1 className="text-3xl font-serif font-medium mb-2 capitalize">
              {activeTab === 'MARKETPLACE' ? 'Marketplace' : activeTab === 'SUBSCRIPTION_PLAN' ? 'My Subscription' : activeTab === 'VERIFICATION' ? 'Verification' : activeTab === 'USERS' ? 'User Management' : activeTab === 'REVIEWS' ? 'Review Moderation' : activeTab === 'STORE_PREVIEW' ? 'Live Store Preview' : activeTab.toLowerCase().replace('_', ' ')}
            </h1>
          </div>

          {activeTab === 'OVERVIEW' && renderOverview(SALES_DATA, stats)}
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

const renderOverview = (data: any[], stats: { revenue: number, activeOrders: number, clients: number, aov: number }) => (
  <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, trend: '+12%' },
          { label: 'Active Orders', value: stats.activeOrders.toString(), icon: Package, trend: '+2' },
          { label: 'Total Clients', value: stats.clients.toString(), icon: Users, trend: '+5%' },
          { label: 'Avg. Order Value', value: `$${Math.round(stats.aov).toLocaleString()}`, icon: Activity, trend: '-1%' },
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
        <div className="bg-white p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-serif italic mb-6">Revenue Analytics</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChartComponent data={data} />
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
);