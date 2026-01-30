
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
  Power, Lock, MessageSquare, Flag, Store, Grid, Columns, ChevronDown, Loader, Star, Ruler, Save, Video, Menu, Wallet, Banknote, Bitcoin, ArrowLeft, Inbox,
  Phone, Clock, Calendar, FileCheck, ArrowDownLeft, ArrowUpRight as ArrowUpRightIcon
} from 'lucide-react';
import { FeatureFlags, UserRole, Product, ViewState, Vendor, Order, SubscriptionStatus, VerificationStatus, User, LandingPageContent, PaymentMethod, ContactSubmission, KycDocuments } from '../types.ts';
import { updateUserPassword, auth } from '../services/firebase.ts';
import { VendorProfileView } from './VendorProfileView.tsx';

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
  const [selectedFollower, setSelectedFollower] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File Input Refs for Uploads
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const kycIdFrontRef = useRef<HTMLInputElement>(null);
  const kycIdBackRef = useRef<HTMLInputElement>(null);
  const kycProofRef = useRef<HTMLInputElement>(null);

  // Editable Profile State
  const [profileForm, setProfileForm] = useState({
    name: currentVendor?.name || '',
    email: currentVendor?.email || '',
    avatar: currentVendor?.avatar || '',
    website: currentVendor?.website || '',
    instagram: currentVendor?.instagram || '',
    twitter: currentVendor?.twitter || '',
    bio: currentVendor?.bio || '',
    coverImage: currentVendor?.coverImage || ''
  });
  
  // Password Update State
  const [passwords, setPasswords] = useState({
      new: '',
      confirm: ''
  });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, success: false, error: '' });

  // KYC State
  const [kycFiles, setKycFiles] = useState<KycDocuments>({
      idFront: currentVendor?.kycDocuments?.idFront || '',
      idBack: currentVendor?.kycDocuments?.idBack || '',
      proofOfAddress: currentVendor?.kycDocuments?.proofOfAddress || ''
  });
  const [kycStatus, setKycStatus] = useState({ loading: false, success: false, error: '' });

  // Subscription Payment State
  const [showSubscriptionPayment, setShowSubscriptionPayment] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<string | null>(null);
  const [subPaymentDetails, setSubPaymentDetails] = useState({
     cardName: '',
     cardNumber: '',
     expiry: '',
     cvc: ''
  });

  // Payout/Withdrawal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState({ loading: false, success: false, error: '' });

  // CMS Form State
  const [cmsForm, setCmsForm] = useState<LandingPageContent | null>(null);
  const [cmsActiveSection, setCmsActiveSection] = useState<'LANDING' | 'ABOUT' | 'AUTH'>('LANDING');

  useEffect(() => {
    if (cmsContent) {
      setCmsForm(cmsContent);
    }
  }, [cmsContent]);
  
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

  // --- DYNAMIC CHART DATA GENERATION ---
  
  // Create sales data for charts based on actual orders
  const salesChartData = useMemo(() => {
     // Initialize last 7 days map
     const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
     const today = new Date();
     const chartDataMap = new Map<string, number>();
     
     // Last 7 days labels
     const result = [];
     for(let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayName = days[d.getDay()];
        chartDataMap.set(dayName, 0);
        result.push({ name: dayName, sales: 0, fullDate: d.toDateString() });
     }

     // Aggregate Order Totals
     orders.forEach(order => {
        const orderDate = new Date(order.date); // Assumes order.date is parsable string
        const orderDay = days[orderDate.getDay()];
        
        // Filter for Vendor logic if applicable
        let orderTotal = order.total;
        if (isVendor && currentVendor) {
            const vendorItems = order.items.filter(i => i.designer === currentVendor.name);
            if (vendorItems.length === 0) return; // Skip orders not for this vendor
            orderTotal = vendorItems.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);
        }

        const dataPoint = result.find(r => r.name === orderDay);
        if (dataPoint) {
            dataPoint.sales += orderTotal;
        }
     });

     return result;
  }, [orders, isVendor, currentVendor]);

  // Calculate stats dynamically for Vendors/Buyers
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
        twitter: currentVendor.twitter || '',
        bio: currentVendor.bio || '',
        coverImage: currentVendor.coverImage || ''
      });
      setKycFiles({
          idFront: currentVendor.kycDocuments?.idFront || '',
          idBack: currentVendor.kycDocuments?.idBack || '',
          proofOfAddress: currentVendor.kycDocuments?.proofOfAddress || ''
      });
      
      // Mock followers data with expanded details
      setFollowers([
          { id: 1, name: 'Sofia R.', location: 'Milan', avatar: 'https://i.pravatar.cc/150?u=1', joined: 'Oct 2023', purchases: 12, style: 'Avant-Garde' },
          { id: 2, name: 'James K.', location: 'London', avatar: 'https://i.pravatar.cc/150?u=2', joined: 'Dec 2023', purchases: 3, style: 'Minimalist' },
          { id: 3, name: 'Arjun P.', location: 'New York', avatar: 'https://i.pravatar.cc/150?u=3', joined: 'Jan 2024', purchases: 8, style: 'Streetwear' },
          { id: 4, name: 'Wei L.', location: 'Shanghai', avatar: 'https://i.pravatar.cc/150?u=4', joined: 'Feb 2024', purchases: 5, style: 'Luxury' },
      ]);
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
                sizes: newProduct.sizes || ['M'],
                isPreOrder: newProduct.isPreOrder
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

  const handleCmsImageUpdate = (e: React.ChangeEvent<HTMLInputElement>, section: string, key: string, subKey?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCmsForm(prev => {
            if (!prev) return null;
            if (section === 'about') {
               const aboutData = { ...prev.about };
               // @ts-ignore
               aboutData[key] = { ...aboutData[key], [subKey!]: result };
               return { ...prev, about: aboutData };
            }
            // @ts-ignore
            const sectionData = { ...prev[section], [key]: result };
            return { ...prev, [section]: sectionData };
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
              twitter: profileForm.twitter,
              bio: profileForm.bio,
              coverImage: profileForm.coverImage
            } 
          : v
      );
      setVendors(updatedVendors);
      alert("Profile updated successfully.");
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (passwords.new !== passwords.confirm) {
          setPasswordStatus({ loading: false, success: false, error: 'Passwords do not match' });
          return;
      }
      
      setPasswordStatus({ loading: true, success: false, error: '' });
      try {
          if (auth.currentUser) {
              await updateUserPassword(auth.currentUser, passwords.new);
              setPasswordStatus({ loading: false, success: true, error: '' });
              setPasswords({ new: '', confirm: '' });
              setTimeout(() => setPasswordStatus({ loading: false, success: false, error: '' }), 3000);
          } else {
              setPasswordStatus({ loading: false, success: false, error: 'User session invalid.' });
          }
      } catch (err) {
          setPasswordStatus({ loading: false, success: false, error: 'Failed to update password.' });
      }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!kycFiles.idFront || !kycFiles.proofOfAddress) {
          setKycStatus({ loading: false, success: false, error: 'Please upload ID and Proof of Address.' });
          return;
      }
      
      setKycStatus({ loading: true, success: false, error: '' });
      
      if (currentVendor && setVendors) {
          const updatedVendors = vendors.map(v => 
            v.id === currentVendor.id 
              ? { 
                  ...v, 
                  kycDocuments: { ...kycFiles, submittedAt: new Date().toISOString() },
                  verificationStatus: 'PENDING' as VerificationStatus
                } 
              : v
          );
          
          setTimeout(() => {
              setVendors(updatedVendors);
              setKycStatus({ loading: false, success: true, error: '' });
          }, 1500);
      }
  };

  const toggleUserStatus = async (user: User & { isVendor?: boolean }) => {
     const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
     
     if (user.isVendor && setVendors) {
        const updatedVendors = vendors.map(v => 
             v.id === user.id 
              ? { ...v, subscriptionStatus: newStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE' } as Vendor
              : v
        );
        setVendors(updatedVendors);
     } else if (!user.isVendor && onUpdateUser) {
        await onUpdateUser({ ...user, status: newStatus as any });
     }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
      const user = users.find(u => u.id === userId);
      if (user && onUpdateUser) {
          await onUpdateUser({ ...user, role: newRole as any });
      }
  };

  const initiatePlanUpgrade = (planName: string) => {
      setSelectedPlanForUpgrade(planName);
      if (planName === "Atelier") {
          performPlanUpgrade(planName);
      } else {
          setShowSubscriptionPayment(true);
      }
  };

  const performPlanUpgrade = (planName: string) => {
      if (currentVendor && setVendors) {
        const updatedVendors = vendors.map(v => {
            if (v.id === currentVendor.id) {
                return { ...v, subscriptionPlan: planName as any, subscriptionStatus: 'ACTIVE' } as Vendor;
            }
            return v;
        });
        setVendors(updatedVendors);
        setShowSubscriptionPayment(false);
        setSubPaymentDetails({cardName: '', cardNumber: '', expiry: '', cvc: ''});
        alert(`Plan switched to ${planName} and subscription activated.`);
    }
  };

  const handleSubscriptionPaymentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setTimeout(() => {
          setIsSubmitting(false);
          if (selectedPlanForUpgrade) {
              performPlanUpgrade(selectedPlanForUpgrade);
          }
      }, 1500);
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

  const renderFulfillment = () => {
      // Filter orders that contain items from this vendor
      const vendorOrders = orders.filter(o => 
          o.items.some(i => i.designer === currentVendor?.name)
      );

      return (
          <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-serif italic mb-6">Client Orders</h2>
              {vendorOrders.length === 0 ? (
                   <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200">
                       <p>No active orders to fulfill.</p>
                   </div>
              ) : (
                  <div className="space-y-4">
                      {vendorOrders.map(order => {
                          const vendorItems = order.items.filter(i => i.designer === currentVendor?.name);
                          const vendorTotal = vendorItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
                          
                          return (
                              <div key={order.id} className="bg-white border border-gray-100 p-6 shadow-sm">
                                  <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4">
                                      <div>
                                          <p className="font-bold text-sm">Order #{order.id}</p>
                                          <p className="text-xs text-gray-400">{order.date} • {order.customerName}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="font-bold text-sm">${vendorTotal}</p>
                                          <span className={`text-[10px] font-bold uppercase px-2 py-1 ${
                                              order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                              'bg-yellow-100 text-yellow-700'
                                          }`}>
                                              {order.status}
                                          </span>
                                      </div>
                                  </div>
                                  
                                  <div className="space-y-3 mb-4">
                                      {vendorItems.map((item, idx) => (
                                          <div key={idx} className="flex items-center gap-4 text-sm bg-gray-50 p-2 rounded-sm">
                                              <img src={item.image} className="w-10 h-10 object-cover rounded-sm" />
                                              <div className="flex-1">
                                                  <p className="font-bold">{item.name}</p>
                                                  <p className="text-xs text-gray-500">Size: {item.size} • Qty: {item.quantity}</p>
                                              </div>
                                              <span>${item.price * item.quantity}</span>
                                          </div>
                                      ))}
                                  </div>

                                  <div className="flex gap-2 justify-end">
                                      {order.status !== 'Delivered' && (
                                          <>
                                              <button 
                                                  onClick={() => onUpdateOrderStatus && onUpdateOrderStatus(order.id, 'Shipped')}
                                                  className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2"
                                              >
                                                  <Truck size={14} /> Mark Shipped
                                              </button>
                                              <button 
                                                  onClick={() => onUpdateOrderStatus && onUpdateOrderStatus(order.id, 'Delivered')}
                                                  className="border border-gray-200 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors flex items-center gap-2"
                                              >
                                                  <CheckCircle size={14} /> Mark Delivered
                                              </button>
                                          </>
                                      )}
                                      <button className="border border-gray-200 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors flex items-center gap-2">
                                          <FileText size={14} /> Print Slip
                                      </button>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              )}
          </div>
      );
  };

  const renderPayouts = () => {
      // Logic for calculating balance
      const vendorOrders = orders.filter(o => o.items.some(i => i.designer === currentVendor?.name));
      
      const deliveredOrders = vendorOrders.filter(o => o.status === 'Delivered');
      const activeOrders = vendorOrders.filter(o => o.status !== 'Delivered');

      const calculateShare = (orderList: Order[]) => {
          return orderList.reduce((acc, order) => {
              const vendorItems = order.items.filter(i => i.designer === currentVendor?.name);
              const total = vendorItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
              return acc + total;
          }, 0);
      };

      const grossDelivered = calculateShare(deliveredOrders);
      const grossPending = calculateShare(activeOrders);
      const commissionRate = 0.15; // 15%

      const availableBalance = grossDelivered * (1 - commissionRate);
      const pendingBalance = grossPending * (1 - commissionRate);

      const handleWithdrawSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const amount = parseFloat(withdrawAmount);
          if (amount <= 0 || amount > availableBalance) {
              setWithdrawStatus({ loading: false, success: false, error: 'Invalid amount or insufficient funds.' });
              return;
          }

          setWithdrawStatus({ loading: true, success: false, error: '' });
          
          // Simulation
          setTimeout(() => {
              setWithdrawStatus({ loading: false, success: true, error: '' });
              setWithdrawAmount('');
              // Reset after showing success for a moment
              setTimeout(() => {
                  setWithdrawStatus({ loading: false, success: false, error: '' });
                  setShowWithdrawModal(false);
              }, 2000);
          }, 1500);
      };

      return (
          <div className="space-y-8 animate-fade-in relative">
              {showWithdrawModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
                      <div className="bg-white max-w-sm w-full p-8 shadow-2xl relative animate-slide-up">
                          <button onClick={() => setShowWithdrawModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"><X size={20}/></button>
                          
                          <div className="text-center mb-6">
                              <Wallet size={32} className="mx-auto text-luxury-gold mb-3" />
                              <h3 className="text-xl font-bold uppercase tracking-widest">Request Payout</h3>
                              <p className="text-xs text-gray-500">Secure withdrawal to your linked account.</p>
                          </div>

                          <div className="bg-gray-50 p-4 border border-gray-100 rounded-sm mb-6">
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Available Balance</p>
                              <p className="text-2xl font-serif italic font-bold text-black">${availableBalance.toFixed(2)}</p>
                          </div>

                          {withdrawStatus.success ? (
                              <div className="flex flex-col items-center justify-center py-6 text-green-600 animate-fade-in">
                                  <CheckCircle size={48} className="mb-2" />
                                  <p className="text-sm font-bold">Request Submitted!</p>
                                  <p className="text-[10px] text-gray-500">Funds typically arrive in 1-3 business days.</p>
                              </div>
                          ) : (
                              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                                  <div>
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Withdrawal Amount ($)</label>
                                      <input 
                                          type="number"
                                          step="0.01"
                                          max={availableBalance}
                                          min="1"
                                          value={withdrawAmount}
                                          onChange={(e) => setWithdrawAmount(e.target.value)}
                                          className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none font-mono"
                                          placeholder="0.00"
                                      />
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">To Account</label>
                                      <div className="flex items-center gap-3 border-b border-gray-200 py-2">
                                          <Banknote size={16} className="text-gray-400" />
                                          <span className="text-sm text-gray-600">Bank Account ending in •••• 4281</span>
                                      </div>
                                  </div>

                                  {withdrawStatus.error && (
                                      <p className="text-xs text-red-500 flex items-center gap-1 mt-2"><AlertCircle size={12} /> {withdrawStatus.error}</p>
                                  )}

                                  <button 
                                      type="submit" 
                                      disabled={!withdrawAmount || withdrawStatus.loading || parseFloat(withdrawAmount) > availableBalance}
                                      className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                                  >
                                      {withdrawStatus.loading ? <Loader className="animate-spin" size={14} /> : 'Confirm Withdrawal'}
                                  </button>
                              </form>
                          )}
                      </div>
                  </div>
              )}

              <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-serif italic">Wallet & Payouts</h2>
                   <button 
                      onClick={() => setShowWithdrawModal(true)}
                      className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2"
                   >
                       <ArrowUpRightIcon size={16} /> Withdraw Funds
                   </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-luxury-black text-white p-6 shadow-lg">
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Available Balance</p>
                      <p className="text-3xl font-bold font-serif italic">${availableBalance.toFixed(2)}</p>
                      <p className="text-[10px] text-gray-400 mt-2">Ready for withdrawal</p>
                  </div>
                  <div className="bg-white border border-gray-100 p-6 shadow-sm">
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Pending Clearance</p>
                      <p className="text-3xl font-bold">${pendingBalance.toFixed(2)}</p>
                      <p className="text-[10px] text-gray-400 mt-2">Funds from active orders</p>
                  </div>
                   <div className="bg-white border border-gray-100 p-6 shadow-sm">
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Commission Rate</p>
                      <p className="text-3xl font-bold">15%</p>
                      <p className="text-[10px] text-gray-400 mt-2">Standard Tier</p>
                  </div>
              </div>

              <div className="bg-white border border-gray-100 shadow-sm">
                  <div className="p-6 border-b border-gray-50">
                      <h3 className="font-bold text-sm uppercase tracking-widest">Transaction History</h3>
                  </div>
                  {vendorOrders.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 italic">No transactions recorded yet.</div>
                  ) : (
                      <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                              <tr>
                                  <th className="p-4">Date</th>
                                  <th className="p-4">Description</th>
                                  <th className="p-4">Type</th>
                                  <th className="p-4 text-right">Amount</th>
                                  <th className="p-4 text-right">Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {vendorOrders.slice(0, 10).map(order => {
                                   const vendorItems = order.items.filter(i => i.designer === currentVendor?.name);
                                   const total = vendorItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
                                   const net = total * 0.85;

                                  return (
                                      <tr key={order.id}>
                                          <td className="p-4 text-gray-500">{order.date}</td>
                                          <td className="p-4 font-medium">Order #{order.id} Revenue</td>
                                          <td className="p-4"><span className="bg-green-50 text-green-700 px-2 py-1 text-[10px] font-bold uppercase rounded-sm">Sale</span></td>
                                          <td className="p-4 text-right font-mono">+${net.toFixed(2)}</td>
                                          <td className="p-4 text-right">
                                              <span className={`text-[10px] font-bold uppercase px-2 py-1 ${order.status === 'Delivered' ? 'text-gray-500' : 'text-orange-500'}`}>
                                                  {order.status === 'Delivered' ? 'Cleared' : 'Pending'}
                                              </span>
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  )}
              </div>
          </div>
      );
  };

  const renderFollowers = () => {
      return (
          <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-serif italic mb-6">Community</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {followers.map(follower => (
                      <div key={follower.id} className="bg-white border border-gray-100 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                          <img src={follower.avatar} className="w-16 h-16 rounded-full mb-4 object-cover border border-gray-100" />
                          <h3 className="font-bold text-sm">{follower.name}</h3>
                          <p className="text-xs text-gray-400 mb-4">{follower.location}</p>
                          <button 
                            onClick={() => setSelectedFollower(follower)}
                            className="text-[10px] font-bold uppercase tracking-widest border border-gray-200 px-4 py-2 hover:bg-black hover:text-white transition-colors"
                          >
                              View Profile
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const renderStoreDesign = () => {
      return (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
              <h2 className="text-2xl font-serif italic mb-6">Storefront Design</h2>
              
              <div className="bg-white p-8 border border-gray-100 shadow-sm space-y-8">
                  <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Cover Image</h3>
                          <span className="text-[10px] text-gray-400">Recommended 2400x600px</span>
                      </div>
                      <div className="relative w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 group overflow-hidden cursor-pointer hover:border-black transition-colors">
                          <img 
                              src={profileForm.coverImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"} 
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <ImageIcon className="mb-2 text-gray-400 group-hover:text-black" />
                              <span className="text-xs font-bold uppercase text-gray-500 group-hover:text-black">Upload New Cover</span>
                          </div>
                          <input 
                              type="file" 
                              accept="image/*"
                              ref={coverFileInputRef}
                              onChange={(e) => handleFileUpload(e, (base64) => setProfileForm({...profileForm, coverImage: base64}))}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                      </div>
                  </div>

                  <div className="space-y-4">
                       <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Brand Biography</h3>
                       <textarea 
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                          className="w-full border border-gray-200 p-4 text-sm focus:border-black outline-none h-32 resize-none"
                          placeholder="Tell your brand story..."
                       />
                       <p className="text-[10px] text-gray-400">This text will appear on your public atelier profile.</p>
                  </div>

                  {/* Social Links Section */}
                  <div className="space-y-4">
                       <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Digital Presence</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                               <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                   <Globe size={12} /> Website
                               </label>
                               <input 
                                  type="text"
                                  placeholder="https://www.yourbrand.com"
                                  value={profileForm.website}
                                  onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                                  className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                               />
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                   <Instagram size={12} /> Instagram Handle
                               </label>
                               <input 
                                  type="text"
                                  placeholder="@yourbrand"
                                  value={profileForm.instagram}
                                  onChange={(e) => setProfileForm({...profileForm, instagram: e.target.value})}
                                  className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                               />
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                   <Twitter size={12} /> Twitter Handle
                               </label>
                               <input 
                                  type="text"
                                  placeholder="@yourbrand"
                                  value={profileForm.twitter}
                                  onChange={(e) => setProfileForm({...profileForm, twitter: e.target.value})}
                                  className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                               />
                           </div>
                       </div>
                  </div>

                   <div className="space-y-4">
                       <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Visual Theme</h3>
                       <div className="grid grid-cols-3 gap-4">
                           <button className="border-2 border-black p-4 text-center">
                               <div className="w-full h-12 bg-gray-50 mb-2 border border-gray-100" />
                               <span className="text-xs font-bold">Minimalist (Active)</span>
                           </button>
                           <button className="border border-gray-200 p-4 text-center opacity-50 cursor-not-allowed">
                               <div className="w-full h-12 bg-black mb-2" />
                               <span className="text-xs font-bold">Dark Mode</span>
                           </button>
                           <button className="border border-gray-200 p-4 text-center opacity-50 cursor-not-allowed">
                               <div className="w-full h-12 bg-luxury-gold mb-2" />
                               <span className="text-xs font-bold">Atelier Gold</span>
                           </button>
                       </div>
                   </div>
                   
                   <div className="pt-6 border-t border-gray-100">
                        <button onClick={handleSaveProfile} className="bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2">
                            <Save size={16} /> Save Changes
                        </button>
                   </div>
              </div>
          </div>
      );
  };
  
  const renderStorePreview = () => {
      if (!currentVendor) return null;
      return (
          <div className="bg-white border border-gray-200 shadow-2xl overflow-hidden rounded-sm relative">
              <div className="bg-gray-100 p-2 flex justify-between items-center text-xs text-gray-500 border-b border-gray-200">
                  <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span>Preview Mode: Public View</span>
                  <button onClick={() => setActiveTab('OVERVIEW')}><X size={14}/></button>
              </div>
              <div className="h-[80vh] overflow-y-auto">
                 <VendorProfileView 
                    vendor={currentVendor} 
                    onProductSelect={onProductSelect || (() => {})} 
                    onNavigate={() => {}} // Disable navigation in preview
                    products={products}
                 />
              </div>
          </div>
      );
  };

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
                                <AreaChart data={salesChartData}>
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
                                        <p className="text-xs font-bold text-gray-900">New Order</p>
                                        <p className="text-[10px] text-gray-500">#{o.id} • {o.customerName} • ${o.total}</p>
                                    </div>
                                    <span className="ml-auto text-[10px] text-gray-400">{o.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    } 

    // Regular Vendor / Buyer View
    return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Subscription Payment Modal */}
      {showSubscriptionPayment && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
              <div className="bg-white max-w-md w-full p-8 shadow-2xl relative animate-slide-up">
                   <button 
                      onClick={() => setShowSubscriptionPayment(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                   >
                       <X size={20} />
                   </button>
                   <div className="text-center mb-8">
                       <Diamond size={32} className="mx-auto text-luxury-gold mb-4" />
                       <h3 className="text-2xl font-serif italic mb-2">Secure Payment</h3>
                       <p className="text-sm text-gray-500">Upgrade to {selectedPlanForUpgrade}</p>
                   </div>
                   
                   <form onSubmit={handleSubscriptionPaymentSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cardholder Name</label>
                            <input 
                                required
                                type="text"
                                placeholder="Name on Card"
                                value={subPaymentDetails.cardName}
                                onChange={(e) => setSubPaymentDetails({...subPaymentDetails, cardName: e.target.value})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Card Number</label>
                            <div className="relative">
                                <input 
                                    required
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    value={subPaymentDetails.cardNumber}
                                    onChange={(e) => setSubPaymentDetails({...subPaymentDetails, cardNumber: e.target.value})}
                                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                                />
                                <CreditCard size={16} className="absolute right-0 top-2 text-gray-400" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Expiry</label>
                                <div className="relative">
                                    <input 
                                        required
                                        type="text"
                                        placeholder="MM/YY"
                                        value={subPaymentDetails.expiry}
                                        onChange={(e) => setSubPaymentDetails({...subPaymentDetails, expiry: e.target.value})}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                                    />
                                    <Calendar size={16} className="absolute right-0 top-2 text-gray-400" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">CVC</label>
                                <div className="relative">
                                    <input 
                                        required
                                        type="text"
                                        placeholder="123"
                                        value={subPaymentDetails.cvc}
                                        onChange={(e) => setSubPaymentDetails({...subPaymentDetails, cvc: e.target.value})}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                                    />
                                    <Lock size={16} className="absolute right-0 top-2 text-gray-400" />
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                        >
                           {isSubmitting ? <Loader className="animate-spin" size={16} /> : <>Pay & Upgrade <Lock size={16} /></>}
                        </button>
                   </form>
              </div>
          </div>
      )}

      {/* Follower Profile Modal */}
      {selectedFollower && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white p-8 max-w-sm w-full shadow-2xl relative animate-slide-up">
                <button onClick={() => setSelectedFollower(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"><X size={20}/></button>
                <div className="flex flex-col items-center text-center">
                    <img src={selectedFollower.avatar} className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-gray-100" />
                    <h3 className="text-xl font-bold font-serif italic mb-1">{selectedFollower.name}</h3>
                    <p className="text-xs text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={10} /> {selectedFollower.location}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 w-full mb-6 border-y border-gray-100 py-4">
                        <div>
                            <p className="text-lg font-bold">{selectedFollower.purchases}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Orders</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold">{selectedFollower.style}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Style</p>
                        </div>
                    </div>
                    
                    <div className="w-full space-y-3">
                        <p className="text-xs text-gray-500 mb-2">Member since {selectedFollower.joined}</p>
                        <button className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors">
                            Message Client
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-serif italic mb-2">Dashboard Overview</h2>
           <p className="text-gray-500 text-sm">Welcome back, {role === UserRole.VENDOR ? currentVendor?.name : 'User'}</p>
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
            <h3 className="text-lg font-bold mb-6">Revenue Analytics (Last 7 Days)</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesChartData}>
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
                {orders.length === 0 ? (
                    <p className="text-sm text-gray-400 italic text-center py-12">No recent activity recorded.</p>
                ) : (
                    orders.slice(0, 5).map(o => (
                         <div key={o.id} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0">
                            <div className="mt-1 p-1.5 bg-green-100 text-green-600 rounded-full">
                                <DollarSign size={10} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">New Sale</p>
                                <p className="text-xs text-gray-500">#{o.id} • ${o.total}</p>
                            </div>
                            <span className="ml-auto text-[10px] text-gray-400">{o.date}</span>
                        </div>
                    ))
                )}
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
        {activeTab === 'FULFILLMENT' && renderFulfillment()}
        {activeTab === 'PAYOUTS' && renderPayouts()}
        {activeTab === 'FOLLOWERS' && renderFollowers()}
        {activeTab === 'STORE_DESIGN' && renderStoreDesign()}
        {activeTab === 'STORE_PREVIEW' && renderStorePreview()}
        
        {/* SUBSCRIPTION PLAN TAB */}
        {activeTab === 'SUBSCRIPTION_PLAN' && (
            <div className="space-y-8 animate-fade-in">
                 <h2 className="text-2xl font-serif italic mb-6">Membership Tiers</h2>
                 <p className="text-gray-500 max-w-2xl mb-8">
                    Elevate your atelier's presence. Upgrade your plan to unlock analytics, lower commission rates, and priority placement in the marketplace.
                 </p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {SUBSCRIPTION_PLANS.map((plan, idx) => (
                         <div key={idx} className={`bg-white border p-8 flex flex-col relative ${currentVendor?.subscriptionPlan === plan.name ? 'border-luxury-gold shadow-md' : 'border-gray-100 shadow-sm'}`}>
                             {currentVendor?.subscriptionPlan === plan.name && (
                                 <div className="absolute top-0 right-0 bg-luxury-gold text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                                     Current Plan
                                 </div>
                             )}
                             <h3 className="text-xl font-bold uppercase tracking-widest mb-2">{plan.name}</h3>
                             <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-3xl font-serif italic">{plan.price}</span>
                                <span className="text-xs text-gray-400">{plan.period}</span>
                             </div>
                             <p className="text-xs text-gray-500 mb-6 min-h-[40px]">{plan.description}</p>
                             
                             <ul className="space-y-3 mb-8 flex-1">
                                 {plan.features.map((feat, i) => (
                                     <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                         <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                                         <span>{feat}</span>
                                     </li>
                                 ))}
                             </ul>
                             
                             <button 
                                onClick={() => initiatePlanUpgrade(plan.name)}
                                disabled={currentVendor?.subscriptionPlan === plan.name}
                                className={`w-full py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                                    currentVendor?.subscriptionPlan === plan.name 
                                        ? 'bg-gray-100 text-gray-400 cursor-default' 
                                        : 'bg-black text-white hover:bg-luxury-gold'
                                }`}
                             >
                                 {currentVendor?.subscriptionPlan === plan.name ? 'Active' : 'Select Plan'}
                             </button>
                         </div>
                     ))}
                 </div>
            </div>
        )}

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
                            {['Outerwear', 'Bottoms', 'Knitwear', 'Footwear', 'Accessories', 'Tops'].map(c => (
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
                 <h2 className="text-2xl font-serif italic mb-6">{isAdmin ? 'All Orders' : 'My Purchases'}</h2>
                 {orders.length === 0 ? (
                     <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200">
                         <p>No orders found.</p>
                     </div>
                 ) : (
                     <div className="space-y-4">
                         {/* For Vendors/Buyers, show purchases. For Admin, show all. */}
                         {orders.filter(o => isAdmin || o.customerName === (auth.currentUser?.email || '')).map(order => (
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
                                 {(isAdmin) && order.status !== 'Delivered' && (
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
                         {orders.filter(o => isAdmin || o.customerName === (auth.currentUser?.email || '')).length === 0 && (
                             <div className="text-center py-12 text-gray-400">
                                 <p>You haven't made any purchases yet.</p>
                             </div>
                         )}
                     </div>
                 )}
             </div>
        )}

        {activeTab === 'CMS' && isAdmin && (
            <div className="space-y-8 animate-fade-in">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-serif italic">Content Management</h2>
                    <div className="flex gap-2">
                        {(['LANDING', 'ABOUT', 'AUTH'] as const).map(section => (
                            <button
                                key={section}
                                onClick={() => setCmsActiveSection(section)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all ${
                                    cmsActiveSection === section 
                                        ? 'bg-black text-white' 
                                        : 'bg-white border border-gray-200 text-gray-500 hover:border-black hover:text-black'
                                }`}
                            >
                                {section}
                            </button>
                        ))}
                    </div>
                </div>

                {cmsForm ? (
                    <div className="bg-white p-8 border border-gray-100 shadow-sm space-y-12">
                         {/* LANDING PAGE EDITING */}
                         {cmsActiveSection === 'LANDING' && (
                             <>
                                <section className="space-y-6">
                                    <h3 className="text-sm font-bold uppercase border-b border-gray-100 pb-2">Hero Section</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Title Line 1</label>
                                            <input value={cmsForm.hero.titleLine1} onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, titleLine1: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Title Line 2 (Italic)</label>
                                            <input value={cmsForm.hero.titleLine2} onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, titleLine2: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Subtitle</label>
                                            <input value={cmsForm.hero.subtitle} onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, subtitle: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Button Text</label>
                                            <input value={cmsForm.hero.buttonText} onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, buttonText: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Video URL</label>
                                            <input value={cmsForm.hero.videoUrl} onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, videoUrl: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Poster Image URL (Fallback)</label>
                                            <input value={cmsForm.hero.posterUrl} onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, posterUrl: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" />
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h3 className="text-sm font-bold uppercase border-b border-gray-100 pb-2">Marquee</h3>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Scrolling Text (Use • to separate)</label>
                                        <textarea value={cmsForm.marquee.text} onChange={e => setCmsForm({...cmsForm, marquee: {...cmsForm.marquee, text: e.target.value}})} className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none h-24" />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h3 className="text-sm font-bold uppercase border-b border-gray-100 pb-2">Campaign & Spotlight</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Campaign Title</label>
                                            <input value={cmsForm.campaign.title} onChange={e => setCmsForm({...cmsForm, campaign: {...cmsForm.campaign, title: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Spotlight Title</label>
                                            <input value={cmsForm.spotlight.title} onChange={e => setCmsForm({...cmsForm, spotlight: {...cmsForm.spotlight, title: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Campaign Overlay Text</label>
                                            <input value={cmsForm.campaign.overlayText1} onChange={e => setCmsForm({...cmsForm, campaign: {...cmsForm.campaign, overlayText1: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map(num => (
                                            <div key={num} className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Image {num}</label>
                                                <div className="aspect-[3/4] bg-gray-100 relative group overflow-hidden">
                                                    {/* @ts-ignore */}
                                                    <img src={cmsForm.campaign[`image${num}`]} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                        <span className="text-white text-xs font-bold uppercase">Change</span>
                                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleCmsImageUpdate(e, 'campaign', `image${num}`)} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                             </>
                         )}

                         {/* ABOUT & CONTACT EDITING */}
                         {cmsActiveSection === 'ABOUT' && (
                             <>
                                <section className="space-y-6">
                                    <h3 className="text-sm font-bold uppercase border-b border-gray-100 pb-2">About Page Hero</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Title</label>
                                            <input value={cmsForm.about.hero.title} onChange={e => setCmsForm({...cmsForm, about: {...cmsForm.about, hero: {...cmsForm.about.hero, title: e.target.value}}})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Subtitle</label>
                                            <input value={cmsForm.about.hero.subtitle} onChange={e => setCmsForm({...cmsForm, about: {...cmsForm.about, hero: {...cmsForm.about.hero, subtitle: e.target.value}}})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</label>
                                            <textarea value={cmsForm.about.hero.description} onChange={e => setCmsForm({...cmsForm, about: {...cmsForm.about, hero: {...cmsForm.about.hero, description: e.target.value}}})} className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none h-24" />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Hero Image</label>
                                            <div className="h-48 bg-gray-100 relative group overflow-hidden">
                                                <img src={cmsForm.about.hero.imageUrl} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                    <span className="text-white text-xs font-bold uppercase">Change Image</span>
                                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleCmsImageUpdate(e, 'about', 'hero', 'imageUrl')} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                             </>
                         )}

                         <div className="pt-6 border-t border-gray-100">
                            <button onClick={handleSaveCMS} className="bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2">
                                {isSubmitting ? <Loader className="animate-spin" size={14}/> : <Save size={16} />} Save Changes
                            </button>
                         </div>
                    </div>
                ) : <p className="text-center py-12 text-gray-400">Loading Content Management System...</p>}
            </div>
        )}

        {activeTab === 'PROFILE' && (
            <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
                <h2 className="text-2xl font-serif italic mb-6">Profile Settings</h2>
                
                {/* General Information */}
                <div className="bg-white p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-gray-400 border-b border-gray-50 pb-2">General Information</h3>
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

                {/* Security Section (Update Password) */}
                <div className="bg-white p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-gray-400 border-b border-gray-50 pb-2">Security</h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                             <label className="text-xs font-bold uppercase tracking-widest text-gray-400">New Password</label>
                             <input 
                                type="password"
                                value={passwords.new}
                                onChange={e => setPasswords({...passwords, new: e.target.value})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                                placeholder="Min. 8 characters"
                             />
                        </div>
                        <div>
                             <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Confirm Password</label>
                             <input 
                                type="password"
                                value={passwords.confirm}
                                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                                placeholder="Repeat new password"
                             />
                        </div>
                        {passwordStatus.error && (
                            <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {passwordStatus.error}</p>
                        )}
                        {passwordStatus.success && (
                            <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle size={12}/> Password updated successfully</p>
                        )}
                        <button 
                            type="submit" 
                            disabled={!passwords.new || passwordStatus.loading}
                            className="w-full border border-gray-200 text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors mt-2 disabled:opacity-50"
                        >
                            {passwordStatus.loading ? <Loader className="animate-spin mx-auto" size={14} /> : 'Update Password'}
                        </button>
                    </form>
                </div>

                {/* KYC Section (Vendors Only) */}
                {isVendor && (
                    <div className="bg-white p-8 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-2">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Identity Verification</h3>
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                                currentVendor?.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : 
                                currentVendor?.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                                {currentVendor?.verificationStatus || 'PENDING'}
                            </span>
                        </div>
                        
                        <form onSubmit={handleKycSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ID Front</label>
                                    <div className="aspect-video bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center relative cursor-pointer hover:bg-gray-100 transition-colors">
                                        {kycFiles.idFront ? (
                                            <img src={kycFiles.idFront} className="w-full h-full object-cover" />
                                        ) : (
                                            <FileCheck className="text-gray-300" />
                                        )}
                                        <input 
                                            type="file" 
                                            ref={kycIdFrontRef}
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, (base64) => setKycFiles({...kycFiles, idFront: base64}))}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ID Back</label>
                                    <div className="aspect-video bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center relative cursor-pointer hover:bg-gray-100 transition-colors">
                                        {kycFiles.idBack ? (
                                            <img src={kycFiles.idBack} className="w-full h-full object-cover" />
                                        ) : (
                                            <FileCheck className="text-gray-300" />
                                        )}
                                        <input 
                                            type="file" 
                                            ref={kycIdBackRef}
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, (base64) => setKycFiles({...kycFiles, idBack: base64}))}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Proof of Address (Utility Bill / Bank Statement)</label>
                                <div className="h-24 bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center relative cursor-pointer hover:bg-gray-100 transition-colors">
                                    {kycFiles.proofOfAddress ? (
                                        <img src={kycFiles.proofOfAddress} className="w-full h-full object-cover opacity-50" />
                                    ) : (
                                        <div className="text-center">
                                            <UploadCloud className="text-gray-300 mx-auto mb-1" size={20} />
                                            <span className="text-[10px] text-gray-400">Upload Document</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={kycProofRef}
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, (base64) => setKycFiles({...kycFiles, proofOfAddress: base64}))}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {kycStatus.error && (
                                <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {kycStatus.error}</p>
                            )}
                            {kycStatus.success && (
                                <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle size={12}/> Documents submitted successfully</p>
                            )}

                            <button 
                                type="submit" 
                                disabled={kycStatus.loading || currentVendor?.verificationStatus === 'VERIFIED'}
                                className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:opacity-50"
                            >
                                {kycStatus.loading ? <Loader className="animate-spin mx-auto" size={14} /> : (currentVendor?.verificationStatus === 'VERIFIED' ? 'Verified' : 'Submit for Verification')}
                            </button>
                        </form>
                    </div>
                )}
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
                                    <td className="p-4">
                                        <select 
                                            value={u.role}
                                            onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                                            className="text-[10px] font-bold uppercase bg-gray-100 px-2 py-1 rounded-sm border-none focus:ring-0 cursor-pointer outline-none"
                                        >
                                            <option value="BUYER">BUYER</option>
                                            <option value="VENDOR">VENDOR</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </td>
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
        
        {['REVIEWS', 'TRANSACTIONS', 'SETTINGS', 'VERIFICATION', 'SUBSCRIPTIONS'].includes(activeTab) && (
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
