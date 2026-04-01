
import React, { useState, useEffect, Suspense, useMemo, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layout } from './Layout.tsx';
import { LandingView } from './LandingView.tsx';
import { Loader } from 'lucide-react';
import { FeatureFlags, Product, UserRole, ViewState, Vendor, CartItem, Order, User, LandingPageContent, ContactSubmission, AppNotification, Follower } from '../types.ts';
import { 
  initSchema, seedDatabase, fetchVendors, fetchProducts, fetchOrders, fetchUsers, fetchLandingContent, fetchContactSubmissions,
  addProductToDb, updateProductInDb, deleteProductFromDb,
  updateVendorInDb, createVendorInDb, createOrderInDb, updateOrderStatusInDb, updateUserInDb, deleteUserFromDb, updateLandingContentInDb, createNotificationInDb, fetchNotifications,
  fetchUserFollowedVendors, addFollowerToDb, removeFollowerFromDb, updateContactStatusInDb, fetchAllFollowers, voteForProduct, fetchUserVotes,
  fetchCartItems, addCartItemToDb, updateCartItemInDb, removeCartItemFromDb, clearCartInDb,
  fetchSavedItems, addSavedItemToDb, removeSavedItemFromDb, trackProductEvent
} from '@/services/dataService';
import { searchProductsByImage } from '../services/geminiService.ts';
import { auth, onAuthStateChanged, signOut } from '../services/firebase.ts';

// Lazy Load Heavy Components for Performance
const MarketplaceView = React.lazy(() => import('./MarketplaceView.tsx').then(m => ({ default: m.MarketplaceView })));
const NewArrivalsView = React.lazy(() => import('./NewArrivalsView.tsx').then(m => ({ default: m.NewArrivalsView })));
const NewArrivalsManageView = React.lazy(() => import('./NewArrivalsManageView.tsx').then(m => ({ default: m.NewArrivalsManageView })));
const DesignersView = React.lazy(() => import('./DesignersView.tsx').then(m => ({ default: m.DesignersView })));
const VendorProfileView = React.lazy(() => import('./VendorProfileView.tsx').then(m => ({ default: m.VendorProfileView })));
const ProductDetail = React.lazy(() => import('./ProductDetail.tsx').then(m => ({ default: m.ProductDetail })));
const Dashboard = React.lazy(() => import('./Dashboard.tsx').then(m => ({ default: m.Dashboard })));
const AuthView = React.lazy(() => import('./AuthView.tsx').then(m => ({ default: m.AuthView })));
const PricingView = React.lazy(() => import('./PricingView.tsx').then(m => ({ default: m.PricingView })));
const AboutView = React.lazy(() => import('./AboutView.tsx').then(m => ({ default: m.AboutView })));
const AiConcierge = React.lazy(() => import('./AiConcierge.tsx').then(m => ({ default: m.AiConcierge })));
const TheDropView = React.lazy(() => import('./TheDropView.tsx').then(m => ({ default: m.TheDropView })));
const DirectMessaging = React.lazy(() => import('./DirectMessaging.tsx').then(m => ({ default: m.DirectMessaging })));

const LoadingFallback = () => (
  <div className="h-[50vh] flex items-center justify-center">
    <Loader className="animate-spin text-luxury-gold" size={24} />
  </div>
);

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.BUYER);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | Vendor | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<Product[]>([]);
  const [followedVendors, setFollowedVendors] = useState<Vendor[]>([]);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isDirectMessagingOpen, setIsDirectMessagingOpen] = useState(false);
  const [dmInitialRecipientId, setDmInitialRecipientId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedDesignerFilter, setSelectedDesignerFilter] = useState<string | null>(null);
  
  // Auth Navigation State
  const [authInitialMode, setAuthInitialMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>(UserRole.BUYER);
  const [authInitialPlan, setAuthInitialPlan] = useState<'Atelier' | 'Maison' | 'Couture' | undefined>(undefined);

  // Data State
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [cmsContent, setCmsContent] = useState<LandingPageContent | undefined>(undefined);
  const [allFollowers, setAllFollowers] = useState<Follower[]>([]);
  // Removed blocking isLoadingData state

  // Sync ViewState with URL
  useEffect(() => {
    const path = location.pathname;
    let view: ViewState = 'LANDING';

    if (path === '/') view = 'LANDING';
    else if (path === '/marketplace') view = 'MARKETPLACE';
    else if (path === '/new-arrivals') view = 'NEW_ARRIVALS';
    else if (path === '/new-arrivals/manage') view = 'NEW_ARRIVALS_MANAGE';
    else if (path === '/designers') view = 'DESIGNERS';
    else if (path === '/the-drop') view = 'THE_DROP';
    else if (path.startsWith('/vendor/')) view = 'VENDOR_PROFILE';
    else if (path.startsWith('/product/')) view = 'PRODUCT_DETAIL';
    else if (path === '/vendor/dashboard') view = 'VENDOR_DASHBOARD';
    else if (path === '/admin') view = 'ADMIN_PANEL';
    else if (path === '/dashboard') view = 'BUYER_DASHBOARD';
    else if (path === '/auth') view = 'AUTH';
    else if (path === '/profile') view = 'PROFILE_SETTINGS';
    else if (path === '/pricing') view = 'PRICING';
    else if (path === '/about') view = 'ABOUT';
    else if (path === '/concierge') view = 'AI_CONCIERGE';

    if (view !== currentView) {
      setCurrentView(view);
    }
  }, [location.pathname, currentView]);

  const handleNavigate = useCallback((view: ViewState) => {
    if (view === 'AUTH') {
        // Reset defaults if navigating generically
        setAuthInitialMode('LOGIN');
        setAuthInitialRole(UserRole.BUYER);
    }
    
    if (view !== 'MARKETPLACE') {
        setSelectedDesignerFilter(null);
    }
    
    window.scrollTo({ top: 0, behavior: 'auto' });
    setIsCartOpen(false);
    setIsSavedOpen(false);
    setIsDirectMessagingOpen(false);

    let path = '/';
    switch (view) {
      case 'LANDING': path = '/'; break;
      case 'MARKETPLACE': path = '/marketplace'; break;
      case 'NEW_ARRIVALS': path = '/new-arrivals'; break;
      case 'NEW_ARRIVALS_MANAGE': path = '/new-arrivals/manage'; break;
      case 'DESIGNERS': path = '/designers'; break;
      case 'THE_DROP': path = '/the-drop'; break;
      case 'VENDOR_PROFILE': path = `/vendor/${selectedVendor?.id || 'v1'}`; break;
      case 'PRODUCT_DETAIL': path = `/product/${selectedProduct?.id || 'p1'}`; break;
      case 'VENDOR_DASHBOARD': path = '/vendor/dashboard'; break;
      case 'ADMIN_PANEL': path = '/admin'; break;
      case 'BUYER_DASHBOARD': path = '/dashboard'; break;
      case 'AUTH': path = '/auth'; break;
      case 'PROFILE_SETTINGS': path = '/profile'; break;
      case 'PRICING': path = '/pricing'; break;
      case 'ABOUT': path = '/about'; break;
      case 'AI_CONCIERGE': path = '/concierge'; break;
    }
    navigate(path);
  }, [navigate, selectedVendor, selectedProduct]);

  const openDirectMessaging = (recipientId?: string) => {
    if (!isLoggedIn) {
      handleAuthNavigation('LOGIN', UserRole.BUYER);
      return;
    }
    setDmInitialRecipientId(recipientId || null);
    setIsDirectMessagingOpen(true);
  };

  // Sync selected items from URL
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/product/')) {
      const productId = path.split('/')[2];
      const product = products.find(p => p.id === productId);
      if (product && selectedProduct?.id !== productId) {
        setSelectedProduct(product);
      }
    } else if (path.startsWith('/vendor/')) {
      const vendorId = path.split('/')[2];
      const vendor = vendors.find(v => v.id === vendorId);
      if (vendor && selectedVendor?.id !== vendorId) {
        setSelectedVendor(vendor);
      }
    }
  }, [location.pathname, products, vendors, selectedProduct, selectedVendor]);

  // Visual Search State
  const [visualSearchResults, setVisualSearchResults] = useState<Product[] | null>(null);
  const isRefreshingRef = useRef(false);

  const currentUserId = currentUser?.id;

  // Initialize DB and Fetch Data - Non-blocking
  const refreshData = useCallback(async (force = false) => {
    if (isRefreshingRef.current && !force) return;
    isRefreshingRef.current = true;
    try {
      // Prioritize content visible on landing
      const [dbContent, dbVendors, dbProducts] = await Promise.all([
        fetchLandingContent(),
        fetchVendors(), 
        fetchProducts(),
      ]);
      
      setCmsContent(dbContent);
      setVendors(dbVendors);
      setProducts(dbProducts);

      // Fetch user-specific data (Notifications, Orders, Follows, Votes)
      const currentUserId = auth.currentUser?.uid;
      
      // Load heavy data in parallel
      // Only fetch admin-only data if user is admin
      const isAdmin = userRole === UserRole.ADMIN;
      
      const [dbOrders, dbUsers, dbContacts, dbNotifications, dbFollowers] = await Promise.all([
        fetchOrders(),
        isAdmin ? fetchUsers() : Promise.resolve([]),
        isAdmin ? fetchContactSubmissions() : Promise.resolve([]),
        fetchNotifications(currentUserId),
        isAdmin ? fetchAllFollowers() : Promise.resolve([])
      ]);

      setOrders(dbOrders);
      setAllUsers(dbUsers);
      setContactSubmissions(dbContacts);
      setNotifications(dbNotifications);
      setAllFollowers(dbFollowers);

      if (currentUserId) {
          const [follows, votes] = await Promise.all([
              fetchUserFollowedVendors(currentUserId),
              fetchUserVotes(currentUserId)
          ]);
          setFollowedVendors(follows);
          setUserVotes(votes);
      }

    } catch (error) {
      console.error("Failed to refresh data", error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [userRole]);

  useEffect(() => {
    // Initial Load
    const initData = async () => {
      try {
        await initSchema();
        await seedDatabase();
        await refreshData(true);
      } catch (error) {
        console.error("Database initialization failed.", error);
      }
    };
    initData();

    // Real-time: Poll for general data updates every 3 seconds
    const pollInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            refreshData();
        }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [refreshData]);

  // Load user specific data when auth state changes
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUserId) {
        const [dbCart, dbSaved] = await Promise.all([
          fetchCartItems(currentUserId),
          fetchSavedItems(currentUserId)
        ]);
        setCart(dbCart);
        setSavedItems(dbSaved);
      } else {
        // Load from local storage if not logged in
        const saved = localStorage.getItem('myfitstore_saved');
        if (saved) {
          try {
            setSavedItems(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to load saved items", e);
          }
        }
        const localCart = localStorage.getItem('myfitstore_cart');
        if (localCart) {
          try {
            setCart(JSON.parse(localCart));
          } catch (e) {
            console.error("Failed to load cart", e);
          }
        }
      }
    };
    loadUserData();
  }, [currentUserId]);

  // Sync saved items and cart to local storage for guests
  useEffect(() => {
    if (!currentUserId) {
      localStorage.setItem('myfitstore_saved', JSON.stringify(savedItems));
      localStorage.setItem('myfitstore_cart', JSON.stringify(cart));
    }
  }, [savedItems, cart, currentUserId]);

  // Handle Shared Outfit URL Params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outfitIds = params.get('outfit');
    
    // Only process if products are loaded
    if (outfitIds && products.length > 0) {
      const ids = outfitIds.split(',');
      const sharedProducts = products.filter(p => ids.includes(p.id));
      
      if (sharedProducts.length > 0) {
        setSavedItems(sharedProducts);
        setIsSavedOpen(true); // Open the drawer to show the shared outfit
        
        // Clean URL without reloading
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [products]);

  // Simulate Live Transactions (Context-Aware)
  useEffect(() => {
      const simulateLiveTraffic = setInterval(async () => {
          // Guard: Need data to simulate
          if (products.length === 0 || vendors.length === 0) return;

          const currentUser = auth.currentUser;
          const currentUserId = currentUser?.uid;
          const currentUserEmail = currentUser?.email;

          // --- 1. BUYER SCENARIO: Order Status Updates ---
          // If logged in as a buyer, randomly update their existing orders to 'Shipped' or 'Delivered'
          if (userRole === UserRole.BUYER && currentUserEmail) {
              const myOrders = orders.filter(o => o.customerName.toLowerCase() === currentUserEmail.toLowerCase() && o.status !== 'Delivered');
              
              if (myOrders.length > 0 && Math.random() > 0.6) {
                  const targetOrder = myOrders[Math.floor(Math.random() * myOrders.length)];
                  const nextStatus = targetOrder.status === 'Processing' ? 'Shipped' : 'Delivered';
                  
                  await updateOrderStatusInDb(targetOrder.id, nextStatus);
                  
                  const notif: AppNotification = {
                      id: `notif_status_${Date.now()}`,
                      userId: currentUserId || 'guest',
                      title: 'Order Update',
                      message: `Your order #${targetOrder.id.slice(-6)} has been ${nextStatus}.`,
                      read: false,
                      date: new Date().toISOString(),
                      type: 'ORDER',
                      link: 'ORDERS'
                  };
                  await createNotificationInDb(notif);
                  await refreshData();
                  return; // prioritize one event per tick
              }
          }

          // --- 2. VENDOR / ADMIN SCENARIO: New Sales ---
          let targetProduct: Product | null = null;

          if (userRole === UserRole.VENDOR && currentUserId) {
              // Find this vendor's details to pick THEIR product
              const myVendor = vendors.find(v => v.id === currentUserId || v.email === currentUserEmail);
              if (myVendor) {
                  const myProducts = products.filter(p => p.designer === myVendor.name);
                  if (myProducts.length > 0) {
                      targetProduct = myProducts[Math.floor(Math.random() * myProducts.length)];
                  }
              }
          } else if (userRole === UserRole.ADMIN) {
              // Admin sees random sales across platform
              targetProduct = products[Math.floor(Math.random() * products.length)];
          } else if (userRole === UserRole.BUYER && Math.random() > 0.8) {
              // Rare chance for Buyer to see a "Platform Activity" notification (Social Proof)
              targetProduct = products[Math.floor(Math.random() * products.length)];
          }

          // Execute Sale Simulation
          if (targetProduct && Math.random() > 0.5) {
              const vendorObj = vendors.find(v => v.name === targetProduct!.designer);
              if (!vendorObj) return;

              const mockOrder: Order = {
                  id: `ord_live_${Date.now()}`,
                  customerName: `Guest_${Math.floor(Math.random() * 9000) + 1000}`,
                  date: new Date().toISOString(),
                  total: targetProduct.price,
                  status: 'Processing',
                  items: [{
                      ...targetProduct,
                      quantity: 1,
                      size: targetProduct.sizes?.[0] || 'M',
                      stock: targetProduct.stock
                  }]
              };

              await createOrderInDb(mockOrder);

              // Notify the Vendor (Always)
              const vendorNotif: AppNotification = {
                  id: `notif_sale_${mockOrder.id}`,
                  userId: vendorObj.id,
                  title: 'New Sale',
                  message: `You sold 1x ${targetProduct.name} to ${mockOrder.customerName}.`,
                  read: false,
                  date: new Date().toISOString(),
                  type: 'ORDER',
                  link: 'FULFILLMENT'
              };
              await createNotificationInDb(vendorNotif);

              // If currently logged in as Admin, notify them too
              if (userRole === UserRole.ADMIN && currentUserId) {
                   const adminNotif: AppNotification = {
                      id: `notif_admin_${mockOrder.id}`,
                      userId: currentUserId,
                      title: 'Platform Sale',
                      message: `${vendorObj.name} sold ${targetProduct.name} ($${targetProduct.price}).`,
                      read: false,
                      date: new Date().toISOString(),
                      type: 'SYSTEM',
                      link: 'TRANSACTIONS'
                  };
                  await createNotificationInDb(adminNotif);
              }

              console.log("Simulated live order:", mockOrder.id);
              await refreshData();
          }

      }, 15000); // Check every 15s for lively feel

      return () => clearInterval(simulateLiveTraffic);
  }, [products, vendors, userRole, orders]);

  // Listen for Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.emailVerified) {
          setIsLoggedIn(true);
          
          // Determine Role
          const adminEmails = ['instantassetrecovery830@gmail.com', 'juliemtrice7@proton.me', 'mikelarry00764@proton.me'];
          if (adminEmails.includes(user.email?.toLowerCase() || '')) {
              setUserRole(UserRole.ADMIN);
              // Fetch user object for admin
              const currentUsers = await fetchUsers();
              const dbUser = currentUsers.find(u => u.email.toLowerCase() === user.email?.toLowerCase());
              setCurrentUser(dbUser || {
                  id: user.uid,
                  name: 'Admin',
                  email: user.email!,
                  role: UserRole.ADMIN,
                  avatar: 'https://ui-avatars.com/api/?name=Admin',
                  joined: new Date().toISOString(),
                  status: 'ACTIVE'
              } as User);
          } else {
              // Check if user has an assigned role in the Users table
              let currentUsers = allUsers;
              if (currentUsers.length === 0) {
                 currentUsers = await fetchUsers();
              }
              
              const dbUser = currentUsers.find(u => u.email.toLowerCase() === user.email?.toLowerCase());

              if (dbUser && dbUser.role) {
                  setUserRole(dbUser.role);
                  setCurrentUser(dbUser);
              } else {
                  // Fallback to Vendor check
                  let currentVendors = vendors;
                  if (currentVendors.length === 0) {
                      currentVendors = await fetchVendors();
                  }
                  const matchingVendor = currentVendors.find(v => v.email?.toLowerCase() === user.email?.toLowerCase());
                  
                  if (matchingVendor) {
                      setUserRole(UserRole.VENDOR);
                      setCurrentUser(matchingVendor);
                  } else {
                      setUserRole(UserRole.BUYER);
                      setCurrentUser({
                          id: user.uid,
                          name: user.displayName || 'User',
                          email: user.email!,
                          role: UserRole.BUYER,
                          avatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`,
                          joined: new Date().toISOString(),
                          status: 'ACTIVE'
                      } as User);
                  }
              }
          }
          setIsAuthReady(true);
          refreshData();
        } else {
          // User exists but is not verified
          setIsLoggedIn(false);
          setUserRole(UserRole.BUYER);
          setCurrentUser(null);
          navigate('/auth');
          setIsAuthReady(true);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(UserRole.BUYER);
        setCurrentUser(null);
        setNotifications([]); // Clear notifications on logout
        setFollowedVendors([]);
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, [allUsers, vendors]); // Depend on data to ensure correct role assignment

  // Helper to check if a product is effectively a "New Arrival" (isNewSeason AND created within last 7 days)
  const isEffectiveNewArrival = useCallback((product: Product) => {
      if (!product.isNewSeason) return false;
      if (!product.createdAt) return false;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(product.createdAt) > oneWeekAgo;
  }, []);

  // Derived State: Active Products (only from active vendors who are verified OR Admins)
  const activeProducts = useMemo(() => products.filter(product => {
      // 1. Check if it belongs to a Vendor
      const vendor = vendors.find(v => v.name === product.designer);
      if (vendor) {
          return vendor.subscriptionStatus === 'ACTIVE' && vendor.verificationStatus === 'VERIFIED';
      }

      // 2. If not a vendor, check if it belongs to an Admin
      // We check if the designer name matches any user with ADMIN role
      const author = allUsers.find(u => u.name === product.designer || (u.email && u.email.split('@')[0] === product.designer));
      if (author && author.role === UserRole.ADMIN) {
          return true;
      }
      
      // 3. Allow if it's explicitly one of the hardcoded admin emails (fallback)
      const adminEmails = ['instantassetrecovery830@gmail.com', 'juliemtrice7@proton.me', 'mikelarry00764@proton.me'];
      // We don't have the email on the product, only the name. 
      // But if the name matches the email prefix of an admin, we can allow it.
      const isAdminEmailPrefix = adminEmails.some(email => email.split('@')[0] === product.designer);
      if (isAdminEmailPrefix) return true;

      return false; 
  }), [products, vendors, allUsers]);

  // Feature Flags Management
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    enableMarketplace: true,
    enableReviews: true,
    enableAiStyleMatch: true,
    maintenanceMode: false
  });

  // Handlers

  const handleAuthNavigation = useCallback((mode: 'LOGIN' | 'REGISTER', role: UserRole, plan?: 'Atelier' | 'Maison' | 'Couture') => {
    console.log('handleAuthNavigation called:', { mode, role, plan });
    setAuthInitialMode(mode);
    setAuthInitialRole(role);
    setAuthInitialPlan(plan);
    navigate('/auth');
    window.scrollTo({ top: 0, behavior: 'auto' });
    setIsCartOpen(false);
    setIsSavedOpen(false);
  }, [navigate]);

  const handleDesignerSelect = useCallback((designerName: string) => {
    const vendor = vendors.find(v => v.name === designerName);
    if (vendor) {
      setSelectedVendor(vendor);
      handleNavigate('VENDOR_PROFILE');
    } else {
      setSelectedDesignerFilter(designerName);
      handleNavigate('MARKETPLACE');
    }
  }, [vendors, handleNavigate]);

  const handleLogin = useCallback((role: UserRole) => {
    setUserRole(role);
    if (role === UserRole.ADMIN) {
      handleNavigate('ADMIN_PANEL');
    } else if (role === UserRole.VENDOR) {
      handleNavigate('VENDOR_DASHBOARD');
    } else if (role === UserRole.BUYER) {
      handleNavigate('BUYER_DASHBOARD');
    } else {
      handleNavigate('MARKETPLACE');
    }
  }, [handleNavigate]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      handleNavigate('LANDING');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  }, [handleNavigate]);

  const handleProductSelect = useCallback((product: Product) => {
    setSelectedProduct(product);
    handleNavigate('PRODUCT_DETAIL');
  }, [handleNavigate]);

  const handleAddToCart = useCallback(async (product: Product, size: string, measurements?: string) => {
    const newItem: CartItem = {
      ...product,
      quantity: 1,
      size: size,
      measurements: measurements || ''
    };
    
    // Optimistic UI update
    setCart(prev => [...prev, newItem]);
    setIsCartOpen(true);

    // Track cart event
    trackProductEvent(product.id, product.vendorId, 'CART_ADD').catch(console.error);

    if (currentUserId) {
      const cartItemId = await addCartItemToDb(currentUserId, newItem);
      if (cartItemId) {
        setCart(prev => prev.map(item => 
            (item.id === product.id && item.size === size) ? { ...item, cartItemId } : item
        ));
      }
    }
  }, [currentUserId]);

  const handleUpdateCartItem = useCallback(async (index: number, updates: Partial<CartItem>) => {
    // Optimistic UI update
    setCart(prev => {
        const newCart = [...prev];
        if (newCart[index]) {
            newCart[index] = { ...newCart[index], ...updates };
        }
        return newCart;
    });
    
    const item = cart[index];
    if (currentUserId && item?.cartItemId) {
      await updateCartItemInDb(item.cartItemId!, (updates.quantity !== undefined ? updates.quantity : item.quantity), (updates.size !== undefined ? updates.size : item.size));
    }
  }, [cart, currentUserId]);

  const handleRemoveFromCart = useCallback(async (index: number) => {
    const removedItem = cart[index];
    
    // Optimistic UI update
    setCart(prev => prev.filter((_, i) => i !== index));
    
    if (currentUserId && removedItem?.cartItemId) {
      await removeCartItemFromDb(removedItem.cartItemId);
    }
  }, [cart, currentUserId]);

  // Saved Items Handler
  const handleVote = useCallback(async (product: Product) => {
    if (!currentUser) return;
    if (userVotes.includes(product.id)) return;

    // Optimistic UI update
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, votes: (p.votes || 0) + 1 } : p));
    setUserVotes(prev => [...prev, product.id]);

    try {
        await voteForProduct(product.id, currentUser.id);
    } catch (error) {
        // Rollback on error
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, votes: Math.max(0, (p.votes || 1) - 1) } : p));
        setUserVotes(prev => prev.filter(id => id !== product.id));
    }
  }, [currentUser, userVotes]);

  const handleToggleSave = useCallback(async (product: Product) => {
    const exists = savedItems.find(p => p.id === product.id);
    
    if (exists) {
      // Optimistic UI update
      setSavedItems(prev => prev.filter(p => p.id !== product.id));
      if (currentUserId) {
        await removeSavedItemFromDb(currentUserId, product.id);
      }
    } else {
      // Optimistic UI update
      setSavedItems(prev => [...prev, product]);
      setIsSavedOpen(true); // Open drawer when saving for better feedback
      if (currentUserId) {
        await addSavedItemToDb(currentUserId, product.id);
      }
    }
  }, [savedItems, currentUserId]);

  // Follow Vendor Handler
  const handleToggleFollow = useCallback(async (vendor: Vendor) => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
          handleAuthNavigation('LOGIN', UserRole.BUYER);
          return;
      }

      const isFollowing = followedVendors.some(v => v.id === vendor.id);
      const followerId = currentUser.uid;

      if (isFollowing) {
          // Optimistic update
          setFollowedVendors(prev => prev.filter(v => v.id !== vendor.id));
          await removeFollowerFromDb(followerId, vendor.id);
      } else {
          // Optimistic update
          setFollowedVendors(prev => [...prev, vendor]);
          
          const newFollower: Follower & { followerId: string } = {
              id: `follow_${followerId}_${vendor.id}`,
              name: currentUser.displayName || 'Anonymous',
              avatar: currentUser.photoURL || '',
              location: 'Unknown',
              joined: new Date().toISOString(),
              purchases: 0,
              style: 'General',
              vendorId: vendor.id,
              followerId: followerId
          };

          await addFollowerToDb(newFollower);
      }
  }, [followedVendors, handleAuthNavigation]);

  // --- VISUAL SEARCH HANDLER ---
  const handleVisualSearch = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      
      const matchIds = await searchProductsByImage(base64, activeProducts);
      const matchedProducts = activeProducts.filter(p => matchIds.includes(p.id));
      
      setVisualSearchResults(matchedProducts);
      handleNavigate('MARKETPLACE');
    };
    reader.readAsDataURL(file);
  };

  const handleClearVisualSearch = () => {
    setVisualSearchResults(null);
  };

  // --- ASYNC DATA HANDLERS ---

  const handleAddProduct = async (product: Product) => {
    await addProductToDb(product);
    await refreshData();
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    await updateProductInDb(updatedProduct);
    await refreshData();
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProductFromDb(productId);
    await refreshData();
  };
  
  const handleSetVendors = async (updatedVendors: Vendor[]) => {
    for (const v of updatedVendors) {
       await updateVendorInDb(v);
    }
    await refreshData();
  };
  
  const handleAddVendor = async (vendor: Vendor) => {
    await createVendorInDb(vendor);
    await refreshData();
  };
  
  const handleUpdateUser = async (user: User) => {
      await updateUserInDb(user);
      await refreshData();
  };

  const handleDeleteUser = async (userId: string) => {
      await deleteUserFromDb(userId);
      await refreshData();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    await updateOrderStatusInDb(orderId, status);
    await refreshData();
  };
  
  const handleUpdateContact = async (id: string, status: 'NEW' | 'READ' | 'ARCHIVED') => {
      await updateContactStatusInDb(id, status);
      await refreshData();
  };
  
  const handlePlaceOrder = async (order: Order) => {
     await createOrderInDb(order);
     
     // Track sale events for each item
     for (const item of order.items) {
       trackProductEvent(item.id, item.vendorId, 'SALE').catch(console.error);
     }

     if (currentUserId) {
       await clearCartInDb(currentUserId);
     }
     await refreshData();
     setCart([]); 
  };

  const handleUpdateCMSContent = async (content: LandingPageContent) => {
    await updateLandingContentInDb(content);
    await refreshData();
  };

  const toggleFeatureFlag = (key: keyof FeatureFlags) => {
    setFeatureFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (featureFlags.maintenanceMode && userRole !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen bg-luxury-cream flex flex-col items-center justify-center animate-fade-in">
        <h1 className="text-3xl font-serif font-bold tracking-widest mb-6">MyFitStore</h1>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">Under Maintenance</p>
      </div>
    );
  }

  const associatedVendor = vendors.find(v => v.name === selectedProduct?.designer);

  if (!isAuthReady) {
    return <LoadingFallback />;
  }

  return (
    <Layout 
      role={userRole} 
      cart={cart}
      savedItems={savedItems}
      isCartOpen={isCartOpen}
      setIsCartOpen={setIsCartOpen}
      isSavedOpen={isSavedOpen}
      setIsSavedOpen={setIsSavedOpen}
      onUpdateCartItem={handleUpdateCartItem}
      onRemoveFromCart={handleRemoveFromCart}
      onToggleSave={handleToggleSave}
      onNavigate={handleNavigate}
      onRoleChange={setUserRole}
      currentView={currentView}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
      onPlaceOrder={handlePlaceOrder}
      onVisualSearch={handleVisualSearch}
      onAuthRequest={handleAuthNavigation}
      notifications={notifications}
      onRefreshNotifications={refreshData}
      onOpenDirectMessaging={openDirectMessaging}
    >
      <Routes>
        <Route path="/" element={
          <LandingView 
            onNavigate={handleNavigate} 
            isLoggedIn={isLoggedIn} 
            userRole={userRole} 
            vendors={vendors}
            products={activeProducts.map(p => ({...p, isNewSeason: isEffectiveNewArrival(p)}))}
            onDesignerClick={handleDesignerSelect}
            cmsContent={cmsContent}
            onAuthRequest={handleAuthNavigation}
            onVote={handleVote}
            userVotes={userVotes}
          />
        } />
        <Route path="/marketplace" element={
          <Suspense fallback={<LoadingFallback />}>
            <MarketplaceView 
              onNavigate={handleNavigate} 
              onProductSelect={handleProductSelect} 
              initialDesigner={selectedDesignerFilter}
              products={visualSearchResults || activeProducts}
              vendors={vendors}
              customTitle={visualSearchResults ? "Visual Search Results" : null}
              onClearFilter={handleClearVisualSearch}
              savedItems={savedItems}
              onToggleSave={handleToggleSave}
            />
          </Suspense>
        } />
        <Route path="/new-arrivals" element={
          <Suspense fallback={<LoadingFallback />}>
            <NewArrivalsView 
                onProductSelect={handleProductSelect} 
                products={activeProducts.filter(p => isEffectiveNewArrival(p))}
                savedItems={savedItems}
                onToggleSave={handleToggleSave}
                onNavigate={handleNavigate}
                userRole={userRole}
                isLoggedIn={isLoggedIn}
                onVote={handleVote}
                userVotes={userVotes}
                onAuthRequest={handleAuthNavigation}
            />
          </Suspense>
        } />
        <Route path="/new-arrivals/manage" element={
          <Suspense fallback={<LoadingFallback />}>
            <NewArrivalsManageView 
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              userRole={userRole}
              onNavigate={handleNavigate}
              currentUser={currentUser}
            />
          </Suspense>
        } />
        <Route path="/designers" element={
          <Suspense fallback={<LoadingFallback />}>
            <DesignersView onSelectDesigner={handleDesignerSelect} vendors={vendors} />
          </Suspense>
        } />
        <Route path="/the-drop" element={
          <Suspense fallback={<LoadingFallback />}>
            <TheDropView products={products} onNavigate={handleNavigate} cmsContent={cmsContent?.drop} />
          </Suspense>
        } />
        <Route path="/vendor/:vendorId" element={
          <Suspense fallback={<LoadingFallback />}>
            {selectedVendor ? (
              <VendorProfileView 
                vendor={selectedVendor} 
                onProductSelect={handleProductSelect}
                onNavigate={handleNavigate}
                products={activeProducts}
                savedItems={savedItems}
                onToggleSave={handleToggleSave}
                onToggleFollow={handleToggleFollow}
                isFollowing={followedVendors.some(v => v.id === selectedVendor.id)}
                onMessageClick={openDirectMessaging}
              />
            ) : <Navigate to="/designers" replace />}
          </Suspense>
        } />
        <Route path="/product/:productId" element={
          <Suspense fallback={<LoadingFallback />}>
            {selectedProduct ? (
              <ProductDetail 
                product={selectedProduct}
                vendor={associatedVendor}
                onAddToCart={handleAddToCart} 
                onBack={() => handleNavigate('MARKETPLACE')}
                onViewDesigner={() => associatedVendor && handleDesignerSelect(associatedVendor.name)}
                featureFlags={featureFlags}
                savedItems={savedItems}
                onToggleSave={handleToggleSave}
                onMessageClick={openDirectMessaging}
                currentUser={currentUser}
                orders={orders}
              />
            ) : <Navigate to="/marketplace" replace />}
          </Suspense>
        } />
        <Route path="/vendor/dashboard" element={
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard 
              role={userRole} 
              featureFlags={featureFlags} 
              toggleFeatureFlag={toggleFeatureFlag}
              onNavigate={handleNavigate}
              vendors={vendors}
              setVendors={handleSetVendors}
              onAddVendor={handleAddVendor}
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              products={products}
              users={allUsers}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onProductSelect={handleProductSelect}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              cmsContent={cmsContent}
              onUpdateCMSContent={handleUpdateCMSContent}
              contactSubmissions={contactSubmissions}
              onUpdateContact={handleUpdateContact}
              followedVendors={followedVendors}
              onToggleFollow={handleToggleFollow}
              onDesignerClick={handleDesignerSelect}
              followers={allFollowers}
              onOpenDirectMessaging={openDirectMessaging}
              currentUser={currentUser}
            />
          </Suspense>
        } />
        <Route path="/admin" element={
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard 
              role={userRole} 
              featureFlags={featureFlags} 
              toggleFeatureFlag={toggleFeatureFlag}
              onNavigate={handleNavigate}
              vendors={vendors}
              setVendors={handleSetVendors}
              onAddVendor={handleAddVendor}
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              products={products}
              users={allUsers}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onProductSelect={handleProductSelect}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              cmsContent={cmsContent}
              onUpdateCMSContent={handleUpdateCMSContent}
              contactSubmissions={contactSubmissions}
              onUpdateContact={handleUpdateContact}
              followedVendors={followedVendors}
              onToggleFollow={handleToggleFollow}
              onDesignerClick={handleDesignerSelect}
              followers={allFollowers}
              onOpenDirectMessaging={openDirectMessaging}
            />
          </Suspense>
        } />
        <Route path="/dashboard" element={
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard 
              role={userRole} 
              featureFlags={featureFlags} 
              toggleFeatureFlag={toggleFeatureFlag}
              onNavigate={handleNavigate}
              vendors={vendors}
              setVendors={handleSetVendors}
              onAddVendor={handleAddVendor}
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              products={products}
              users={allUsers}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onProductSelect={handleProductSelect}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              cmsContent={cmsContent}
              onUpdateCMSContent={handleUpdateCMSContent}
              contactSubmissions={contactSubmissions}
              onUpdateContact={handleUpdateContact}
              followedVendors={followedVendors}
              onToggleFollow={handleToggleFollow}
              onDesignerClick={handleDesignerSelect}
              followers={allFollowers}
              onOpenDirectMessaging={openDirectMessaging}
            />
          </Suspense>
        } />
        <Route path="/auth" element={
          <Suspense fallback={<LoadingFallback />}>
            <AuthView 
              onNavigate={handleNavigate} 
              onLogin={handleLogin} 
              initialMode={authInitialMode}
              initialRole={authInitialRole}
              initialPlan={authInitialPlan}
              cmsContent={cmsContent}
            />
          </Suspense>
        } />
        <Route path="/profile" element={
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard 
              role={userRole} 
              featureFlags={featureFlags} 
              toggleFeatureFlag={toggleFeatureFlag}
              onNavigate={handleNavigate}
              initialTab="PROFILE"
              vendors={vendors}
              setVendors={handleSetVendors}
              onAddVendor={handleAddVendor}
              products={products}
              users={allUsers}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onProductSelect={handleProductSelect}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              cmsContent={cmsContent}
              onUpdateCMSContent={handleUpdateCMSContent}
              contactSubmissions={contactSubmissions}
              followedVendors={followedVendors}
              onToggleFollow={handleToggleFollow}
            />
          </Suspense>
        } />
        <Route path="/pricing" element={
          <Suspense fallback={<LoadingFallback />}>
            <PricingView onNavigate={handleNavigate} onRegister={(plan) => handleAuthNavigation('REGISTER', UserRole.BUYER, plan)} cmsContent={cmsContent} />
          </Suspense>
        } />
        <Route path="/about" element={
          <Suspense fallback={<LoadingFallback />}>
            <AboutView onNavigate={handleNavigate} cmsContent={cmsContent} />
          </Suspense>
        } />
        <Route path="/concierge" element={
          <Suspense fallback={<LoadingFallback />}>
            <AiConcierge products={activeProducts} />
          </Suspense>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* AI Concierge - Rendered globally but passed active products context. Hidden on AUTH view. Lazy loaded. */}
      {currentView !== 'AUTH' && (
        <Suspense fallback={null}>
          <AiConcierge products={activeProducts} />
        </Suspense>
      )}

      {/* Direct Messaging - Rendered globally */}
      {isLoggedIn && currentUser && (
        <Suspense fallback={null}>
          <DirectMessaging
            isOpen={isDirectMessagingOpen}
            onClose={() => setIsDirectMessagingOpen(false)}
            currentUser={currentUser}
            allUsers={allUsers}
            vendors={vendors}
            initialRecipientId={dmInitialRecipientId}
          />
        </Suspense>
      )}
    </Layout>
  );
};

export default App;
