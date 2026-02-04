
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

  // Editable Profile State
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
      
      // Load initial followers from DB
      fetchVendorFollowers(currentVendor.id).then(data => setFollowers(data));
    }
  }, [currentVendor]);

  // Real-Time Follower Simulation
  useEffect(() => {
    if (!currentVendor || activeTab !== 'FOLLOWERS') return;

    // Simulation Interval
    const interval = setInterval(async () => {
        // Randomly decide to add a follower to simulate organic growth
        if (Math.random() > 0.6) {
            const names = ["Elena", "Kai", "Leo", "Mia", "Zara", "Finn", "Ava", "Noah", "Chloe", "Lucas"];
            const locations = ["Paris", "Tokyo", "NYC", "London", "Berlin", "Seoul", "Lagos", "Milan", "Toronto"];
            const styles = ["Avant-Garde", "Minimalist", "Streetwear", "Luxury", "Vintage", "Techwear", "Bohemian"];
            const randomName = names[Math.floor(Math.random() * names.length)] + " " + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + ".";
            
            const newFollower: Follower = {
                id: `f_${Date.now()}_${Math.random()}`,
                name: randomName,
                location: locations[Math.floor(Math.random() * locations.length)],
                avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
                joined: "Just now",
                purchases: Math.floor(Math.random() * 5),
                style: styles[Math.floor(Math.random() * styles.length)],
                vendorId: currentVendor.id
            };

            // Update UI optimistically
            setFollowers(prev => [newFollower, ...prev]);
            
            // Persist to DB
            await addFollowerToDb(newFollower);
        }
    }, 4000); // Check every 4 seconds

    return () => clearInterval(interval);
  }, [currentVendor, activeTab]);

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

  const handleSaveProfile = async () => {
    if (currentVendor && setVendors) {
      setIsSubmitting(true);
      try {
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
                coverImage: profileForm.coverImage,
                visualTheme: profileForm.visualTheme as any
              } 
            : v
        );
        await setVendors(updatedVendors);
        alert("Profile and store settings updated successfully.");
      } catch (err) {
        console.error("Save failed", err);
        alert("Failed to save updates.");
      } finally {
        setIsSubmitting(false);
      }
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
          
          await setVendors(updatedVendors);
          setKycStatus({ loading: false, success: true, error: '' });
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
        await setVendors(updatedVendors);
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

  const performPlanUpgrade = async (planName: string) => {
      if (currentVendor && setVendors) {
        const updatedVendors = vendors.map(v => {
            if (v.id === currentVendor.id) {
                return { ...v, subscriptionPlan: planName as any, subscriptionStatus: 'ACTIVE' } as Vendor;
            }
            return v;
        });
        await setVendors(updatedVendors);
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
  
  const handleAddPaymentMethod = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentVendor || !setVendors) return;
      setIsSubmitting(true);
      
      const method: PaymentMethod = {
          id: `pm_${Date.now()}`,
          type: newPaymentMethod.type,
          details: newPaymentMethod.type === 'BANK' ? {
              bankName: newPaymentMethod.bankName,
              accountName: newPaymentMethod.accountName,
              accountNumber: newPaymentMethod.accountNumber,
              routingNumber: newPaymentMethod.routingNumber
          } : {
              walletAddress: newPaymentMethod.walletAddress,
              network: newPaymentMethod.network
          }
      };

      try {
          const updatedMethods = [...(currentVendor.paymentMethods || []), method];
          const updatedVendors = vendors.map(v => 
              v.id === currentVendor.id 
                ? { ...v, paymentMethods: updatedMethods } 
                : v
          );
          await setVendors(updatedVendors);
          setShowAddMethodModal(false);
          setNewPaymentMethod({ type: 'BANK', bankName: '', accountName: '', accountNumber: '', routingNumber: '', walletAddress: '', network: 'BTC' });
      } catch (err) {
          console.error("Failed to add payment method", err);
          alert("Failed to save payment method.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDeletePaymentMethod = async (id: string) => {
      if (!currentVendor || !setVendors) return;
      if (!confirm("Are you sure you want to delete this payment method?")) return;
      
      try {
          const updatedMethods = (currentVendor.paymentMethods || []).filter(m => m.id !== id);
          const updatedVendors = vendors.map(v => 
              v.id === currentVendor.id 
                ? { ...v, paymentMethods: updatedMethods } 
                : v
          );
          await setVendors(updatedVendors);
      } catch (err) {
           console.error("Failed to delete", err);
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
      items.push({ id: 'VERIFICATION', label: 'Identity Verification', icon: ShieldCheck });
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
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
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
              </div>
          ) : (
              <div className="p-12 text-center border border-dashed border-gray-200 text-gray-400">
                  <Inbox className="mx-auto mb-4 opacity-50" size={32} />
                  <p>No messages received.</p>
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
      
      const hasPaymentMethods = currentVendor?.paymentMethods && currentVendor.paymentMethods.length > 0;

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
              {showAddMethodModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
                       <div className="bg-white max-w-md w-full p-8 shadow-2xl relative animate-slide-up">
                            <button onClick={() => setShowAddMethodModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"><X size={20}/></button>
                            <h3 className="text-xl font-bold font-serif italic mb-6">Add Payout Method</h3>
                            
                            <form onSubmit={handleAddPaymentMethod} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Method Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setNewPaymentMethod({...newPaymentMethod, type: 'BANK'})}
                                            className={`py-3 text-xs font-bold uppercase border transition-all ${newPaymentMethod.type === 'BANK' ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-black'}`}
                                        >
                                            Bank Transfer
                                        </button>
                                        <button 
                                             type="button"
                                             onClick={() => setNewPaymentMethod({...newPaymentMethod, type: 'CRYPTO'})}
                                             className={`py-3 text-xs font-bold uppercase border transition-all ${newPaymentMethod.type === 'CRYPTO' ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-black'}`}
                                        >
                                            Crypto Wallet
                                        </button>
                                    </div>
                                </div>

                                {newPaymentMethod.type === 'BANK' ? (
                                    <>
                                        <div>
                                            <input 
                                                required
                                                placeholder="Account Holder Name"
                                                value={newPaymentMethod.accountName}
                                                onChange={e => setNewPaymentMethod({...newPaymentMethod, accountName: e.target.value})}
                                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                                            />
                                        </div>
                                        <div>
                                            <input 
                                                required
                                                placeholder="Bank Name"
                                                value={newPaymentMethod.bankName}
                                                onChange={e => setNewPaymentMethod({...newPaymentMethod, bankName: e.target.value})}
                                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                                            />
                                        </div>
                                        <div>
                                            <input 
                                                required
                                                placeholder="Account Number / IBAN"
                                                value={newPaymentMethod.accountNumber}
                                                onChange={e => setNewPaymentMethod({...newPaymentMethod, accountNumber: e.target.value})}
                                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                                            />
                                        </div>
                                        <div>
                                            <input 
                                                required
                                                placeholder="Routing / Sort Code / BIC"
                                                value={newPaymentMethod.routingNumber}
                                                onChange={e => setNewPaymentMethod({...newPaymentMethod, routingNumber: e.target.value})}
                                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                         <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Network</label>
                                            <select 
                                                value={newPaymentMethod.network}
                                                onChange={e => setNewPaymentMethod({...newPaymentMethod, network: e.target.value})}
                                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-white"
                                            >
                                                <option value="BTC">Bitcoin (BTC)</option>
                                                <option value="ETH">Ethereum (ETH)</option>
                                                <option value="SOL">Solana (SOL)</option>
                                                <option value="USDC">USDC (ERC-20)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <input 
                                                required
                                                placeholder="Wallet Address"
                                                value={newPaymentMethod.walletAddress}
                                                onChange={e => setNewPaymentMethod({...newPaymentMethod, walletAddress: e.target.value})}
                                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none font-mono"
                                            />
                                        </div>
                                    </>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader className="animate-spin" size={16}/> : 'Save Method'}
                                </button>
                            </form>
                       </div>
                  </div>
              )}

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
                                          {currentVendor?.paymentMethods?.[0]?.type === 'CRYPTO' ? <Bitcoin size={16} className="text-gray-400" /> : <Banknote size={16} className="text-gray-400" />}
                                          <span className="text-sm text-gray-600">
                                              {currentVendor?.paymentMethods?.[0] ? 
                                                (currentVendor.paymentMethods[0].type === 'BANK' ? `Bank ending in •••• ${currentVendor.paymentMethods[0].details.accountNumber?.slice(-4)}` : `${currentVendor.paymentMethods[0].details.network} Wallet`)
                                                : "Select Method"}
                                          </span>
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
                      onClick={() => {
                          if (!hasPaymentMethods) {
                              alert("Please add a payout method first.");
                              setShowAddMethodModal(true);
                          } else {
                              setShowWithdrawModal(true);
                          }
                      }}
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

              {/* Payout Methods Section */}
              <div className="bg-white border border-gray-100 shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                       <h3 className="font-bold text-sm uppercase tracking-widest">Payout Methods</h3>
                       <button onClick={() => setShowAddMethodModal(true)} className="text-xs font-bold underline hover:text-luxury-gold flex items-center gap-1">
                           <Plus size={12}/> Add Method
                       </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentVendor?.paymentMethods?.map((method) => (
                          <div key={method.id} className="border border-gray-200 p-4 rounded-sm flex justify-between items-start group hover:border-black transition-colors">
                              <div className="flex gap-4">
                                  <div className="p-3 bg-gray-50 rounded-full h-fit">
                                      {method.type === 'BANK' ? <Banknote size={20} /> : <Bitcoin size={20} />}
                                  </div>
                                  <div>
                                      <p className="font-bold text-sm mb-1">{method.type === 'BANK' ? method.details.bankName : `${method.details.network} Wallet`}</p>
                                      <p className="text-xs text-gray-500 font-mono">
                                          {method.type === 'BANK' 
                                              ? `•••• ${method.details.accountNumber?.slice(-4)}` 
                                              : `${method.details.walletAddress?.slice(0, 6)}...${method.details.walletAddress?.slice(-4)}`
                                          }
                                      </p>
                                      {method.type === 'BANK' && <p className="text-[10px] text-gray-400 mt-1 uppercase">{method.details.accountName}</p>}
                                  </div>
                              </div>
                              <button onClick={() => handleDeletePaymentMethod(method.id)} className="text-gray-400 hover:text-red-500 p-2">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      ))}
                      
                      {(!currentVendor?.paymentMethods || currentVendor.paymentMethods.length === 0) && (
                          <div className="col-span-full text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-sm">
                              <p className="text-xs">No payout methods added yet.</p>
                          </div>
                      )}
                  </div>
              </div>

              <div className="bg-white border border-gray-100 shadow-sm">
                  <div className="p-6 border-b border-gray-50">
                      <h3 className="font-bold text-sm uppercase tracking-widest">Transaction History</h3>
                  </div>
                  {vendorOrders.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 italic">No transactions recorded yet.</div>
                  ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
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
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const renderFollowers = () => {
      return (
          <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif italic">Community</h2>
                  {followers.length > 0 && (
                      <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Live Updates Active</span>
                      </div>
                  )}
              </div>
              
              {followers.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 border border-dashed border-gray-200">
                      <p>No followers yet. Your community will grow as you publish more collections.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {followers.map(follower => (
                          <div key={follower.id} className="bg-white border border-gray-100 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                              <img src={follower.avatar} className="w-16 h-16 rounded-full mb-4 object-cover border border-gray-100" />
                              <h3 className="font-bold text-sm">{follower.name}</h3>
                              <p className="text-xs text-gray-400 mb-2">{follower.location}</p>
                              {follower.joined === "Just now" && (
                                  <span className="bg-green-100 text-green-600 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mb-3">New</span>
                              )}
                              
                              <div className="grid grid-cols-2 gap-3 w-full mt-auto">
                                <button 
                                    onClick={() => setSelectedFollower(follower)}
                                    className="text-[10px] font-bold uppercase tracking-widest border border-gray-200 py-2 hover:bg-gray-50 transition-colors"
                                >
                                    Profile
                                </button>
                                <button 
                                    onClick={() => {
                                        // In a real app, this would open a chat context
                                        alert(`Messaging ${follower.name}...`);
                                    }}
                                    className="bg-black text-white text-[10px] font-bold uppercase tracking-widest py-2 hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={12} /> Message
                                </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      );
  };

  const renderVendorVerification = () => {
    const status = currentVendor?.verificationStatus || 'UNSUBMITTED';
    
    if (status === 'VERIFIED') {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <BadgeCheck size={40} />
                </div>
                <h2 className="text-2xl font-serif italic mb-2">Verified Atelier</h2>
                <p className="text-gray-500 max-w-md">Your identity has been confirmed. You have full access to listing and payout features.</p>
            </div>
        );
    }

    if (status === 'PENDING') {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                    <Clock size={40} />
                </div>
                <h2 className="text-2xl font-serif italic mb-2">Verification in Progress</h2>
                <p className="text-gray-500 max-w-md">Our curation team is reviewing your documents. This typically takes 24-48 hours.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-serif italic mb-2">Identity Verification</h2>
                <p className="text-gray-500 text-sm">To ensure the integrity of our marketplace, we require valid identification from all ateliers.</p>
            </div>

            <form onSubmit={handleKycSubmit} className="space-y-6 bg-white p-8 border border-gray-100 shadow-sm">
                {/* ID Front */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Government ID (Front)</label>
                    <div 
                        onClick={() => kycIdFrontRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors bg-gray-50"
                    >
                        {kycFiles.idFront ? (
                            <img src={kycFiles.idFront} className="h-full object-contain" />
                        ) : (
                            <>
                                <UploadCloud className="text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500">Click to Upload</span>
                            </>
                        )}
                    </div>
                    <input type="file" ref={kycIdFrontRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (b64) => setKycFiles({...kycFiles, idFront: b64}))} />
                </div>

                {/* ID Back */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Government ID (Back)</label>
                    <div 
                        onClick={() => kycIdBackRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors bg-gray-50"
                    >
                        {kycFiles.idBack ? (
                            <img src={kycFiles.idBack} className="h-full object-contain" />
                        ) : (
                            <>
                                <UploadCloud className="text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500">Click to Upload</span>
                            </>
                        )}
                    </div>
                    <input type="file" ref={kycIdBackRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (b64) => setKycFiles({...kycFiles, idBack: b64}))} />
                </div>

                {/* Proof of Address */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Proof of Address (Utility Bill/Bank Statement)</label>
                    <div 
                        onClick={() => kycProofRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors bg-gray-50"
                    >
                        {kycFiles.proofOfAddress ? (
                            <img src={kycFiles.proofOfAddress} className="h-full object-contain" />
                        ) : (
                            <>
                                <FileText className="text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500">Click to Upload</span>
                            </>
                        )}
                    </div>
                    <input type="file" ref={kycProofRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (b64) => setKycFiles({...kycFiles, proofOfAddress: b64}))} />
                </div>

                {kycStatus.error && <p className="text-xs text-red-500">{kycStatus.error}</p>}

                <button 
                    type="submit" 
                    disabled={kycStatus.loading}
                    className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2"
                >
                    {kycStatus.loading ? <Loader className="animate-spin" size={16}/> : 'Submit Documents'}
                </button>
            </form>
        </div>
    );
  };

  const renderAdminVerification = () => {
    const pendingVendors = vendors.filter(v => v.verificationStatus === 'PENDING');

    const handleVerdict = async (vendor: Vendor, status: VerificationStatus) => {
        if (setVendors) {
            const updated = vendors.map(v => v.id === vendor.id ? { ...v, verificationStatus: status } : v);
            await setVendors(updated);
            setVerificationModalOpen(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-serif italic mb-6">Verification Requests</h2>
            
            {pendingVendors.length === 0 ? (
                <div className="text-center py-20 text-gray-400 border border-dashed border-gray-200">
                    <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No pending verification requests.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingVendors.map(vendor => (
                        <div key={vendor.id} className="bg-white border border-gray-100 p-6 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-4">
                                <img src={vendor.avatar} className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <h4 className="font-bold text-sm">{vendor.name}</h4>
                                    <p className="text-xs text-gray-500">Submitted: {vendor.kycDocuments?.submittedAt ? new Date(vendor.kycDocuments.submittedAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setVerificationModalOpen(vendor)}
                                className="px-6 py-2 border border-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                            >
                                Review Documents
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Admin Review Modal */}
            {verificationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-4xl h-[90vh] overflow-y-auto p-8 relative shadow-2xl animate-slide-up">
                        <button onClick={() => setVerificationModalOpen(null)} className="absolute top-6 right-6 hover:rotate-90 transition-transform"><X size={24}/></button>
                        
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                            <img src={verificationModalOpen.avatar} className="w-16 h-16 rounded-full object-cover" />
                            <div>
                                <h2 className="text-2xl font-serif italic">{verificationModalOpen.name}</h2>
                                <p className="text-sm text-gray-500">{verificationModalOpen.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">ID Front</p>
                                <div className="bg-gray-100 p-2 rounded-sm">
                                    <img src={verificationModalOpen.kycDocuments?.idFront} className="w-full h-auto object-contain" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">ID Back</p>
                                <div className="bg-gray-100 p-2 rounded-sm">
                                    <img src={verificationModalOpen.kycDocuments?.idBack} className="w-full h-auto object-contain" />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Proof of Address</p>
                                <div className="bg-gray-100 p-2 rounded-sm">
                                    <img src={verificationModalOpen.kycDocuments?.proofOfAddress} className="w-full h-auto object-contain" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 border-t border-gray-100 pt-8">
                            <button 
                                onClick={() => handleVerdict(verificationModalOpen, 'REJECTED')}
                                className="flex-1 py-4 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-colors"
                            >
                                Reject Application
                            </button>
                            <button 
                                onClick={() => handleVerdict(verificationModalOpen, 'VERIFIED')}
                                className="flex-1 py-4 bg-green-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-colors"
                            >
                                Approve & Verify
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                           <button 
                               onClick={() => setProfileForm({...profileForm, visualTheme: 'MINIMALIST'})}
                               className={`border-2 p-4 text-center transition-all ${profileForm.visualTheme === 'MINIMALIST' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                           >
                               <div className="w-full h-12 bg-gray-50 mb-2 border border-gray-100" />
                               <span className="text-xs font-bold">Minimalist</span>
                           </button>
                           <button 
                               onClick={() => setProfileForm({...profileForm, visualTheme: 'DARK'})}
                               className={`border-2 p-4 text-center transition-all ${profileForm.visualTheme === 'DARK' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                           >
                               <div className="w-full h-12 bg-black mb-2" />
                               <span className="text-xs font-bold">Dark Mode</span>
                           </button>
                           <button 
                               onClick={() => setProfileForm({...profileForm, visualTheme: 'GOLD'})}
                               className={`border-2 p-4 text-center transition-all ${profileForm.visualTheme === 'GOLD' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                           >
                               <div className="w-full h-12 bg-luxury-gold mb-2" />
                               <span className="text-xs font-bold">Atelier Gold</span>
                           </button>
                       </div>
                   </div>
                   
                   <div className="pt-6 border-t border-gray-100">
                        <button 
                            onClick={handleSaveProfile} 
                            disabled={isSubmitting}
                            className="bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting ? <Loader className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
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
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
           <p className="text-gray-500 text-sm">Welcome back, {role === UserRole.VENDOR ? currentVendor?.name : (role === UserRole.ADMIN ? 'Super Admin' : 'User')}</p>
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
               <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Headline 1</label>
                                    <input value={cmsForm.hero.titleLine1} onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, titleLine1: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Headline 2</label>
                                    <input value={cmsForm.hero.titleLine2} onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, titleLine2: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subtitle</label>
                                    <input value={cmsForm.hero.subtitle} onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, subtitle: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Video URL (MP4)</label>
                                    <input value={cmsForm.hero.videoUrl} onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, videoUrl: e.target.value}})} className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black" />
                                </div>
                            </div>
                        )}
                            {/* ... Other CMS sections simplified ... */}
                            <button onClick={handleSaveCMS} disabled={isSubmitting} className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold disabled:opacity-50">
                            {isSubmitting ? 'Saving...' : 'Publish Changes'}
                            </button>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-400"><Loader className="animate-spin inline" /> Loading CMS content...</div>
                )}
            </div>
        );
      case 'ORDERS': // Admin/Vendor Orders view fallback or reuse
        if (isBuyer) return renderInbox(); // Just as fallback, though Buyer has specific view in Overview or separate components logic ideally
        return renderFulfillment(); // Reuse Fulfillment for simplicty in this fix scope
      case 'SAVED':
      case 'SETTINGS':
      case 'SUBSCRIPTIONS':
      case 'USERS':
      case 'REVIEWS':
      case 'TRANSACTIONS':
      case 'PROFILE':
          if (activeTab === 'PROFILE') {
              // Profile editing view for Buyer/Vendor
              if (isVendor) return renderStoreDesign(); // Reuse store design as profile
              return (
                  <div className="max-w-xl mx-auto bg-white p-8 border border-gray-100 shadow-sm animate-fade-in">
                    <h2 className="text-2xl font-serif italic mb-6">Profile Settings</h2>
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Change Password</h3>
                        <input 
                            type="password" 
                            placeholder="New Password" 
                            value={passwords.new} 
                            onChange={e => setPasswords({...passwords, new: e.target.value})}
                            className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black"
                        />
                        <input 
                            type="password" 
                            placeholder="Confirm Password" 
                            value={passwords.confirm} 
                            onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                            className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black"
                        />
                            {passwordStatus.error && <p className="text-red-500 text-xs">{passwordStatus.error}</p>}
                            {passwordStatus.success && <p className="text-green-500 text-xs">Password updated.</p>}
                            <button onClick={handleUpdatePassword} disabled={passwordStatus.loading} className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-50">
                                {passwordStatus.loading ? 'Updating...' : 'Update Password'}
                            </button>
                    </div>
                  </div>
              );
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
