
import React, { useState, useEffect, Suspense } from 'react';
import { Layout } from './Layout.tsx';
import { LandingView } from './LandingView.tsx';
import { Loader } from 'lucide-react';
import { FeatureFlags, Product, UserRole, ViewState, Vendor, CartItem, Order, User, LandingPageContent, ContactSubmission, AppNotification, Follower } from '../types.ts';
import { 
  seedDatabase, fetchVendors, fetchProducts, fetchOrders, fetchUsers, fetchLandingContent, fetchContactSubmissions,
  addProductToDb, updateProductInDb, deleteProductFromDb,
  updateVendorInDb, createOrderInDb, updateOrderStatusInDb, updateUserInDb, updateLandingContentInDb, createNotificationInDb, fetchNotifications,
  fetchUserFollowedVendors, addFollowerToDb, removeFollowerFromDb, updateContactStatusInDb
} from '../services/dataService.ts';
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

const LoadingFallback = () => (
  <div className="h-[50vh] flex items-center justify-center">
    <Loader className="animate-spin text-luxury-gold" size={24} />
  </div>
);

const App: React.FC = () => {
  // State
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.BUYER);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<Product[]>([]);
  const [followedVendors, setFollowedVendors] = useState<Vendor[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedDesignerFilter, setSelectedDesignerFilter] = useState<string | null>(null);
  
  // Auth Navigation State
  const [authInitialMode, setAuthInitialMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>(UserRole.BUYER);

  // Data State
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [cmsContent, setCmsContent] = useState<LandingPageContent | undefined>(undefined);
  // Removed blocking isLoadingData state

  // Visual Search State
  const [visualSearchResults, setVisualSearchResults] = useState<Product[] | null>(null);

  // Initialize DB and Fetch Data - Non-blocking
  const refreshData = async () => {
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

      // Fetch user-specific data (Notifications, Orders, Follows)
      const currentUserId = auth.currentUser?.uid;
      
      // Load heavy data in parallel
      const [dbOrders, dbUsers, dbContacts, dbNotifications] = await Promise.all([
        fetchOrders(),
        fetchUsers(),
        fetchContactSubmissions(),
        fetchNotifications(currentUserId)
      ]);

      setOrders(dbOrders);
      setAllUsers(dbUsers);
      setContactSubmissions(dbContacts);
      setNotifications(dbNotifications);

      if (currentUserId) {
          const follows = await fetchUserFollowedVendors(currentUserId);
          setFollowedVendors(follows);
      }

    } catch (error) {
      console.error("Failed to refresh data", error);
    }
  };

  useEffect(() => {
    // Initial Load
    const initData = async () => {
      try {
        await seedDatabase();
        await refreshData();
      } catch (error) {
        console.error("Database initialization failed.", error);
      }
    };
    initData();

    // Load saved items from local storage
    const saved = localStorage.getItem('myfitstore_saved');
    if (saved) {
      try {
        setSavedItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved items", e);
      }
    }

    // Real-time: Poll for general data updates every 30 seconds
    const pollInterval = setInterval(() => {
        refreshData();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  // Sync saved items to local storage
  useEffect(() => {
    localStorage.setItem('myfitstore_saved', JSON.stringify(savedItems));
  }, [savedItems]);

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
          // Refresh data immediately on login to get user notifications
          refreshData(); 
          
          // Determine Role
          const adminEmails = ['instantassetrecovery830@gmail.com', 'juliemtrice7@proton.me', 'mikelarry00764@proton.me'];
          if (adminEmails.includes(user.email?.toLowerCase() || '')) {
              setUserRole(UserRole.ADMIN);
          } else {
              // Check if user has an assigned role in the Users table
              // We might need to fetch users if not yet loaded in the background
              let currentUsers = allUsers;
              if (currentUsers.length === 0) {
                 currentUsers = await fetchUsers();
              }
              
              const dbUser = currentUsers.find(u => u.email.toLowerCase() === user.email?.toLowerCase());

              if (dbUser && dbUser.role) {
                  setUserRole(dbUser.role);
              } else {
                  // Fallback to Vendor check
                  let currentVendors = vendors;
                  if (currentVendors.length === 0) {
                      currentVendors = await fetchVendors();
                  }
                  const matchingVendor = currentVendors.find(v => v.email?.toLowerCase() === user.email?.toLowerCase());
                  
                  if (matchingVendor) {
                      setUserRole(UserRole.VENDOR);
                  } else {
                      setUserRole(UserRole.BUYER);
                  }
              }
          }
        } else {
          // User exists but is not verified
          setIsLoggedIn(false);
          setUserRole(UserRole.BUYER);
          setCurrentView('AUTH');
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(UserRole.BUYER);
        setNotifications([]); // Clear notifications on logout
        setFollowedVendors([]);
      }
    });

    return () => unsubscribe();
  }, [allUsers, vendors]); // Depend on data to ensure correct role assignment

  // Derived State: Active Products (only from active vendors who are verified)
  const activeProducts = products.filter(product => {
      const vendor = vendors.find(v => v.name === product.designer);
      return vendor ? (vendor.subscriptionStatus === 'ACTIVE' && vendor.verificationStatus === 'VERIFIED') : true; 
  });

  // Feature Flags Management
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    enableMarketplace: true,
    enableReviews: true,
    enableAiStyleMatch: true,
    maintenanceMode: false
  });

  // Handlers
  const handleNavigate = (view: ViewState) => {
    if (view === 'AUTH') {
        // Reset defaults if navigating generically
        setAuthInitialMode('LOGIN');
        setAuthInitialRole(UserRole.BUYER);
    }
    
    if (view !== 'MARKETPLACE') {
        setSelectedDesignerFilter(null);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'auto' });
    setIsCartOpen(false);
    setIsSavedOpen(false);
  };

  const handleAuthNavigation = (mode: 'LOGIN' | 'REGISTER', role: UserRole) => {
    setAuthInitialMode(mode);
    setAuthInitialRole(role);
    setCurrentView('AUTH');
    window.scrollTo({ top: 0, behavior: 'auto' });
    setIsCartOpen(false);
    setIsSavedOpen(false);
  };

  const handleDesignerSelect = (designerName: string) => {
    const vendor = vendors.find(v => v.name === designerName);
    if (vendor) {
      setSelectedVendor(vendor);
      handleNavigate('VENDOR_PROFILE');
    } else {
      setSelectedDesignerFilter(designerName);
      handleNavigate('MARKETPLACE');
    }
  };

  const handleLogin = (role: UserRole) => {
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
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleNavigate('LANDING');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    handleNavigate('PRODUCT_DETAIL');
  };

  const handleAddToCart = (product: Product, size: string, measurements?: string) => {
    const newItem: CartItem = {
      ...product,
      quantity: 1,
      size: size,
      measurements: measurements || ''
    };
    setCart([...cart, newItem]);
    setIsCartOpen(true);
  };

  const handleUpdateCartItem = (index: number, updates: Partial<CartItem>) => {
    const newCart = [...cart];
    newCart[index] = { ...newCart[index], ...updates };
    setCart(newCart);
  };

  const handleRemoveFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // Saved Items Handler
  const handleToggleSave = (product: Product) => {
    setSavedItems(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        setIsSavedOpen(true); // Open drawer when saving for better feedback
        return [...prev, product];
      }
    });
  };

  // Follow Vendor Handler
  const handleToggleFollow = async (vendor: Vendor) => {
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
  };

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
  
  const handleUpdateUser = async (user: User) => {
      await updateUserInDb(user);
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

  // View Routing
  const renderView = () => {
    if (currentView === 'AUTH') {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <AuthView 
            onLogin={handleLogin} 
            onNavigate={handleNavigate} 
            cmsContent={cmsContent}
            initialMode={authInitialMode}
            initialRole={authInitialRole}
          />
        </Suspense>
      );
    }

    if (featureFlags.maintenanceMode && userRole !== UserRole.ADMIN) {
      return (
        <div className="h-screen flex items-center justify-center flex-col">
          <h1 className="text-4xl font-serif">MyFitStore</h1>
          <p className="mt-4 uppercase tracking-widest text-sm">Under Maintenance</p>
        </div>
      );
    }

    switch (currentView) {
      case 'LANDING':
        return (
          // Landing View is NOT suspended to ensure instant load
          <LandingView 
            onNavigate={handleNavigate} 
            isLoggedIn={isLoggedIn} 
            userRole={userRole} 
            vendors={vendors}
            products={activeProducts}
            onDesignerClick={handleDesignerSelect}
            cmsContent={cmsContent}
            onAuthRequest={handleAuthNavigation}
          />
        );
      case 'MARKETPLACE':
        return (
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
        );
      case 'NEW_ARRIVALS':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <NewArrivalsView 
                onProductSelect={handleProductSelect} 
                products={activeProducts}
                savedItems={savedItems}
                onToggleSave={handleToggleSave}
            />
          </Suspense>
        );
      case 'NEW_ARRIVALS_MANAGE':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <NewArrivalsManageView 
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              userRole={userRole}
              onNavigate={handleNavigate}
            />
          </Suspense>
        );
      case 'DESIGNERS':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DesignersView onSelectDesigner={handleDesignerSelect} vendors={vendors} />
          </Suspense>
        );
      case 'THE_DROP':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <TheDropView products={products} onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'VENDOR_PROFILE':
        return (
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
              />
            ) : <DesignersView onSelectDesigner={handleDesignerSelect} vendors={vendors} />}
          </Suspense>
        );
      case 'PRODUCT_DETAIL':
        const associatedVendor = vendors.find(v => v.name === selectedProduct?.designer);
        return (
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
              />
            ) : (
                <MarketplaceView 
                    onNavigate={handleNavigate} 
                    onProductSelect={handleProductSelect} 
                    products={activeProducts}
                    vendors={vendors}
                    savedItems={savedItems}
                    onToggleSave={handleToggleSave}
                />
            )}
          </Suspense>
        );
      case 'VENDOR_DASHBOARD':
      case 'ADMIN_PANEL':
      case 'BUYER_DASHBOARD':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard 
              role={userRole} 
              featureFlags={featureFlags} 
              toggleFeatureFlag={toggleFeatureFlag}
              onNavigate={handleNavigate}
              vendors={vendors}
              setVendors={handleSetVendors}
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              products={products}
              users={allUsers}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onProductSelect={handleProductSelect}
              onUpdateUser={handleUpdateUser}
              cmsContent={cmsContent}
              onUpdateCMSContent={handleUpdateCMSContent}
              contactSubmissions={contactSubmissions}
              onUpdateContact={handleUpdateContact}
              followedVendors={followedVendors}
              onToggleFollow={handleToggleFollow}
              onDesignerClick={handleDesignerSelect}
            />
          </Suspense>
        );
      case 'PROFILE_SETTINGS':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard 
              role={userRole} 
              featureFlags={featureFlags} 
              toggleFeatureFlag={toggleFeatureFlag}
              onNavigate={handleNavigate}
              initialTab="PROFILE"
              vendors={vendors}
              setVendors={handleSetVendors}
              products={products}
              users={allUsers}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onProductSelect={handleProductSelect}
              onUpdateUser={handleUpdateUser}
              cmsContent={cmsContent}
              onUpdateCMSContent={handleUpdateCMSContent}
              contactSubmissions={contactSubmissions}
              followedVendors={followedVendors}
              onToggleFollow={handleToggleFollow}
            />
          </Suspense>
        );
      case 'PRICING':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <PricingView onNavigate={handleNavigate} onRegister={() => handleAuthNavigation('REGISTER', UserRole.VENDOR)} />
          </Suspense>
        );
      case 'ABOUT':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AboutView onNavigate={handleNavigate} cmsContent={cmsContent} />
          </Suspense>
        );
      default:
        return (
          <LandingView 
            onNavigate={handleNavigate} 
            isLoggedIn={isLoggedIn} 
            userRole={userRole} 
            vendors={vendors} 
            products={activeProducts} 
            onDesignerClick={handleDesignerSelect} 
            cmsContent={cmsContent} 
            onAuthRequest={handleAuthNavigation} 
          />
        );
    }
  };

  if (featureFlags.maintenanceMode && userRole !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen bg-luxury-cream flex flex-col items-center justify-center animate-fade-in">
        <h1 className="text-3xl font-serif font-bold tracking-widest mb-6">MyFitStore</h1>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">Under Maintenance</p>
      </div>
    );
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
    >
      {renderView()}
      
      {/* AI Concierge - Rendered globally but passed active products context. Hidden on AUTH view. Lazy loaded. */}
      {currentView !== 'AUTH' && (
        <Suspense fallback={null}>
          <AiConcierge products={activeProducts} />
        </Suspense>
      )}
    </Layout>
  );
};

export default App;
