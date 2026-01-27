
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
  Power, Lock, MessageSquare, Flag, Store, Grid, Columns, ChevronDown, Loader, Star, Ruler, Save, Video
} from 'lucide-react';
import { FeatureFlags, UserRole, Product, ViewState, Vendor, Order, SubscriptionStatus, VerificationStatus, User, LandingPageContent } from '../types';
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
  users?: User[];
  onAddProduct?: (product: Product) => Promise<void>;
  onUpdateProduct?: (product: Product) => Promise<void>;
  onDeleteProduct?: (productId: string) => Promise<void>;
  onProductSelect?: (product: Product) => void;
  onUpdateUser?: (user: User) => Promise<void>;
  cmsContent?: LandingPageContent;
  onUpdateCMSContent?: (content: LandingPageContent) => Promise<void>;
}

type DashboardTab = 'OVERVIEW' | 'PRODUCTS' | 'UPLOAD' | 'ORDERS' | 'SETTINGS' | 'MARKETPLACE' | 'PROFILE' | 'STORE_DESIGN' | 'SAVED' | 'FULFILLMENT' | 'SUBSCRIPTIONS' | 'FOLLOWERS' | 'SUBSCRIPTION_PLAN' | 'VERIFICATION' | 'USERS' | 'REVIEWS' | 'TRANSACTIONS' | 'STORE_PREVIEW' | 'CMS';

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '39', '40', '41', '42', 'One Size'];

const MOCK_FOLLOWERS = [
  { id: 'f1', name: 'Sophie L.', handle: '@sophie_style', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop', since: 'Oct 2023', status: 'ACTIVE' },
  { id: 'f2', name: 'Arthur B.', handle: '@art_b', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop', since: 'Nov 2023', status: 'ACTIVE' },
  { id: 'f3', name: 'Chloé M.', handle: '@chloe_paris', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop', since: 'Dec 2023', status: 'ACTIVE' },
  { id: 'f4', name: 'James D.', handle: '@jd_design', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop', since: 'Jan 2024', status: 'ACTIVE' },
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
  users = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onProductSelect,
  onUpdateUser,
  cmsContent,
  onUpdateCMSContent
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
  // Use passed users from DB, fallback to mock if empty (though logic handles empty arrays)
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
  
  // CMS Form State
  const [cmsForm, setCmsForm] = useState<LandingPageContent | null>(null);

  useEffect(() => {
    if (cmsContent) {
      setCmsForm(cmsContent);
    }
  }, [cmsContent]);

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

  const handleSaveCMS = async () => {
    if (onUpdateCMSContent && cmsForm) {
      setIsSubmitting(true);
      try {
        await onUpdateCMSContent(cmsForm);
        alert('Landing page updated successfully!');
      } catch (e) {
        console.error("CMS Update failed", e);
        alert('Failed to update landing page.');
      } finally {
        setIsSubmitting(false);
      }
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
      items.push({ id: 'CMS', label: 'Content Management', icon: Layout });
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

  const renderCMS = () => {
    if (!cmsForm) return <Loader className="animate-spin mx-auto mt-20" />;

    return (
      <div className="space-y-8 animate-fade-in max-w-4xl">
        {/* Hero Section */}
        <div className="bg-white border border-gray-100 p-8 shadow-sm">
          <h3 className="text-lg font-serif italic mb-6 border-b border-gray-50 pb-2">Hero Section</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest">Title Line 1</label>
                 <input 
                    value={cmsForm.hero.titleLine1}
                    onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, titleLine1: e.target.value}})}
                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest">Title Line 2</label>
                 <input 
                    value={cmsForm.hero.titleLine2}
                    onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, titleLine2: e.target.value}})}
                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                 />
              </div>
            </div>
            <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest">Subtitle</label>
                 <input 
                    value={cmsForm.hero.subtitle}
                    onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, subtitle: e.target.value}})}
                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                 />
            </div>
             <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest">CTA Button Text</label>
                 <input 
                    value={cmsForm.hero.buttonText}
                    onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, buttonText: e.target.value}})}
                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                 />
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest">Video URL (MP4)</label>
                 <input 
                    value={cmsForm.hero.videoUrl}
                    onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, videoUrl: e.target.value}})}
                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                 />
                 <div className="text-[10px] text-gray-400">Background video for the landing page.</div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest">Poster Image URL</label>
                 <input 
                    value={cmsForm.hero.posterUrl}
                    onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, posterUrl: e.target.value}})}
                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                 />
              </div>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="bg-white border border-gray-100 p-8 shadow-sm">
           <h3 className="text-lg font-serif italic mb-6 border-b border-gray-50 pb-2">Marquee Banner</h3>
           <div className="space-y-2">
               <label className="text-xs text-gray-500 uppercase tracking-widest">Scroll Text (Separate by '•')</label>
               <input 
                  value={cmsForm.marquee.text}
                  onChange={e => setCmsForm({...cmsForm, marquee: {...cmsForm.marquee, text: e.target.value}})}
                  className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
               />
           </div>
        </div>

        {/* Campaign Section */}
        <div className="bg-white border border-gray-100 p-8 shadow-sm">
           <h3 className="text-lg font-serif italic mb-6 border-b border-gray-50 pb-2">Campaign Visuals</h3>
           <div className="grid grid-cols-2 gap-6 mb-6">
             <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest">Title</label>
                 <input 
                    value={cmsForm.campaign.title}
                    onChange={e => setCmsForm({...cmsForm, campaign: {...cmsForm.campaign, title: e.target.value}})}
                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                 />
             </div>
             <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest">Subtitle</label>
                 <input 
                    value={cmsForm.campaign.subtitle}
                    onChange={e => setCmsForm({...cmsForm, campaign: {...cmsForm.campaign, subtitle: e.target.value}})}
                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                 />
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="space-y-2">
                   <label className="text-xs text-gray-500 uppercase tracking-widest">Image {num} URL</label>
                   <div className="flex gap-2">
                     <div className="w-12 h-12 bg-gray-100 shrink-0 overflow-hidden">
                       <img src={(cmsForm.campaign as any)[`image${num}`]} alt="" className="w-full h-full object-cover" />
                     </div>
                     <input 
                        value={(cmsForm.campaign as any)[`image${num}`]}
                        onChange={e => setCmsForm({...cmsForm, campaign: {...cmsForm.campaign, [`image${num}`]: e.target.value}})}
                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                     />
                   </div>
                </div>
              ))}
           </div>
           
           <div className="space-y-2 mt-6">
               <label className="text-xs text-gray-500 uppercase tracking-widest">Overlay Text (Image 1)</label>
               <input 
                  value={cmsForm.campaign.overlayText1}
                  onChange={e => setCmsForm({...cmsForm, campaign: {...cmsForm.campaign, overlayText1: e.target.value}})}
                  className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
               />
           </div>
        </div>

        {/* Save Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex justify-end gap-4 z-20 md:pl-64">
           <button 
             onClick={handleSaveCMS}
             disabled={isSubmitting}
             className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2 disabled:opacity-50"
           >
             {isSubmitting ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
             Publish Changes
           </button>
        </div>
        <div className="h-16" /> {/* Spacer for fixed footer */}
      </div>
    );
  };

  const renderProducts = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
         <h3 className="text-lg font-serif italic">Collection Inventory</h3>
         <button onClick={() => setActiveTab('UPLOAD')} className="bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2">
            <Plus size={14} /> Add Piece
         </button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendorProducts.map(product => (
             <div key={product.id} className="bg-white p-4 border border-gray-100 shadow-sm flex gap-4 group">
                <div className="w-24 h-32 bg-gray-50 shrink-0 overflow-hidden">
                   <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                   <div>
                      <h4 className="font-bold text-sm uppercase tracking-wide truncate">{product.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">${product.price}</p>
                      <div className="flex flex-wrap gap-1">
                         {product.sizes?.map(s => <span key={s} className="text-[10px] bg-gray-100 px-1">{s}</span>)}
                      </div>
                   </div>
                   <div className="flex gap-2 mt-4">
                      <button onClick={() => handleEditProduct(product)} className="text-xs font-bold uppercase hover:text-luxury-gold flex items-center gap-1"><Edit2 size={12}/> Edit</button>
                      <button onClick={() => onDeleteProduct && onDeleteProduct(product.id)} className="text-xs font-bold uppercase text-red-500 hover:text-red-700 flex items-center gap-1"><Trash2 size={12}/> Remove</button>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const renderUpload = () => (
    <div className="max-w-2xl bg-white p-8 border border-gray-100 shadow-sm animate-fade-in mx-auto">
        <h3 className="text-xl font-serif italic mb-6">{isEditing ? 'Edit Piece' : 'New Creation'}</h3>
        <form onSubmit={handleUpload} className="space-y-6">
            <div>
               <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Product Name</label>
               <input 
                 value={newProduct.name}
                 onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                 className="w-full border-b border-gray-200 py-2 focus:border-black outline-none font-serif text-lg"
                 placeholder="e.g. Asymmetric Silk Trench"
                 required
               />
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Price ($)</label>
                 <input 
                   type="number"
                   value={newProduct.price}
                   onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                   className="w-full border-b border-gray-200 py-2 focus:border-black outline-none"
                   required
                 />
               </div>
               <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Category</label>
                 <select 
                   value={newProduct.category}
                   onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                   className="w-full border-b border-gray-200 py-2 focus:border-black outline-none bg-transparent"
                 >
                   {['Outerwear', 'Bottoms', 'Knitwear', 'Footwear', 'Accessories', 'Clothing'].map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>
            </div>
            <div>
               <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
               <textarea 
                 value={newProduct.description}
                 onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                 className="w-full border border-gray-200 p-4 focus:border-black outline-none h-32 resize-none"
                 required
               />
            </div>
            <div>
               <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Image URL</label>
               <input 
                 value={newProduct.image}
                 onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                 className="w-full border-b border-gray-200 py-2 focus:border-black outline-none"
                 placeholder="https://..."
                 required
               />
               {newProduct.image && (
                  <img src={newProduct.image} alt="Preview" className="mt-4 w-24 h-32 object-cover bg-gray-50" />
               )}
            </div>
             <div>
               <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Sizes</label>
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
                     className={`px-3 py-1 border text-xs transition-colors ${
                       newProduct.sizes?.includes(size) ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-400 hover:border-black'
                     }`}
                   >
                     {size}
                   </button>
                 ))}
               </div>
            </div>
             <div className="flex items-center gap-2 pt-2">
               <input 
                 type="checkbox" 
                 id="preOrder"
                 checked={newProduct.isPreOrder} 
                 onChange={e => setNewProduct({...newProduct, isPreOrder: e.target.checked})}
                 className="w-4 h-4 text-black border-gray-300 focus:ring-black"
               />
               <label htmlFor="preOrder" className="text-xs font-bold uppercase tracking-widest cursor-pointer select-none">Mark as Made-to-Order / Pre-Order</label>
            </div>
            
            <div className="flex gap-4 pt-6">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex justify-center gap-2">
                    {isSubmitting ? <Loader className="animate-spin" size={16} /> : (isEditing ? 'Save Changes' : 'Upload Piece')}
                </button>
                {isEditing && (
                    <button type="button" onClick={handleCancelEdit} className="px-8 border border-gray-200 text-xs font-bold uppercase tracking-widest hover:border-black transition-colors">
                        Cancel
                    </button>
                )}
            </div>
        </form>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6 animate-fade-in">
        <h3 className="text-lg font-serif italic mb-4">Order History</h3>
        {orders.map(order => (
            <div key={order.id} className="bg-white p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Order #{order.id}</span>
                        <p className="font-serif text-lg">{order.date}</p>
                    </div>
                    <div className="text-right">
                         <span className={`text-[10px] font-bold uppercase px-2 py-1 ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                             {order.status}
                         </span>
                         <p className="font-bold mt-1">${order.total}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-12 h-16 bg-gray-50 overflow-hidden">
                                <img src={item.image} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold">{item.name}</h4>
                                <p className="text-xs text-gray-500">Size: {item.size} | Qty: {item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
  );

  const renderFulfillment = () => {
    // Filter items that belong to this vendor within orders
    const vendorOrders = orders.filter(o => o.items.some(i => i.designer === currentVendor?.name));

    return (
        <div className="space-y-6 animate-fade-in">
             <h3 className="text-lg font-serif italic mb-4">Orders to Fulfill</h3>
             {vendorOrders.length === 0 ? <p className="text-gray-400">No active orders.</p> : vendorOrders.map(order => (
                 <div key={order.id} className="bg-white p-6 border border-gray-100 shadow-sm relative">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Order #{order.id}</span>
                            <h4 className="font-serif text-xl">{order.customerName}</h4>
                            <p className="text-xs text-gray-400">{order.date}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <select 
                                value={order.status}
                                onChange={(e) => onUpdateOrderStatus && onUpdateOrderStatus(order.id, e.target.value as any)}
                                className="text-xs font-bold uppercase border border-gray-200 p-2 outline-none focus:border-black cursor-pointer"
                            >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-4 border-t border-gray-50 pt-4">
                        {order.items.filter(i => i.designer === currentVendor?.name).map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-start">
                                <img src={item.image} className="w-16 h-20 object-cover bg-gray-50" />
                                <div>
                                    <h5 className="font-bold text-sm">{item.name}</h5>
                                    <p className="text-xs text-gray-500">Size: {item.size}</p>
                                    {item.measurements && (
                                        <div className="mt-2 bg-yellow-50 p-2 text-[10px] text-yellow-800 border border-yellow-100 max-w-sm">
                                            <span className="font-bold block mb-1">Custom Measurements:</span>
                                            {item.measurements}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
             ))}
        </div>
    )
  };

  const renderSettings = () => (
      <div className="max-w-2xl bg-white p-8 border border-gray-100 shadow-sm animate-fade-in">
          <h3 className="text-lg font-serif italic mb-6">Platform Configuration</h3>
          <div className="space-y-6">
              {Object.entries(featureFlags).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
                      <div>
                          <p className="font-bold text-sm uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-xs text-gray-400 mt-1">Toggle system availability</p>
                      </div>
                      <button 
                          onClick={() => toggleFeatureFlag(key as keyof FeatureFlags)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-luxury-gold' : 'bg-gray-200'}`}
                      >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${value ? 'left-7' : 'left-1'}`} />
                      </button>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderProfile = () => (
      <div className="max-w-2xl bg-white p-8 border border-gray-100 shadow-sm animate-fade-in mx-auto">
          <h3 className="text-lg font-serif italic mb-6">Profile Details</h3>
          <div className="space-y-6">
              <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gray-50 overflow-hidden">
                      <img src={profileForm.avatar} className="w-full h-full object-cover" />
                  </div>
                  <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 block">Avatar URL</label>
                      <input 
                          value={profileForm.avatar}
                          onChange={(e) => setProfileForm({...profileForm, avatar: e.target.value})}
                          className="w-full border-b border-gray-200 py-1 text-sm focus:border-black outline-none"
                      />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                  <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Name</label>
                      <input 
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                          className="w-full border-b border-gray-200 py-2 focus:border-black outline-none"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Email</label>
                      <input 
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                          className="w-full border-b border-gray-200 py-2 focus:border-black outline-none"
                      />
                  </div>
              </div>
              
              <div className="space-y-4 pt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Social Connections</p>
                  <div className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-400" />
                      <input 
                          placeholder="Website URL"
                          value={profileForm.website}
                          onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                          className="flex-1 border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                      />
                  </div>
                  <div className="flex items-center gap-2">
                      <Instagram size={16} className="text-gray-400" />
                      <input 
                          placeholder="Instagram Handle"
                          value={profileForm.instagram}
                          onChange={(e) => setProfileForm({...profileForm, instagram: e.target.value})}
                          className="flex-1 border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                      />
                  </div>
                  <div className="flex items-center gap-2">
                      <Twitter size={16} className="text-gray-400" />
                      <input 
                          placeholder="Twitter Handle"
                          value={profileForm.twitter}
                          onChange={(e) => setProfileForm({...profileForm, twitter: e.target.value})}
                          className="flex-1 border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                      />
                  </div>
              </div>

              <button onClick={handleSaveProfile} className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors mt-4">
                  Save Changes
              </button>
          </div>
      </div>
  );

  const renderStoreDesign = () => (
       <div className="max-w-2xl bg-white p-8 border border-gray-100 shadow-sm animate-fade-in mx-auto">
          <h3 className="text-lg font-serif italic mb-6">Storefront Aesthetics</h3>
          <div className="space-y-6">
              <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Cover Image URL</label>
                  <input 
                      value={storeDesign.coverImage}
                      onChange={(e) => setStoreDesign({...storeDesign, coverImage: e.target.value})}
                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                  />
                  <div className="mt-4 h-32 w-full bg-gray-50 overflow-hidden relative">
                      <img src={storeDesign.coverImage} className="w-full h-full object-cover opacity-80" />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase bg-black/10 text-white">Preview</span>
                  </div>
              </div>
              <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Brand Bio</label>
                  <textarea 
                      value={storeDesign.bio}
                      onChange={(e) => setStoreDesign({...storeDesign, bio: e.target.value})}
                      className="w-full border border-gray-200 p-4 focus:border-black outline-none h-32 resize-none"
                  />
              </div>
              <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Location</label>
                  <input 
                      value={storeDesign.location}
                      onChange={(e) => setStoreDesign({...storeDesign, location: e.target.value})}
                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                  />
              </div>
              <button onClick={handleSaveStoreDesign} className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors mt-4">
                  Update Storefront
              </button>
          </div>
       </div>
  );

  const renderSaved = () => (
      <div className="space-y-6 animate-fade-in">
          <h3 className="text-lg font-serif italic mb-4">Wishlist</h3>
          {savedItems.length === 0 ? (
              <p className="text-gray-400">Your wishlist is empty.</p>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedItems.map(product => (
                      <div key={product.id} className="group cursor-pointer relative" onClick={() => onProductSelect && onProductSelect(product)}>
                          <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-4 relative">
                              <img src={product.image} className="w-full h-full object-cover" />
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeFromSaved(product.id); }}
                                className="absolute top-2 right-2 bg-white/80 p-2 hover:text-red-500 transition-colors"
                              >
                                  <Trash2 size={16} />
                              </button>
                          </div>
                          <h4 className="font-bold text-xs uppercase tracking-wide">{product.designer}</h4>
                          <p className="text-sm text-gray-600">{product.name}</p>
                          <p className="text-sm font-medium mt-1">${product.price}</p>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  const renderSubscriptions = () => (
      <div className="space-y-6 animate-fade-in">
          <h3 className="text-lg font-serif italic mb-4">Vendor Subscriptions</h3>
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 border-b border-gray-100">
                     <tr>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500">Vendor</th>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500">Plan</th>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500">Status</th>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500 text-right">Action</th>
                     </tr>
                 </thead>
                 <tbody>
                     {vendors.map(v => (
                         <tr key={v.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                             <td className="p-4 flex items-center gap-3">
                                 <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                                     <img src={v.avatar} className="w-full h-full object-cover" />
                                 </div>
                                 <span className="font-bold">{v.name}</span>
                             </td>
                             <td className="p-4"><span className="text-xs bg-gray-100 px-2 py-1 uppercase">{v.subscriptionPlan}</span></td>
                             <td className="p-4">
                                 <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${v.subscriptionStatus === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                     {v.subscriptionStatus}
                                 </span>
                             </td>
                             <td className="p-4 text-right">
                                 <button 
                                   onClick={() => handleSubscriptionToggle(v.id)}
                                   className="text-xs font-bold underline hover:text-luxury-gold"
                                 >
                                     {v.subscriptionStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                 </button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
          </div>
      </div>
  );

  const renderVerification = () => (
    <div className="space-y-6 animate-fade-in">
        <h3 className="text-lg font-serif italic mb-4">Pending Verifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vendors.filter(v => v.verificationStatus === 'PENDING').length === 0 && <p className="text-gray-400">No pending verifications.</p>}
            {vendors.filter(v => v.verificationStatus === 'PENDING').map(v => (
                <div key={v.id} className="bg-white p-6 border border-gray-100 shadow-sm flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 shrink-0">
                            <img src={v.avatar} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h4 className="font-bold uppercase tracking-wide">{v.name}</h4>
                            <p className="text-xs text-gray-500 mb-2">{v.location}</p>
                            <a href={v.website} target="_blank" className="text-xs underline text-blue-500 flex items-center gap-1"><ExternalLink size={10} /> Website</a>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => handleVerificationStatus(v.id, 'VERIFIED')} className="bg-black text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-green-600 transition-colors">Approve</button>
                        <button onClick={() => handleVerificationStatus(v.id, 'REJECTED')} className="border border-gray-200 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-colors">Reject</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderUsers = () => (
      <div className="space-y-6 animate-fade-in">
          <h3 className="text-lg font-serif italic mb-4">User Management</h3>
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 border-b border-gray-100">
                     <tr>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500">User</th>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500">Role</th>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500">Status</th>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500">Joined</th>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500 text-right">Action</th>
                     </tr>
                 </thead>
                 <tbody>
                     {/* Combine Users and Vendors for list */}
                     {[
                        ...users.map(u => ({ ...u, isVendor: false })),
                        ...vendors.map(v => ({ id: v.id, name: v.name, email: v.email || 'N/A', role: 'VENDOR', avatar: v.avatar, status: v.subscriptionStatus === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED', joined: 'N/A', isVendor: true }))
                     ].map((u, i) => (
                         <tr key={`${u.id}-${i}`} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                             <td className="p-4 flex items-center gap-3">
                                 <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                                     <img src={u.avatar} className="w-full h-full object-cover" />
                                 </div>
                                 <div>
                                     <span className="font-bold block text-xs">{u.name}</span>
                                     <span className="text-[10px] text-gray-400">{u.email}</span>
                                 </div>
                             </td>
                             <td className="p-4">
                                 <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-sm ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : u.role === 'VENDOR' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                     {u.role}
                                 </span>
                             </td>
                             <td className="p-4">
                                 <span className={`text-[10px] font-bold uppercase ${u.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                                     {u.status}
                                 </span>
                             </td>
                             <td className="p-4 text-xs text-gray-500">{u.joined}</td>
                             <td className="p-4 text-right flex justify-end gap-2">
                                 {!u.isVendor && u.role !== 'ADMIN' && (
                                     <button onClick={() => toggleUserStatus(u as any)} className="text-xs hover:text-red-500" title={u.status === 'ACTIVE' ? "Suspend User" : "Activate User"}>
                                         {u.status === 'ACTIVE' ? <Ban size={14} /> : <CheckCircle size={14} />}
                                     </button>
                                 )}
                                 {!u.isVendor && (
                                     <button 
                                        onClick={() => handleRoleUpdate(u.id, u.role === 'BUYER' ? 'ADMIN' : 'BUYER')}
                                        className="text-xs hover:text-blue-500" title="Toggle Admin"
                                     >
                                         <Shield size={14} />
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

  const renderReviews = () => (
      <div className="space-y-6 animate-fade-in">
          <h3 className="text-lg font-serif italic mb-4">Content Moderation</h3>
          <div className="grid grid-cols-1 gap-4">
              {adminReviews.map(review => (
                  <div key={review.id} className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                          <div className="flex justify-between mb-2">
                              <span className="text-xs font-bold uppercase text-gray-500">{review.productName}</span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 ${review.status === 'FLAGGED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{review.status}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                              <div className="flex text-luxury-gold">
                                  {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />)}
                              </div>
                              <span className="text-xs font-bold">by {review.author}</span>
                              <span className="text-xs text-gray-400">{review.date}</span>
                          </div>
                          <p className="text-sm text-gray-600 italic">"{review.content}"</p>
                      </div>
                      <div className="flex items-center gap-2 border-l border-gray-50 pl-6">
                          <button onClick={() => handleReviewAction(review.id, 'APPROVE')} className="p-2 hover:bg-green-50 text-green-600 rounded-full" title="Approve"><CheckCircle size={18} /></button>
                          <button onClick={() => handleReviewAction(review.id, 'FLAG')} className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-full" title="Flag"><Flag size={18} /></button>
                          <button onClick={() => handleReviewAction(review.id, 'DELETE')} className="p-2 hover:bg-red-50 text-red-600 rounded-full" title="Delete"><Trash2 size={18} /></button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderTransactions = () => (
      <div className="space-y-6 animate-fade-in">
          <h3 className="text-lg font-serif italic mb-4">Financial Overview</h3>
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 border-b border-gray-100">
                     <tr>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500">Transaction ID</th>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500">Date</th>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500">Vendor / Customer</th>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500 text-right">Amount</th>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500 text-right">Fee</th>
                         <th className="p-4 font-bold uppercase text-xs text-gray-500 text-right">Status</th>
                     </tr>
                 </thead>
                 <tbody>
                     {transactions.map(tx => (
                         <tr key={tx.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                             <td className="p-4 font-mono text-xs">{tx.id}</td>
                             <td className="p-4 text-xs text-gray-500">{tx.date}</td>
                             <td className="p-4">
                                 <div className="flex flex-col">
                                     <span className="font-bold text-xs">{tx.vendor}</span>
                                     <span className="text-[10px] text-gray-400">{tx.customer}</span>
                                 </div>
                             </td>
                             <td className="p-4 text-right font-bold">${tx.amount.toFixed(2)}</td>
                             <td className="p-4 text-right text-xs text-gray-500">${tx.platformFee.toFixed(2)}</td>
                             <td className="p-4 text-right">
                                 <span className={`text-[10px] font-bold uppercase px-2 py-1 ${tx.status === 'CLEARED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
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

  const renderFollowers = () => (
      <div className="space-y-6 animate-fade-in">
          <h3 className="text-lg font-serif italic mb-4">Community</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {followers.map(follower => (
                  <div key={follower.id} className={`bg-white p-4 border border-gray-100 shadow-sm flex items-center justify-between ${follower.status === 'BLOCKED' ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-4">
                          <img src={follower.avatar} className="w-12 h-12 rounded-full object-cover" />
                          <div>
                              <h4 className="font-bold text-sm">{follower.name}</h4>
                              <p className="text-xs text-gray-400">{follower.handle} • Joined {follower.since}</p>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => blockFollower(follower.id)} className="text-gray-400 hover:text-red-500" title="Block User">
                              {follower.status === 'BLOCKED' ? <CheckCircle size={16} /> : <Ban size={16} />}
                          </button>
                          <button onClick={() => removeFollower(follower.id)} className="text-gray-400 hover:text-red-500" title="Remove Follower">
                              <UserX size={16} />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderSubscriptionPlan = () => (
      <div className="space-y-8 animate-fade-in">
          <div className="text-center max-w-2xl mx-auto mb-12">
              <h3 className="text-2xl font-serif italic mb-4">Choose Your Atelier Tier</h3>
              <p className="text-gray-500 text-sm">Unlock marketplace features, analytics, and lower commission rates.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SUBSCRIPTION_PLANS.map(plan => (
                  <div key={plan.name} className={`bg-white border p-8 flex flex-col ${currentVendor?.subscriptionPlan === plan.name ? 'border-luxury-gold shadow-lg ring-1 ring-luxury-gold' : 'border-gray-100'}`}>
                      <div className="mb-6">
                          <h4 className="text-lg font-bold uppercase tracking-widest mb-2">{plan.name}</h4>
                          <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-serif italic">{plan.price}</span>
                              <span className="text-xs text-gray-400">{plan.period}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-4 leading-relaxed">{plan.description}</p>
                      </div>
                      <div className="flex-1 space-y-3 mb-8">
                          {plan.features.map(f => (
                              <div key={f} className="flex items-center gap-2 text-sm">
                                  <Check size={14} className="text-luxury-gold" /> {f}
                              </div>
                          ))}
                      </div>
                      <button 
                          onClick={() => handlePlanChange(plan.name)}
                          className={`w-full py-3 text-xs font-bold uppercase tracking-widest transition-colors ${currentVendor?.subscriptionPlan === plan.name ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-black text-white hover:bg-luxury-gold'}`}
                          disabled={currentVendor?.subscriptionPlan === plan.name}
                      >
                          {currentVendor?.subscriptionPlan === plan.name ? 'Current Plan' : 'Select Plan'}
                      </button>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderStorePreview = () => (
      <div className="h-full flex flex-col items-center justify-center space-y-6 animate-fade-in bg-white p-12 border border-gray-100">
          <Store size={48} className="text-gray-300" />
          <h3 className="text-xl font-serif italic">Your Boutique is Live</h3>
          <p className="text-gray-500 max-w-md text-center">
              Your store is currently visible to the global marketplace. View it as a customer to ensure everything looks perfect.
          </p>
          <button 
              onClick={() => onNavigate('VENDOR_PROFILE')}
              className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2"
          >
              View Live Store <ExternalLink size={14} />
          </button>
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
              {activeTab === 'MARKETPLACE' ? 'Marketplace' : activeTab === 'SUBSCRIPTION_PLAN' ? 'My Subscription' : activeTab === 'VERIFICATION' ? 'Verification' : activeTab === 'USERS' ? 'User Management' : activeTab === 'REVIEWS' ? 'Review Moderation' : activeTab === 'STORE_PREVIEW' ? 'Live Store Preview' : activeTab === 'CMS' ? 'Content Management' : activeTab.toLowerCase().replace('_', ' ')}
            </h1>
          </div>

          {activeTab === 'OVERVIEW' && renderOverview(SALES_DATA, stats)}
          {activeTab === 'PRODUCTS' && renderProducts()}
          {activeTab === 'UPLOAD' && renderUpload()}
          {activeTab === 'ORDERS' && renderOrders()}
          {activeTab === 'SETTINGS' && isAdmin && renderSettings()}
          {activeTab === 'CMS' && isAdmin && renderCMS()}
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
