
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { AnalyticsView } from './DashboardTabs/AnalyticsView';
import { OverviewView } from './DashboardTabs/OverviewView';
import { KycView } from './DashboardTabs/KycView';
import { FinanceView } from './DashboardTabs/FinanceView';
import { MarketingView } from './DashboardTabs/MarketingView';
import { MessagesView } from './DashboardTabs/MessagesView';
import { StoreDesignView } from './DashboardTabs/StoreDesignView';
import { FollowingView } from './DashboardTabs/FollowingView';
import { NewArrivalsFeed } from './DashboardTabs/NewArrivalsFeed';
import { ProfileView } from './DashboardTabs/ProfileView';
import { OrdersView } from './DashboardTabs/OrdersView';
import { ProductsView } from './DashboardTabs/ProductsView';
import { StorefrontView } from './DashboardTabs/StorefrontView';
import { SubscriptionView } from './DashboardTabs/SubscriptionView';
import { ShippingView } from './DashboardTabs/ShippingView';
import { UsersView } from './DashboardTabs/UsersView';
import { VendorsView } from './DashboardTabs/VendorsView';
import { CmsEditor } from './DashboardTabs/CmsEditor';
import { FollowersView } from './DashboardTabs/FollowersView';
import { ProductEditor } from './DashboardTabs/ProductEditor';
import { VendorEditor } from './DashboardTabs/VendorEditor';
import { VendorReviewView } from './DashboardTabs/VendorReviewView';
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
  CreditCard, Plane, Info, Calendar, Percent, TrendingUp, Download, Eye, FileCheck, XCircle, AlertTriangle, Sparkles
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
  onAddVendor?: (vendor: Vendor) => Promise<void>;
  orders?: Order[];
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => Promise<void>;
  products?: Product[];
  users?: AppUser[];
  onAddProduct?: (product: Product) => Promise<void>;
  onUpdateProduct?: (product: Product) => Promise<void>;
  onDeleteProduct?: (productId: string) => Promise<void>;
  onProductSelect?: (product: Product) => void;
  onUpdateUser?: (user: AppUser) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
  cmsContent?: LandingPageContent;
  onUpdateCMSContent?: (content: LandingPageContent) => Promise<void>;
  contactSubmissions?: ContactSubmission[];
  onUpdateContact?: (id: string, status: 'NEW' | 'READ' | 'ARCHIVED') => Promise<void>;
  initialTab?: string;
  followedVendors?: Vendor[];
  onToggleFollow?: (vendor: Vendor) => Promise<void>;
  onDesignerClick?: (designerName: string) => void;
  followers?: Follower[];
  onOpenDirectMessaging?: () => void;
  currentUser?: AppUser | Vendor | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  role,
  featureFlags,
  toggleFeatureFlag,
  onNavigate,
  vendors = [],
  setVendors,
  onAddVendor,
  orders = [],
  onUpdateOrderStatus,
  products = [],
  users = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onProductSelect,
  onUpdateUser,
  onDeleteUser,
  cmsContent,
  onUpdateCMSContent,
  contactSubmissions = [],
  onUpdateContact,
  initialTab,
  followedVendors = [],
  onToggleFollow,
  onDesignerClick,
  followers = [],
  onOpenDirectMessaging,
  currentUser
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
  const [vendorForm, setVendorForm] = useState<Partial<Vendor> | null>(null);
  const [isSavingVendor, setIsSavingVendor] = useState(false);

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
  const videoInputRef = useRef<HTMLInputElement>(null);
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
        const v = vendors.find(v => v.email === currentUser?.email);
        if (v) setStorefrontForm(v);
    }
  }, [vendors, role, storefrontForm, currentUser]);

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

  const weeklyUploads = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return myProducts.filter(p => p.createdAt && new Date(p.createdAt) > oneWeekAgo).length;
  }, [myProducts]);
  
  const canUpload = role === UserRole.ADMIN || weeklyUploads < 20;

  const totalRevenue = useMemo(() => myOrders.reduce((sum, order) => sum + order.total, 0), [myOrders]);
  const totalSales = useMemo(() => myOrders.length, [myOrders]);

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
  const handlePasswordUpdate = useCallback(async (e: React.FormEvent) => {
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
  }, [newPassword]);

  const handleCMSUpdate = useCallback(async () => {
      if (cmsForm && onUpdateCMSContent) {
          await onUpdateCMSContent(cmsForm);
          alert("Landing page updated successfully.");
      }
  }, [cmsForm, onUpdateCMSContent]);

  const handleStorefrontSave = useCallback(async () => {
    if (storefrontForm && setVendors) {
        try {
            await setVendors([storefrontForm]);
            alert("Storefront updated successfully.");
        } catch (e) {
            console.error(e);
            alert("Failed to update storefront.");
        }
    }
  }, [storefrontForm, setVendors]);

  const handleVerifyVendor = useCallback(async (vendor: Vendor, status: 'VERIFIED' | 'REJECTED') => {
      if (setVendors) {
          await setVendors([{ ...vendor, verificationStatus: status }]);
          setSelectedVendorForReview(null);
      }
  }, [setVendors]);

  const handleImageUpload = useCallback((file: File, type: 'AVATAR' | 'COVER' | 'GALLERY' | 'VIDEO', index?: number) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          const result = reader.result as string;
          if (storefrontForm) {
              if (type === 'AVATAR') {
                  setStorefrontForm({ ...storefrontForm, avatar: result });
              } else if (type === 'COVER') {
                  setStorefrontForm({ ...storefrontForm, coverImage: result });
              } else if (type === 'VIDEO') {
                  setStorefrontForm({ ...storefrontForm, videoUrl: result });
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
  }, [storefrontForm]);

  const removeFromGallery = useCallback((index: number) => {
      if (storefrontForm && storefrontForm.gallery) {
          const newGallery = [...storefrontForm.gallery];
          newGallery.splice(index, 1);
          setStorefrontForm({ ...storefrontForm, gallery: newGallery });
      }
  }, [storefrontForm]);

  // Product Management Handlers
  const handleProductImageUpload = useCallback((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          setProductForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
  }, []);

  const handleSaveProduct = useCallback(async () => {
      if (!productForm.name || !productForm.price || !productForm.category) {
          alert("Please fill in all required fields.");
          return;
      }

      setIsSavingProduct(true);
      try {
          const currentVendor = role === UserRole.VENDOR ? vendors.find(v => v.email === currentUser?.email) : null;
          
          const newProduct: Product = {
              id: productForm.id || `prod_${Date.now()}`,
              name: productForm.name!,
              designer: currentVendor?.name || productForm.designer || 'MyFitStore',
              price: Number(productForm.price),
              category: productForm.category!,
              image: productForm.images?.[0] || productForm.image || 'https://via.placeholder.com/400x600',
              images: productForm.images || (productForm.image ? [productForm.image] : []),
              video: productForm.video,
              description: productForm.description || '',
              rating: productForm.rating || 5,
              stock: Number(productForm.stock) || 0,
              sizes: Array.isArray(productForm.sizes) ? productForm.sizes : (typeof productForm.sizes === 'string' ? (productForm.sizes as string).split(',').map((s: string) => s.trim()) : ['S', 'M', 'L']),
              isNewSeason: !!productForm.isNewSeason,
              isPreOrder: !!productForm.isPreOrder,
              isApproved: productForm.id ? !!productForm.isApproved : false,
              createdAt: productForm.createdAt || new Date().toISOString()
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
  }, [productForm, onUpdateProduct, onAddProduct, role, vendors, currentUser]);

  const handleSaveVendor = useCallback(async () => {
      if (!vendorForm || !vendorForm.name || !vendorForm.email) {
          alert("Name and Email are required.");
          return;
      }

      setIsSavingVendor(true);
      try {
          const newVendor: Vendor = {
              id: vendorForm.id || `vendor_${Date.now()}`,
              name: vendorForm.name!,
              email: vendorForm.email!,
              bio: vendorForm.bio || '',
              avatar: vendorForm.avatar || 'https://via.placeholder.com/150',
              coverImage: vendorForm.coverImage || 'https://via.placeholder.com/1200x400',
              subscriptionPlan: vendorForm.subscriptionPlan || 'BASIC',
              subscriptionStatus: vendorForm.subscriptionStatus || 'ACTIVE',
              verificationStatus: vendorForm.verificationStatus || 'PENDING',
              location: vendorForm.location || '',
              website: vendorForm.website || '',
              instagram: vendorForm.instagram || '',
              twitter: vendorForm.twitter || ''
          };

          if (vendorForm.id) {
              if (setVendors) {
                  await setVendors([newVendor]);
              }
          } else {
              if (onAddVendor) await onAddVendor(newVendor);
          }
          
          setVendorForm(null);
      } catch (e) {
          console.error(e);
          alert("Failed to save vendor.");
      } finally {
          setIsSavingVendor(false);
      }
  }, [vendorForm, setVendors, onAddVendor]);

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
      { id: 'ANALYTICS', label: 'Analytics', icon: TrendingUp, roles: [UserRole.VENDOR] },
      { id: 'PRODUCTS', label: 'Products', icon: Shirt, roles: [UserRole.ADMIN, UserRole.VENDOR] },
      { id: 'STOREFRONT', label: 'Design Store', icon: Palette, roles: [UserRole.VENDOR] },
      { id: 'FINANCE', label: 'Finance', icon: Wallet, roles: [UserRole.VENDOR] },
      { id: 'MARKETING', label: 'Marketing', icon: Tag, roles: [UserRole.VENDOR] },
      { id: 'SUBSCRIPTION', label: 'Subscription', icon: CreditCard, roles: [UserRole.VENDOR] },
      { id: 'KYC', label: 'KYC Verification', icon: ShieldCheck, roles: [UserRole.VENDOR] },
      { id: 'SHIPPING', label: 'Delivery', icon: Truck, roles: [UserRole.VENDOR] },
      { id: 'USERS', label: 'Users', icon: Users, roles: [UserRole.ADMIN] },
      { id: 'FOLLOWERS', label: 'Followers', icon: Users, roles: [UserRole.VENDOR] },
      { id: 'VENDORS', label: 'Ateliers', icon: Store, roles: [UserRole.ADMIN] },
      { id: 'VENDOR_REVIEW', label: 'Review Applications', icon: ShieldCheck, roles: [UserRole.ADMIN] },
      { id: 'MESSAGES', label: 'Contact Forms', icon: Inbox, roles: [UserRole.ADMIN] },
      { id: 'STORE_DESIGN', label: 'Design Store', icon: Palette, roles: [UserRole.ADMIN] },
      { id: 'FOLLOWING', label: 'Following', icon: Heart, roles: [UserRole.BUYER, UserRole.VENDOR] },
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
                {onOpenDirectMessaging && (
                  <button 
                      onClick={onOpenDirectMessaging}
                      className="flex items-center gap-4 text-gray-400 hover:text-black transition-colors w-full p-2 text-sm"
                  >
                      <MessageCircle size={18} />
                      <span className="tracking-wide">Direct Messages</span>
                  </button>
                )}
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
          <OverviewView 
            role={role}
            storefrontForm={storefrontForm}
            onDesignerClick={onDesignerClick}
            onNavigate={onNavigate}
            setIsSidebarOpen={setIsSidebarOpen}
            totalRevenue={totalRevenue}
            totalSales={totalSales}
            myProducts={myProducts}
            revenueData={revenueData}
          />
        );

      case 'KYC': {
        const currentVendor = vendors.find(v => v.email === currentUser?.email);
        if (!currentVendor) return null;
        return (
          <KycView 
            vendor={currentVendor}
            onUpdateVendor={async (v) => {
                if (setVendors) {
                    await setVendors(vendors.map(vendor => vendor.id === v.id ? v : vendor));
                }
            }}
          />
        );
      }

      case 'FINANCE':
        return (
          <FinanceView 
            totalRevenue={totalRevenue}
            myOrders={myOrders}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        );

      case 'MARKETING':
        return (
          <MarketingView 
            setIsSidebarOpen={setIsSidebarOpen}
          />
        );

      case 'STOREFRONT':
        if (!storefrontForm) return <div className="p-8"><Loader className="animate-spin text-luxury-gold" /></div>;
        return (
          <StorefrontView 
            storefrontForm={storefrontForm}
            setStorefrontForm={setStorefrontForm}
            handleStorefrontSave={handleStorefrontSave}
            handleImageUpload={handleImageUpload}
            removeFromGallery={removeFromGallery}
            setIsSidebarOpen={setIsSidebarOpen}
            avatarInputRef={avatarInputRef}
            coverInputRef={coverInputRef}
            galleryInputRef={galleryInputRef}
            videoInputRef={videoInputRef}
          />
        );

      case 'SUBSCRIPTION':
        if (!storefrontForm) return <div className="p-8"><Loader className="animate-spin text-luxury-gold" /></div>;
        return (
          <SubscriptionView 
            storefrontForm={storefrontForm}
            setIsSidebarOpen={setIsSidebarOpen}
            onUpdateVendor={async (v) => {
                if (setVendors) {
                    await setVendors([v]);
                }
            }}
          />
        );

      case 'SHIPPING': {
        const currentVendor = vendors.find(v => v.email === currentUser?.email);
        return <ShippingView setIsSidebarOpen={setIsSidebarOpen} vendorId={currentVendor?.id} />;
      }

      case 'ORDERS':
        return (
          <OrdersView 
            myOrders={myOrders} 
            setIsSidebarOpen={setIsSidebarOpen} 
            onUpdateStatus={onUpdateOrderStatus}
            role={role}
          />
        );

      case 'ANALYTICS':
        const vendor = vendors.find(v => v.email === currentUser?.email);
        return (
          <AnalyticsView 
            products={myProducts}
            orders={myOrders}
            vendorId={vendor?.id}
            vendorName={vendor?.name}
          />
        );

      case 'PRODUCTS':
        return (
          <ProductsView 
            products={role === UserRole.VENDOR ? myProducts : products}
            role={role}
            setIsSidebarOpen={setIsSidebarOpen}
            setIsProductFormOpen={setIsProductFormOpen}
            setProductForm={setProductForm}
            handleDeleteProduct={onDeleteProduct!}
            onUpdateProduct={onUpdateProduct}
            onProductSelect={onProductSelect}
          />
        );

      case 'FOLLOWERS':
        return <FollowersView followers={followers} setIsSidebarOpen={setIsSidebarOpen} />;

      case 'USERS':
        return (
          <UsersView 
            users={users}
            handleDeleteUser={onDeleteUser!}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        );

      case 'VENDORS':
        return (
          <VendorsView 
            vendors={vendors}
            setVendors={setVendors}
            setIsSidebarOpen={setIsSidebarOpen}
            setVendorForm={setVendorForm}
            selectedVendorForReview={selectedVendorForReview}
            setSelectedVendorForReview={setSelectedVendorForReview}
            handleVerifyVendor={handleVerifyVendor}
            onDesignerClick={onDesignerClick}
          />
        );

      case 'VENDOR_REVIEW':
        return (
          <VendorReviewView 
            vendors={vendors}
            onVerifyVendor={handleVerifyVendor}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        );

      case 'MESSAGES':
        return (
          <MessagesView 
            contactSubmissions={contactSubmissions}
            onUpdateContact={onUpdateContact}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        );

      case 'STORE_DESIGN':
          return (
            <StoreDesignView 
              cmsForm={cmsForm}
              setCmsForm={setCmsForm}
              handleCMSUpdate={handleCMSUpdate}
              setIsSidebarOpen={setIsSidebarOpen}
              products={products}
            />
          );
      
      case 'FOLLOWING':
          return (
            <FollowingView 
              followedVendors={followedVendors}
              onDesignerClick={onDesignerClick}
              onToggleFollow={onToggleFollow}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          );

      case 'NEW_ARRIVALS_FEED':
          return (
            <NewArrivalsFeed 
               products={products}
               vendors={vendors}
               onProductSelect={onProductSelect}
               setIsSidebarOpen={setIsSidebarOpen}
            />
          );

      case 'PROFILE':
        return (
          <ProfileView 
            role={role}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            passwordMsg={passwordMsg}
            handlePasswordUpdate={handlePasswordUpdate}
            onUpdateUser={onUpdateUser}
            users={users}
            featureFlags={featureFlags}
            toggleFeatureFlag={toggleFeatureFlag}
            setIsSidebarOpen={setIsSidebarOpen}
          />
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

       {/* Product Form Modal */}
       {isProductFormOpen && (
           <ProductEditor 
               productForm={productForm}
               setProductForm={setProductForm}
               setIsProductFormOpen={setIsProductFormOpen}
               handleSaveProduct={handleSaveProduct}
               isSavingProduct={isSavingProduct}
               role={role}
               onNavigate={onNavigate}
           />
       )}

       {/* Vendor Form Modal */}
       {vendorForm && (
           <VendorEditor 
               vendorForm={vendorForm}
               setVendorForm={setVendorForm}
               handleSaveVendor={handleSaveVendor}
               isSavingVendor={isSavingVendor}
           />
       )}
    </div>
  );
};
