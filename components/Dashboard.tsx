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
  UserX, Camera, MessageCircle, Ban, Diamond, Check, Edit2, X, ShieldCheck, ShieldAlert, Shield, BadgeCheck,
  Power, Lock, MessageSquare, Flag, Store, Grid, Columns, ChevronDown, Loader, Star, Ruler, Save, Video, Menu, Wallet, Banknote, Bitcoin, ArrowLeft, Inbox,
  Phone, Clock, Calendar, FileCheck, ArrowDownLeft, ArrowUpRight as ArrowUpRightIcon, User as UserIcon
} from 'lucide-react';
import { FeatureFlags, UserRole, Product, ViewState, Vendor, Order, SubscriptionStatus, VerificationStatus, User, LandingPageContent, PaymentMethod, ContactSubmission, KycDocuments, Follower } from '../types.ts';
import { updateUserPassword, auth } from '../services/firebase.ts';
import { VendorProfileView } from './VendorProfileView.tsx';
import { fetchVendorFollowers, addFollowerToDb } from '../services/dataService.ts';

const COLORS = ['#0a0a0a', '#C5A059', '#8B8580', '#E5E5E5', '#4A0404'];

interface DashboardProps {
  role: UserRole;
  featureFlags: FeatureFlags;
  toggleFeatureFlag: (key: keyof FeatureFlags) => void;
  onNavigate: (view: ViewState) => void;
  initialTab?: DashboardTab;
  vendors?: Vendor[];
  setVendors?: (vendors: Vendor[]) => Promise<void>;
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
  // Identify current buyer based on authenticated email match
  const currentBuyer = isBuyer ? users.find(u => u.email.toLowerCase() === auth.currentUser?.email?.toLowerCase()) : null;
  
  const isSubscribed = currentVendor?.subscriptionStatus === 'ACTIVE';
  const isVerified = currentVendor?.verificationStatus === 'VERIFIED';

  const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<Product[]>([]); 
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [selectedFollower, setSelectedFollower] = useState<Follower | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState<Vendor | null>(null);

  // File Input Refs for Uploads
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const kycIdFrontRef = useRef<HTMLInputElement>(null);
  const kycIdBackRef = useRef<HTMLInputElement>(null);
  const kycProofRef = useRef<HTMLInputElement>(null);

  // Vendor Profile State
  const [profileForm, setProfileForm] = useState({
    name: currentVendor?.name || '',
    email: currentVendor?.email || '',
    avatar: currentVendor?.avatar || '',
    website: currentVendor?.website || '',
    instagram: currentVendor?.instagram || '',
    twitter: currentVendor?.twitter || '',
    bio: currentVendor?.bio || '',
    coverImage: currentVendor?.coverImage || '',
    visualTheme: currentVendor?.visualTheme || 'MINIMALIST'
  });

  // Buyer Profile State
  const [buyerForm, setBuyerForm] = useState({
      name: currentBuyer?.name || '',
      phone: currentBuyer?.phone || '',
      avatar: currentBuyer?.avatar || '',
      street: currentBuyer?.shippingAddress?.street || '',
      city: currentBuyer?.shippingAddress?.city || '',
      state: currentBuyer?.shippingAddress?.state || '',
      zip: currentBuyer?.shippingAddress?.zip || '',
      country: currentBuyer?.shippingAddress?.country || '',
      bust: currentBuyer?.measurements?.bust || '',
      waist: currentBuyer?.measurements?.waist || '',
      hips: currentBuyer?.measurements?.hips || '',
      height: currentBuyer?.measurements?.height || '',
      shoeSize: currentBuyer?.measurements?.shoeSize || ''
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
  
  // Payment Method State
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState<{
      type: 'BANK' | 'CRYPTO';
      bankName: string;
      accountName: string;
      accountNumber: string;
      routingNumber: string;
      walletAddress: string;
      network: string;
  }>({
      type: 'BANK',
      bankName: '',
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      walletAddress: '',
      network: 'BTC'
  });

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
  // ... (Sales chart logic remains the same)
  const salesChartData = useMemo(() => {
     const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
     const today = new Date();
     const result = [];
     for(let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayName = days[d.getDay()];
        result.push({ name: dayName, sales: 0, fullDate: d.toDateString() });
     }
     orders.forEach(order => {
        const orderDate = new Date(order.date);
        const orderDay = days[orderDate.getDay()];
        let orderTotal = order.total;
        if (isVendor && currentVendor) {
            const vendorItems = order.items.filter(i => i.designer === currentVendor.name);
            if (vendorItems.length === 0) return;
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
  // ... (Admin stats logic remains the same)
  const adminStats = useMemo(() => {
    if (!isAdmin) return null;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = totalRevenue / (orders.length || 1);
    const pendingVerifications = vendors.filter(v => v.verificationStatus === 'PENDING').length;
    const categoryCounts: Record<string, number> = {};
    products.forEach(p => { categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1; });
    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
    const vendorPerformance: Record<string, number> = {};
    orders.forEach(o => {
        o.items.forEach(item => {
            vendorPerformance[item.designer] = (vendorPerformance[item.designer] || 0) + (item.price * item.quantity);
        });
    });
    const topVendors = Object.entries(vendorPerformance).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    return { totalRevenue, avgOrderValue, pendingVerifications, categoryData, topVendors };
  }, [isAdmin, orders, vendors, products]);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);
  
  // Profile Form & Initial Followers Load
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
        coverImage: currentVendor.coverImage || '',
        visualTheme: currentVendor.visualTheme || 'MINIMALIST'
      });
      setKycFiles({
          idFront: currentVendor.kycDocuments?.idFront || '',
          idBack: currentVendor.kycDocuments?.idBack || '',
          proofOfAddress: currentVendor.kycDocuments?.proofOfAddress || ''
      });
      fetchVendorFollowers(currentVendor.id).then(data => setFollowers(data));
    }
  }, [currentVendor]);

  // Sync Buyer form when currentBuyer changes
  useEffect(() => {
      if (currentBuyer) {
          setBuyerForm({
              name: currentBuyer.name || '',
              phone: currentBuyer.phone || '',
              avatar: currentBuyer.avatar || '',
              street: currentBuyer.shippingAddress?.street || '',
              city: currentBuyer.shippingAddress?.city || '',
              state: currentBuyer.shippingAddress?.state || '',
              zip: currentBuyer.shippingAddress?.zip || '',
              country: currentBuyer.shippingAddress?.country || '',
              bust: currentBuyer.measurements?.bust || '',
              waist: currentBuyer.measurements?.waist || '',
              hips: currentBuyer.measurements?.hips || '',
              height: currentBuyer.measurements?.height || '',
              shoeSize: currentBuyer.measurements?.shoeSize || ''
          });
      }
  }, [currentBuyer]);

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

  const handleEditProduct = (product: Product) => { setNewProduct(product); setIsEditing(true); setActiveTab('UPLOAD'); };
  const handleCancelEdit = () => { setIsEditing(false); setNewProduct({ name: '', price: 0, category: 'Outerwear', description: '', image: '', designer: currentVendor?.name || '', stock: 1, sizes: ['S', 'M', 'L'] }); };
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!currentVendor) { alert("Vendor profile not found."); setIsSubmitting(false); return; }
    if (!isSubscribed) { alert("Please subscribe to publish products."); setIsSubmitting(false); return; }
    if (!isVerified) { alert("Your vendor profile must be verified by our team before listing products."); setIsSubmitting(false); return; }
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
            if (onAddProduct) await onAddProduct(product);
        }
        setActiveTab('PRODUCTS');
        setNewProduct({ name: '', price: 0, category: 'Outerwear', description: '', image: '', designer: currentVendor?.name || '', stock: 1, sizes: ['S', 'M', 'L'] });
    } catch (err) { alert('Failed to save product. Please try again.'); console.error(err); } finally { setIsSubmitting(false); }
  };

  const handleSaveCMS = async () => { if (onUpdateCMSContent && cmsForm) { setIsSubmitting(true); try { await onUpdateCMSContent(cmsForm); alert('Site content updated successfully!'); } catch (e) { console.error("CMS Update failed", e); alert('Failed to update landing page.'); } finally { setIsSubmitting(false); } } };
  
  const handleSaveProfile = async () => {
    if (currentVendor && setVendors) {
      setIsSubmitting(true);
      try {
        const updatedVendors = vendors.map(v => v.id === currentVendor.id ? { ...v, name: profileForm.name, email: profileForm.email, avatar: profileForm.avatar, website: profileForm.website, instagram: profileForm.instagram, twitter: profileForm.twitter, bio: profileForm.bio, coverImage: profileForm.coverImage, visualTheme: profileForm.visualTheme as any } : v);
        await setVendors(updatedVendors);
        alert("Profile and store settings updated successfully.");
      } catch (err) { console.error("Save failed", err); alert("Failed to save updates."); } finally { setIsSubmitting(false); }
    }
  };

  const handleSaveBuyerProfile = async () => {
      if (!currentBuyer || !onUpdateUser) return;
      setIsSubmitting(true);
      try {
          const updatedUser: User = {
              ...currentBuyer,
              name: buyerForm.name,
              avatar: buyerForm.avatar,
              phone: buyerForm.phone,
              shippingAddress: {
                  street: buyerForm.street,
                  city: buyerForm.city,
                  state: buyerForm.state,
                  zip: buyerForm.zip,
                  country: buyerForm.country
              },
              measurements: {
                  bust: buyerForm.bust,
                  waist: buyerForm.waist,
                  hips: buyerForm.hips,
                  height: buyerForm.height,
                  shoeSize: buyerForm.shoeSize
              }
          };
          await onUpdateUser(updatedUser);
          alert("Profile updated successfully.");
      } catch(e) {
          console.error("Failed to update buyer profile", e);
          alert("Failed to save profile.");
      } finally {
          setIsSubmitting(false);
      }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => { e.preventDefault(); if (passwords.new !== passwords.confirm) { setPasswordStatus({ loading: false, success: false, error: 'Passwords do not match' }); return; } setPasswordStatus({ loading: true, success: false, error: '' }); try { if (auth.currentUser) { await updateUserPassword(auth.currentUser, passwords.new); setPasswordStatus({ loading: false, success: true, error: '' }); setPasswords({ new: '', confirm: '' }); setTimeout(() => setPasswordStatus({ loading: false, success: false, error: '' }), 3000); } else { setPasswordStatus({ loading: false, success: false, error: 'User session invalid.' }); } } catch (err) { setPasswordStatus({ loading: false, success: false, error: 'Failed to update password.' }); } };
  const handleKycSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!kycFiles.idFront || !kycFiles.proofOfAddress) { setKycStatus({ loading: false, success: false, error: 'Please upload ID and Proof of Address.' }); return; } setKycStatus({ loading: true, success: false, error: '' }); if (currentVendor && setVendors) { const updatedVendors = vendors.map(v => v.id === currentVendor.id ? { ...v, kycDocuments: { ...kycFiles, submittedAt: new Date().toISOString() }, verificationStatus: 'PENDING' as VerificationStatus } : v); await setVendors(updatedVendors); setKycStatus({ loading: false, success: true, error: '' }); } };
  const initiatePlanUpgrade = (planName: string) => { setSelectedPlanForUpgrade(planName); if (planName === "Atelier") { performPlanUpgrade(planName); } else { setShowSubscriptionPayment(true); } };
  const performPlanUpgrade = async (planName: string) => { if (currentVendor && setVendors) { const updatedVendors = vendors.map(v => { if (v.id === currentVendor.id) { return { ...v, subscriptionPlan: planName as any, subscriptionStatus: 'ACTIVE' } as Vendor; } return v; }); await setVendors(updatedVendors); setShowSubscriptionPayment(false); setSubPaymentDetails({cardName: '', cardNumber: '', expiry: '', cvc: ''}); alert(`Plan switched to ${planName} and subscription activated.`); } };
  const handleAddPaymentMethod = async (e: React.FormEvent) => { e.preventDefault(); if (!currentVendor || !setVendors) return; setIsSubmitting(true); const method: PaymentMethod = { id: `pm_${Date.now()}`, type: newPaymentMethod.type, details: newPaymentMethod.type === 'BANK' ? { bankName: newPaymentMethod.bankName, accountName: newPaymentMethod.accountName, accountNumber: newPaymentMethod.accountNumber, routingNumber: newPaymentMethod.routingNumber } : { walletAddress: newPaymentMethod.walletAddress, network: newPaymentMethod.network } }; try { const updatedMethods = [...(currentVendor.paymentMethods || []), method]; const updatedVendors = vendors.map(v => v.id === currentVendor.id ? { ...v, paymentMethods: updatedMethods } : v); await setVendors(updatedVendors); setShowAddMethodModal(false); setNewPaymentMethod({ type: 'BANK', bankName: '', accountName: '', accountNumber: '', routingNumber: '', walletAddress: '', network: 'BTC' }); } catch (err) { console.error("Failed to add payment method", err); alert("Failed to save payment method."); } finally { setIsSubmitting(false); } };
  const handleDeletePaymentMethod = async (id: string) => { if (!currentVendor || !setVendors) return; if (!confirm("Are you sure you want to delete this payment method?")) return; try { const updatedMethods = (currentVendor.paymentMethods || []).filter(m => m.id !== id); const updatedVendors = vendors.map(v => v.id === currentVendor.id ? { ...v, paymentMethods: updatedMethods } : v); await setVendors(updatedVendors); } catch (err) { console.error("Failed to delete", err); } };

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
    const items: { id: string; label: string; icon: any; action?: () => void }[] = [ { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard }, { id: 'PRODUCTS', label: 'My Collection', icon: Shirt }, { id: 'UPLOAD', label: 'Add New Piece', icon: Plus }, ];
    if (isVendor) { items.push({ id: 'STORE_PREVIEW', label: 'View Live Store', icon: Store }); items.push({ id: 'FULFILLMENT', label: 'Client Orders', icon: Truck }); items.push({ id: 'ORDERS', label: 'My Purchases', icon: ShoppingBag }); items.push({ id: 'PAYOUTS', label: 'Payouts & Wallet', icon: Wallet }); items.push({ id: 'FOLLOWERS', label: 'Followers', icon: Users }); items.push({ id: 'STORE_DESIGN', label: 'Design Store', icon: Palette }); items.push({ id: 'SUBSCRIPTION_PLAN', label: 'My Subscription', icon: Diamond }); items.push({ id: 'VERIFICATION', label: 'Identity Verification', icon: ShieldCheck }); items.push({ id: 'MARKETPLACE', label: 'View Storefront', icon: Eye, action: () => onNavigate('DESIGNERS') }); items.push({ id: 'PROFILE', label: 'Profile Settings', icon: Settings }); }
    if (isAdmin) { items.push({ id: 'CMS', label: 'Content Management', icon: Layout }); items.push({ id: 'INBOX', label: 'Inbox', icon: Inbox }); items.push({ id: 'ORDERS', label: 'All Orders', icon: Package }); items.push({ id: 'VERIFICATION', label: 'Vendor Verification', icon: ShieldCheck }); items.push({ id: 'SUBSCRIPTIONS', label: 'Subscriptions', icon: Users }); items.push({ id: 'USERS', label: 'User Management', icon: Users }); items.push({ id: 'REVIEWS', label: 'Content Moderation', icon: MessageSquare }); items.push({ id: 'TRANSACTIONS', label: 'Transactions', icon: CreditCard }); items.push({ id: 'SETTINGS', label: 'Platform Settings', icon: Settings }); }
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
          <button key={item.id} onClick={() => item.action ? item.action() : setActiveTab(item.id as DashboardTab)} className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${activeTab === item.id ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
            <item.icon size={16} /> {item.label} {item.id === 'MARKETPLACE' && <ArrowUpRight size={14} className="ml-auto" />}
          </button>
        ))}
      </nav>
      {isVendor && (
         <div className="mt-8 space-y-4">
             {!isSubscribed && (
                 <div className="p-4 bg-luxury-gold/10 border border-luxury-gold/20 rounded-sm">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-luxury-gold mb-2">Account Inactive</h4>
                    <p className="text-[10px] text-gray-600 mb-3">Subscribe to publish your items to the marketplace.</p>
                    <button onClick={() => setActiveTab('SUBSCRIPTION_PLAN')} className="w-full bg-luxury-gold text-white py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors">View Plans</button>
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

  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif italic">Dashboard Overview</h2>
        <div className="flex gap-2">
            <span className="text-xs font-bold uppercase tracking-widest bg-white border border-gray-200 px-3 py-1 rounded-full">{role} Account</span>
            {currentVendor?.subscriptionPlan && <span className="text-xs font-bold uppercase tracking-widest bg-black text-white px-3 py-1 rounded-full">{currentVendor.subscriptionPlan} Plan</span>}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isAdmin && adminStats ? (
              <>
                <div className="bg-white p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Total Platform Revenue</h3>
                    <p className="text-2xl font-serif">${adminStats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Pending Verifications</h3>
                    <p className="text-2xl font-serif">{adminStats.pendingVerifications}</p>
                </div>
                 <div className="bg-white p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Total Orders</h3>
                    <p className="text-2xl font-serif">{orders.length}</p>
                </div>
                 <div className="bg-white p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Active Vendors</h3>
                    <p className="text-2xl font-serif">{vendors.filter(v => v.subscriptionStatus === 'ACTIVE').length}</p>
                </div>
              </>
          ) : (
              <>
                <div className="bg-white p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Total Revenue</h3>
                    <p className="text-2xl font-serif">${stats.revenue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Active Orders</h3>
                    <p className="text-2xl font-serif">{stats.activeOrders}</p>
                </div>
                 <div className="bg-white p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Unique Clients</h3>
                    <p className="text-2xl font-serif">{stats.clients}</p>
                </div>
                 <div className="bg-white p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Avg. Order Value</h3>
                    <p className="text-2xl font-serif">${stats.aov.toFixed(2)}</p>
                </div>
              </>
          )}
      </div>

      {/* Chart */}
      <div className="bg-white p-6 border border-gray-100 shadow-sm h-96">
          <h3 className="text-xs font-bold uppercase text-gray-400 mb-6">Revenue Analytics (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesChartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C5A059" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
              <Tooltip 
                contentStyle={{backgroundColor: '#fff', border: '1px solid #eee', fontSize: '12px'}}
                itemStyle={{color: '#000'}}
              />
              <Area type="monotone" dataKey="sales" stroke="#C5A059" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
      </div>
    </div>
  );

  const renderInbox = () => (
    <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-serif italic mb-6">Inbox</h2>
        {isAdmin ? (
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                {contactSubmissions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No messages found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-left font-bold uppercase tracking-widest text-xs text-gray-400">Date</th>
                                <th className="p-4 text-left font-bold uppercase tracking-widest text-xs text-gray-400">Name</th>
                                <th className="p-4 text-left font-bold uppercase tracking-widest text-xs text-gray-400">Subject</th>
                                <th className="p-4 text-left font-bold uppercase tracking-widest text-xs text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contactSubmissions.map(msg => (
                                <tr key={msg.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-4 text-gray-500">{new Date(msg.date).toLocaleDateString()}</td>
                                    <td className="p-4 font-medium">{msg.name} <div className="text-xs text-gray-400">{msg.email}</div></td>
                                    <td className="p-4">{msg.subject} <div className="text-xs text-gray-500 truncate max-w-xs">{msg.message}</div></td>
                                    <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{msg.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-200 rounded-sm">
                <Mail size={32} className="text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">No new messages.</p>
            </div>
        )}
    </div>
  );

  const renderFulfillment = () => {
    // Filter orders if vendor
    const displayOrders = isVendor && currentVendor 
        ? orders.filter(o => o.items.some(i => i.designer === currentVendor.name))
        : orders;
    
    // For Buyer, it's "My Orders"
    const buyerOrders = isBuyer ? orders.filter(o => o.customerName === auth.currentUser?.email) : [];
    const finalOrders = isBuyer ? buyerOrders : displayOrders;

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-serif italic mb-6">{isBuyer ? 'My Orders' : 'Order Fulfillment'}</h2>
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                {finalOrders.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No orders found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-left font-bold uppercase tracking-widest text-xs text-gray-400">Order ID</th>
                                <th className="p-4 text-left font-bold uppercase tracking-widest text-xs text-gray-400">Date</th>
                                <th className="p-4 text-left font-bold uppercase tracking-widest text-xs text-gray-400">Customer</th>
                                <th className="p-4 text-left font-bold uppercase tracking-widest text-xs text-gray-400">Items</th>
                                <th className="p-4 text-left font-bold uppercase tracking-widest text-xs text-gray-400">Total</th>
                                <th className="p-4 text-left font-bold uppercase tracking-widest text-xs text-gray-400">Status</th>
                                {!isBuyer && <th className="p-4 text-left font-bold uppercase tracking-widest text-xs text-gray-400">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {finalOrders.map(order => (
                                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-4 font-mono text-xs">{order.id}</td>
                                    <td className="p-4 text-gray-500">{order.date}</td>
                                    <td className="p-4">{order.customerName}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="text-xs">
                                                    <span className="font-bold">{item.quantity}x</span> {item.name} ({item.size})
                                                    {item.isPreOrder && <span className="text-luxury-gold ml-1">[Pre-Order]</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold">${order.total}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    {!isBuyer && (
                                        <td className="p-4">
                                            <select 
                                                value={order.status}
                                                onChange={(e) => onUpdateOrderStatus && onUpdateOrderStatus(order.id, e.target.value as any)}
                                                className="border border-gray-200 text-xs p-1 rounded"
                                            >
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderPayouts = () => (
      <div className="max-w-4xl space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-luxury-black text-white p-8 shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-gold mb-2">Available Balance</h3>
                      <p className="text-4xl font-serif mb-6">${(stats.revenue * 0.85).toFixed(2)}</p>
                      <button onClick={() => setShowWithdrawModal(true)} className="bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-white transition-colors">
                          Request Payout
                      </button>
                  </div>
                  <Wallet className="absolute -bottom-8 -right-8 text-gray-800 opacity-20" size={160} />
              </div>
              <div className="bg-white border border-gray-100 p-8 shadow-sm">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Payment Methods</h3>
                   <div className="space-y-4">
                       {currentVendor?.paymentMethods?.map(method => (
                           <div key={method.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-sm">
                               <div className="flex items-center gap-3">
                                   {method.type === 'BANK' ? <Banknote size={20} className="text-gray-400"/> : <Bitcoin size={20} className="text-gray-400"/>}
                                   <div>
                                       <p className="text-sm font-bold">{method.type === 'BANK' ? method.details.bankName : method.details.network}</p>
                                       <p className="text-xs text-gray-500">
                                           {method.type === 'BANK' ? `**** ${method.details.accountNumber?.slice(-4)}` : `${method.details.walletAddress?.slice(0, 6)}...`}
                                       </p>
                                   </div>
                               </div>
                               <button onClick={() => handleDeletePaymentMethod(method.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                           </div>
                       ))}
                       <button onClick={() => setShowAddMethodModal(true)} className="w-full border border-dashed border-gray-300 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-colors flex items-center justify-center gap-2">
                           <Plus size={14} /> Add Method
                       </button>
                   </div>
              </div>
          </div>
          
          {/* Add Method Modal */}
          {showAddMethodModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white p-8 w-full max-w-md animate-slide-up relative">
                      <button onClick={() => setShowAddMethodModal(false)} className="absolute top-4 right-4"><X size={20} /></button>
                      <h3 className="text-xl font-serif italic mb-6">Add Payment Method</h3>
                      <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                          <div>
                              <label className="text-[10px] font-bold uppercase block mb-2">Type</label>
                              <div className="flex gap-4">
                                  <button type="button" onClick={() => setNewPaymentMethod({...newPaymentMethod, type: 'BANK'})} className={`flex-1 py-2 text-xs font-bold uppercase border ${newPaymentMethod.type === 'BANK' ? 'bg-black text-white border-black' : 'border-gray-200'}`}>Bank Transfer</button>
                                  <button type="button" onClick={() => setNewPaymentMethod({...newPaymentMethod, type: 'CRYPTO'})} className={`flex-1 py-2 text-xs font-bold uppercase border ${newPaymentMethod.type === 'CRYPTO' ? 'bg-black text-white border-black' : 'border-gray-200'}`}>Crypto</button>
                              </div>
                          </div>
                          {newPaymentMethod.type === 'BANK' ? (
                              <>
                                  <input required placeholder="Bank Name" value={newPaymentMethod.bankName} onChange={e => setNewPaymentMethod({...newPaymentMethod, bankName: e.target.value})} className="w-full border p-2 text-sm" />
                                  <input required placeholder="Account Name" value={newPaymentMethod.accountName} onChange={e => setNewPaymentMethod({...newPaymentMethod, accountName: e.target.value})} className="w-full border p-2 text-sm" />
                                  <input required placeholder="Account Number" value={newPaymentMethod.accountNumber} onChange={e => setNewPaymentMethod({...newPaymentMethod, accountNumber: e.target.value})} className="w-full border p-2 text-sm" />
                                  <input required placeholder="Routing Number" value={newPaymentMethod.routingNumber} onChange={e => setNewPaymentMethod({...newPaymentMethod, routingNumber: e.target.value})} className="w-full border p-2 text-sm" />
                              </>
                          ) : (
                              <>
                                  <input required placeholder="Wallet Address" value={newPaymentMethod.walletAddress} onChange={e => setNewPaymentMethod({...newPaymentMethod, walletAddress: e.target.value})} className="w-full border p-2 text-sm" />
                                  <input required placeholder="Network (e.g. BTC, ETH)" value={newPaymentMethod.network} onChange={e => setNewPaymentMethod({...newPaymentMethod, network: e.target.value})} className="w-full border p-2 text-sm" />
                              </>
                          )}
                          <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Method'}</button>
                      </form>
                  </div>
              </div>
          )}
      </div>
  );

  const renderFollowers = () => (
      <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-serif italic mb-6">Followers & Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followers.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-gray-400">
                      <Users size={32} className="mx-auto mb-2 opacity-20"/>
                      <p>Start building your community to see followers here.</p>
                  </div>
              ) : (
                  followers.map(f => (
                      <div key={f.id} className="bg-white p-6 border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedFollower(f)}>
                          <img src={f.avatar} className="w-12 h-12 rounded-full object-cover"/>
                          <div>
                              <h4 className="font-bold text-sm">{f.name}</h4>
                              <p className="text-xs text-gray-500">{f.location} • Joined {f.joined}</p>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
  );

  const renderVendorVerification = () => (
      <div className="max-w-2xl animate-fade-in bg-white p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
              <ShieldCheck size={24} className="text-luxury-gold" />
              <h2 className="text-2xl font-serif italic">Identity Verification</h2>
          </div>
          {currentVendor?.verificationStatus === 'VERIFIED' ? (
              <div className="bg-green-50 p-6 border border-green-100 flex flex-col items-center text-center">
                  <CheckCircle size={48} className="text-green-500 mb-4" />
                  <h3 className="text-lg font-bold text-green-700 mb-2">Verification Complete</h3>
                  <p className="text-green-600 text-sm">Your atelier identity has been verified. You have full access to the marketplace.</p>
              </div>
          ) : (
              <form onSubmit={handleKycSubmit} className="space-y-6">
                  <p className="text-sm text-gray-500">To maintain the exclusivity and security of our marketplace, we require all designers to verify their identity.</p>
                  <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Government ID (Front)</label>
                      <div className="border border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
                          <span className="text-xs text-gray-500 truncate">{kycFiles.idFront ? 'File selected' : 'No file chosen'}</span>
                          <input type="file" ref={kycIdFrontRef} onChange={e => handleFileUpload(e, (b64) => setKycFiles({...kycFiles, idFront: b64}))} className="hidden" />
                          <button type="button" onClick={() => kycIdFrontRef.current?.click()} className="text-xs font-bold underline">Upload</button>
                      </div>
                  </div>
                  <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Government ID (Back)</label>
                      <div className="border border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
                          <span className="text-xs text-gray-500 truncate">{kycFiles.idBack ? 'File selected' : 'No file chosen'}</span>
                          <input type="file" ref={kycIdBackRef} onChange={e => handleFileUpload(e, (b64) => setKycFiles({...kycFiles, idBack: b64}))} className="hidden" />
                          <button type="button" onClick={() => kycIdBackRef.current?.click()} className="text-xs font-bold underline">Upload</button>
                      </div>
                  </div>
                  <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Proof of Address (Utility Bill)</label>
                      <div className="border border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
                          <span className="text-xs text-gray-500 truncate">{kycFiles.proofOfAddress ? 'File selected' : 'No file chosen'}</span>
                          <input type="file" ref={kycProofRef} onChange={e => handleFileUpload(e, (b64) => setKycFiles({...kycFiles, proofOfAddress: b64}))} className="hidden" />
                          <button type="button" onClick={() => kycProofRef.current?.click()} className="text-xs font-bold underline">Upload</button>
                      </div>
                  </div>
                  {kycStatus.error && <p className="text-red-500 text-xs">{kycStatus.error}</p>}
                  {kycStatus.success && <p className="text-green-500 text-xs">Documents submitted successfully. Pending review.</p>}
                  <button type="submit" disabled={kycStatus.loading || currentVendor?.verificationStatus === 'PENDING'} className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold disabled:opacity-50">
                      {kycStatus.loading ? 'Submitting...' : currentVendor?.verificationStatus === 'PENDING' ? 'Under Review' : 'Submit for Verification'}
                  </button>
              </form>
          )}
      </div>
  );

  const renderAdminVerification = () => (
      <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-serif italic mb-6">Pending Verifications</h2>
          <div className="space-y-4">
              {vendors.filter(v => v.verificationStatus === 'PENDING').length === 0 ? (
                  <p className="text-gray-400">No pending verifications.</p>
              ) : (
                  vendors.filter(v => v.verificationStatus === 'PENDING').map(v => (
                      <div key={v.id} className="bg-white p-6 border border-gray-100 flex justify-between items-center shadow-sm">
                          <div className="flex items-center gap-4">
                              <img src={v.avatar} className="w-12 h-12 rounded-full object-cover" />
                              <div>
                                  <h3 className="font-bold text-sm">{v.name}</h3>
                                  <p className="text-xs text-gray-500">{v.email}</p>
                              </div>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => setVerificationModalOpen(v)} className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold">Review Docs</button>
                          </div>
                      </div>
                  ))
              )}
          </div>
          {/* Modal for Admin to see docs would go here, simplified for now to auto-approve logic if implemented */}
          {verificationModalOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <h3 className="text-xl font-bold mb-4">Review Documents: {verificationModalOpen.name}</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                           <div>
                               <p className="text-xs font-bold mb-2">ID Front</p>
                               <img src={verificationModalOpen.kycDocuments?.idFront} className="w-full border" />
                           </div>
                           <div>
                               <p className="text-xs font-bold mb-2">ID Back</p>
                               <img src={verificationModalOpen.kycDocuments?.idBack} className="w-full border" />
                           </div>
                      </div>
                      <div className="flex gap-4">
                          <button 
                             onClick={async () => {
                                 const updated = vendors.map(v => v.id === verificationModalOpen.id ? {...v, verificationStatus: 'VERIFIED'} : v);
                                 if (setVendors) await setVendors(updated as Vendor[]);
                                 setVerificationModalOpen(null);
                             }} 
                             className="flex-1 bg-green-600 text-white py-3 text-xs font-bold uppercase"
                          >
                              Approve
                          </button>
                          <button 
                             onClick={async () => {
                                 const updated = vendors.map(v => v.id === verificationModalOpen.id ? {...v, verificationStatus: 'REJECTED'} : v);
                                 if (setVendors) await setVendors(updated as Vendor[]);
                                 setVerificationModalOpen(null);
                             }} 
                             className="flex-1 bg-red-600 text-white py-3 text-xs font-bold uppercase"
                          >
                              Reject
                          </button>
                           <button onClick={() => setVerificationModalOpen(null)} className="px-6 py-3 border border-gray-200">Close</button>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );

  const renderStoreDesign = () => (
      <div className="max-w-3xl animate-fade-in bg-white p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-serif italic mb-8">Store Appearance</h2>
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Avatar</label>
                       <div className="w-32 h-32 bg-gray-50 border border-gray-200 relative overflow-hidden group cursor-pointer">
                           <img src={profileForm.avatar} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                               <UploadCloud className="text-white" />
                           </div>
                           <input type="file" onChange={e => handleFileUpload(e, (b64) => setProfileForm({...profileForm, avatar: b64}))} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                  </div>
                  <div className="space-y-4">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Cover Image</label>
                       <div className="w-full h-32 bg-gray-50 border border-gray-200 relative overflow-hidden group cursor-pointer">
                           <img src={profileForm.coverImage} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                               <UploadCloud className="text-white" />
                           </div>
                           <input type="file" onChange={e => handleFileUpload(e, (b64) => setProfileForm({...profileForm, coverImage: b64}))} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                  </div>
              </div>

              <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Brand Name</label>
                  <input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" />
              </div>
               <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Bio / Philosophy</label>
                  <textarea value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none h-24 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                   <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Website</label>
                      <input value={profileForm.website} onChange={e => setProfileForm({...profileForm, website: e.target.value})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" placeholder="https://" />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Instagram</label>
                      <input value={profileForm.instagram} onChange={e => setProfileForm({...profileForm, instagram: e.target.value})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" placeholder="@" />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Twitter</label>
                      <input value={profileForm.twitter} onChange={e => setProfileForm({...profileForm, twitter: e.target.value})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" placeholder="@" />
                   </div>
              </div>
               <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 block">Visual Theme</label>
                  <div className="flex gap-4">
                      {(['MINIMALIST', 'DARK', 'GOLD'] as const).map(theme => (
                          <button 
                             key={theme} 
                             onClick={() => setProfileForm({...profileForm, visualTheme: theme})}
                             className={`flex-1 py-4 border text-xs font-bold uppercase tracking-widest transition-all ${profileForm.visualTheme === theme ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}
                          >
                              {theme}
                          </button>
                      ))}
                  </div>
              </div>
              <button onClick={handleSaveProfile} disabled={isSubmitting} className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
          </div>
      </div>
  );

  const renderStorePreview = () => (
      <div className="animate-fade-in border border-gray-200 shadow-xl overflow-hidden bg-white">
          <div className="bg-gray-100 p-2 text-center text-xs text-gray-500 border-b border-gray-200">Live Preview</div>
          {currentVendor ? (
            <div className="h-[800px] overflow-y-auto">
               <VendorProfileView 
                  vendor={currentVendor} 
                  onProductSelect={onProductSelect || (() => {})} 
                  onNavigate={onNavigate}
                  products={vendorProducts}
                />
            </div>
          ) : <p className="p-8 text-center text-gray-400">Profile data unavailable.</p>}
      </div>
  );

  const renderBuyerProfile = () => {
      return (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
              <div className="flex justify-between items-end mb-6">
                  <div>
                      <h2 className="text-3xl font-serif italic mb-2">My Profile & Fit</h2>
                      <p className="text-gray-500 text-sm">Manage your personal details and measurements for a curated experience.</p>
                  </div>
                  <button 
                      onClick={handleSaveBuyerProfile}
                      disabled={isSubmitting}
                      className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2 disabled:opacity-70"
                  >
                      {isSubmitting ? <Loader className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left Column: Identity & Security */}
                  <div className="space-y-8">
                      {/* Identity Card */}
                      <div className="bg-white p-6 border border-gray-100 shadow-sm">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Identity</h3>
                          <div className="flex flex-col items-center mb-6">
                              <div className="relative w-24 h-24 rounded-full bg-gray-50 border border-gray-200 overflow-hidden group cursor-pointer">
                                  <img 
                                      src={buyerForm.avatar || "https://via.placeholder.com/150"} 
                                      className="w-full h-full object-cover" 
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <Camera className="text-white" size={20} />
                                  </div>
                                  <input 
                                      type="file" 
                                      ref={avatarFileInputRef} 
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                      accept="image/*"
                                      onChange={(e) => handleFileUpload(e, (b64) => setBuyerForm({...buyerForm, avatar: b64}))}
                                  />
                              </div>
                          </div>
                          
                          <div className="space-y-4">
                              <div>
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Full Name</label>
                                  <input 
                                      value={buyerForm.name} 
                                      onChange={e => setBuyerForm({...buyerForm, name: e.target.value})} 
                                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" 
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Email Address</label>
                                  <input 
                                      value={currentBuyer?.email} 
                                      disabled 
                                      className="w-full border-b border-gray-200 py-2 text-sm text-gray-400 bg-transparent cursor-not-allowed" 
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Phone Number</label>
                                  <input 
                                      value={buyerForm.phone} 
                                      onChange={e => setBuyerForm({...buyerForm, phone: e.target.value})} 
                                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" 
                                      placeholder="+1 (555) 000-0000"
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Security Card */}
                      <div className="bg-white p-6 border border-gray-100 shadow-sm">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Security</h3>
                          <div className="space-y-4">
                              <input 
                                  type="password" 
                                  placeholder="New Password" 
                                  value={passwords.new} 
                                  onChange={e => setPasswords({...passwords, new: e.target.value})}
                                  className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" 
                              />
                              <input 
                                  type="password" 
                                  placeholder="Confirm Password" 
                                  value={passwords.confirm} 
                                  onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                  className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" 
                              />
                              {passwordStatus.error && <p className="text-red-500 text-xs">{passwordStatus.error}</p>}
                              {passwordStatus.success && <p className="text-green-500 text-xs">Password updated.</p>}
                              <button onClick={handleUpdatePassword} disabled={passwordStatus.loading} className="w-full bg-gray-50 border border-gray-200 text-black py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-50 mt-2">
                                  {passwordStatus.loading ? 'Updating...' : 'Update Password'}
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Measurements & Address */}
                  <div className="md:col-span-2 space-y-8">
                      {/* Measurements */}
                      <div className="bg-white p-8 border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-3 mb-6">
                              <Ruler className="text-luxury-gold" size={20} />
                              <h3 className="text-lg font-serif italic">The Perfect Fit</h3>
                          </div>
                          <p className="text-sm text-gray-500 mb-8 max-w-lg">
                              Provide your measurements to unlock AI-powered sizing recommendations for made-to-order pieces.
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                              <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Height (cm)</label>
                                  <input 
                                      type="number"
                                      value={buyerForm.height}
                                      onChange={e => setBuyerForm({...buyerForm, height: e.target.value})}
                                      className="w-full bg-transparent text-xl font-serif italic focus:outline-none"
                                      placeholder="175"
                                  />
                              </div>
                              <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Bust (cm)</label>
                                  <input 
                                      type="number"
                                      value={buyerForm.bust}
                                      onChange={e => setBuyerForm({...buyerForm, bust: e.target.value})}
                                      className="w-full bg-transparent text-xl font-serif italic focus:outline-none"
                                      placeholder="88"
                                  />
                              </div>
                              <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Waist (cm)</label>
                                  <input 
                                      type="number"
                                      value={buyerForm.waist}
                                      onChange={e => setBuyerForm({...buyerForm, waist: e.target.value})}
                                      className="w-full bg-transparent text-xl font-serif italic focus:outline-none"
                                      placeholder="64"
                                  />
                              </div>
                              <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Hips (cm)</label>
                                  <input 
                                      type="number"
                                      value={buyerForm.hips}
                                      onChange={e => setBuyerForm({...buyerForm, hips: e.target.value})}
                                      className="w-full bg-transparent text-xl font-serif italic focus:outline-none"
                                      placeholder="92"
                                  />
                              </div>
                              <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Shoe Size (EU)</label>
                                  <input 
                                      type="number"
                                      value={buyerForm.shoeSize}
                                      onChange={e => setBuyerForm({...buyerForm, shoeSize: e.target.value})}
                                      className="w-full bg-transparent text-xl font-serif italic focus:outline-none"
                                      placeholder="39"
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="bg-white p-8 border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-3 mb-6">
                              <MapPin className="text-luxury-gold" size={20} />
                              <h3 className="text-lg font-serif italic">Shipping Address</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="md:col-span-2">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Street Address</label>
                                  <input 
                                      value={buyerForm.street} 
                                      onChange={e => setBuyerForm({...buyerForm, street: e.target.value})} 
                                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" 
                                      placeholder="123 Fashion Ave"
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">City</label>
                                  <input 
                                      value={buyerForm.city} 
                                      onChange={e => setBuyerForm({...buyerForm, city: e.target.value})} 
                                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" 
                                      placeholder="New York"
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">State / Province</label>
                                  <input 
                                      value={buyerForm.state} 
                                      onChange={e => setBuyerForm({...buyerForm, state: e.target.value})} 
                                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" 
                                      placeholder="NY"
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Postal Code</label>
                                  <input 
                                      value={buyerForm.zip} 
                                      onChange={e => setBuyerForm({...buyerForm, zip: e.target.value})} 
                                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" 
                                      placeholder="10001"
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Country</label>
                                  <input 
                                      value={buyerForm.country} 
                                      onChange={e => setBuyerForm({...buyerForm, country: e.target.value})} 
                                      className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" 
                                      placeholder="United States"
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'OVERVIEW': return renderOverview();
      case 'INBOX': return renderInbox();
      case 'FULFILLMENT': return renderFulfillment();
      case 'PAYOUTS': return renderPayouts();
      case 'FOLLOWERS': return renderFollowers();
      case 'VERIFICATION': return isAdmin ? renderAdminVerification() : renderVendorVerification();
      case 'STORE_DESIGN': return renderStoreDesign();
      case 'STORE_PREVIEW': return renderStorePreview();
      case 'SUBSCRIPTION_PLAN': 
        // ... (Subscription plan render logic)
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <Diamond size={48} className="text-luxury-gold mb-4" />
                <h2 className="text-2xl font-serif italic mb-2">Subscription Plans</h2>
                <p className="text-gray-500 mb-6">Manage your atelier membership.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full text-left">
                    {SUBSCRIPTION_PLANS.map(plan => (
                        <div key={plan.name} className={`border p-6 ${currentVendor?.subscriptionPlan === plan.name ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                            <h3 className="font-bold uppercase tracking-widest text-xs mb-2">{plan.name}</h3>
                            <p className="text-xl font-serif italic mb-4">{plan.price} <span className="text-xs font-sans not-italic text-gray-400">{plan.period}</span></p>
                            <button 
                                onClick={() => initiatePlanUpgrade(plan.name)}
                                disabled={currentVendor?.subscriptionPlan === plan.name}
                                className="w-full bg-black text-white py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:bg-gray-300"
                            >
                                {currentVendor?.subscriptionPlan === plan.name ? 'Current Plan' : 'Switch Plan'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
      case 'PRODUCTS': 
        return (
           <div className="space-y-6 animate-fade-in">
               <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-serif italic">My Collection</h2>
                   <button onClick={() => { setIsEditing(false); setActiveTab('UPLOAD'); }} className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2">
                       <Plus size={14} /> Add Piece
                   </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                   {vendorProducts.map(p => (
                       <div key={p.id} className="group relative bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                           <div className="relative aspect-[3/4] mb-4 bg-gray-50 overflow-hidden">
                               <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                               {p.stock < 3 && <span className="absolute top-2 left-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 uppercase">Low Stock</span>}
                           </div>
                           <h3 className="font-bold text-sm mb-1">{p.name}</h3>
                           <p className="text-xs text-gray-500 mb-3">${p.price}</p>
                           <div className="flex gap-2">
                               <button onClick={() => handleEditProduct(p)} className="flex-1 border border-gray-200 py-2 text-[10px] font-bold uppercase hover:bg-black hover:text-white transition-colors">Edit</button>
                               <button onClick={() => onDeleteProduct && onDeleteProduct(p.id)} className="p-2 border border-gray-200 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                           </div>
                       </div>
                   ))}
                   {vendorProducts.length === 0 && (
                       <div className="col-span-full py-20 text-center text-gray-400 border border-dashed border-gray-200">
                           <p>No products listed yet.</p>
                       </div>
                   )}
               </div>
           </div>
        );
      case 'UPLOAD':
        // ... (Upload render logic)
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 border border-gray-100 shadow-sm animate-fade-in">
                <h2 className="text-2xl font-serif italic mb-6">{isEditing ? 'Edit Piece' : 'New Creation'}</h2>
                <form onSubmit={handleUpload} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Name</label>
                            <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" placeholder="Product Name" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Price ($)</label>
                            <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" placeholder="0.00" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Category</label>
                            <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-white">
                                {['Outerwear', 'Bottoms', 'Knitwear', 'Footwear', 'Accessories', 'Tops'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Inventory</label>
                            <input required type="number" min="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none" placeholder="1" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={newProduct.isPreOrder} onChange={e => setNewProduct({...newProduct, isPreOrder: e.target.checked})} id="preorder" className="accent-black"/>
                        <label htmlFor="preorder" className="text-xs font-bold uppercase tracking-widest">Made-to-Order (Pre-Order Only)</label>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
                        <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none h-32 resize-none" placeholder="Product details..." />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Image</label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-32 bg-gray-50 flex items-center justify-center border border-gray-200 overflow-hidden">
                                {newProduct.image ? <img src={newProduct.image} className="w-full h-full object-cover"/> : <ImageIcon className="text-gray-300"/>}
                            </div>
                            <div className="flex-1">
                                <input type="file" ref={productFileInputRef} onChange={e => handleFileUpload(e, (b64) => setNewProduct({...newProduct, image: b64}))} className="text-xs text-gray-500 w-full" accept="image/*" />
                                <p className="text-[10px] text-gray-400 mt-1">Recommended 800x1200px</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        {isEditing && <button type="button" onClick={handleCancelEdit} className="px-6 py-3 border border-gray-200 text-xs font-bold uppercase tracking-widest hover:bg-gray-50">Cancel</button>}
                        <button type="submit" disabled={isSubmitting} className="flex-1 bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                            {isSubmitting ? <Loader className="animate-spin" size={16}/> : (isEditing ? 'Save Changes' : 'Publish to Marketplace')}
                        </button>
                    </div>
                </form>
            </div>
        );
      case 'CMS':
        // ... (CMS render logic)
        return (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-serif italic mb-6">Content Management</h2>
                <div className="flex gap-4 border-b border-gray-100 mb-6">
                    <button onClick={() => setCmsActiveSection('LANDING')} className={`pb-2 text-xs font-bold uppercase tracking-widest ${cmsActiveSection === 'LANDING' ? 'border-b-2 border-black' : 'text-gray-400'}`}>Landing Page</button>
                    <button onClick={() => setCmsActiveSection('ABOUT')} className={`pb-2 text-xs font-bold uppercase tracking-widest ${cmsActiveSection === 'ABOUT' ? 'border-b-2 border-black' : 'text-gray-400'}`}>About Page</button>
                    <button onClick={() => setCmsActiveSection('AUTH')} className={`pb-2 text-xs font-bold uppercase tracking-widest ${cmsActiveSection === 'AUTH' ? 'border-b-2 border-black' : 'text-gray-400'}`}>Auth Pages</button>
                </div>
                {cmsForm ? (
                    <div className="space-y-6 max-w-3xl">
                        {cmsActiveSection === 'LANDING' && (
                            <div className="space-y-6 bg-white p-6 border border-gray-100">
                                <h3 className="font-bold uppercase tracking-widest text-xs">Hero Section</h3>
                                <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Headline 1</label><input value={cmsForm.hero.titleLine1} onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, titleLine1: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black" /></div>
                                <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Headline 2</label><input value={cmsForm.hero.titleLine2} onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, titleLine2: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black" /></div>
                                <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subtitle</label><input value={cmsForm.hero.subtitle} onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, subtitle: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black" /></div>
                                <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Video URL (MP4)</label><input value={cmsForm.hero.videoUrl} onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, videoUrl: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black" /></div>
                            </div>
                        )}
                        <button onClick={handleSaveCMS} disabled={isSubmitting} className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Publish Changes'}</button>
                    </div>
                ) : (<div className="p-12 text-center text-gray-400"><Loader className="animate-spin inline" /> Loading CMS content...</div>)}
            </div>
        );
      case 'ORDERS': // Admin/Vendor Orders view fallback or reuse
        if (isBuyer) return renderInbox(); // Buyer order history fallback to inbox for now if separate component not ready, or implement buyer orders
        return renderFulfillment(); // Reuse Fulfillment for vendor
      case 'SAVED':
      case 'SETTINGS':
      case 'SUBSCRIPTIONS':
      case 'USERS':
      case 'REVIEWS':
      case 'TRANSACTIONS':
      case 'PROFILE':
          if (activeTab === 'PROFILE') {
              if (isVendor) return renderStoreDesign();
              return renderBuyerProfile(); // NEW: Render full buyer profile
          }
          return (
              <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400 border border-dashed border-gray-200">
                  <Settings size={48} className="mb-4 opacity-20" />
                  <p className="text-sm">This module ({activeTab}) is under development.</p>
              </div>
          );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="flex min-h-screen bg-luxury-cream">
       {/* Sidebar */}
       <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           {renderSidebar()}
       </div>
       
       {/* Mobile Overlay */}
       {mobileNavOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileNavOpen(false)} />}

       {/* Main Content */}
       <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
           {/* Mobile Header */}
           <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                   <button onClick={() => setMobileNavOpen(true)}><Menu size={24} /></button>
                   <span className="font-serif italic font-bold text-lg">MyFitStore</span>
               </div>
               <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                   <UserIcon size={16} />
               </div>
           </div>

           <main className="flex-1 overflow-y-auto p-6 md:p-12 pb-24 md:pb-12">
               {renderContent()}
           </main>
       </div>
    </div>
  );
};