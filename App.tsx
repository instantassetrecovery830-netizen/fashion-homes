
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout.tsx';
import { LandingView } from './components/LandingView.tsx';
import { MarketplaceView } from './components/MarketplaceView.tsx';
import { NewArrivalsView } from './components/NewArrivalsView.tsx';
import { NewArrivalsManageView } from './components/NewArrivalsManageView.tsx';
import { DesignersView } from './components/DesignersView.tsx';
import { VendorProfileView } from './components/VendorProfileView.tsx';
import { ProductDetail } from './components/ProductDetail.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { AuthView } from './components/AuthView.tsx';
import { PricingView } from './components/PricingView.tsx';
import { AboutView } from './components/AboutView.tsx';
import { AiConcierge } from './components/AiConcierge.tsx';
import { FeatureFlags, Product, UserRole, ViewState, Vendor, CartItem, Order, User, LandingPageContent, ContactSubmission } from './types.ts';
import { 
  seedDatabase, fetchVendors, fetchProducts, fetchOrders, fetchUsers, fetchLandingContent, fetchContactSubmissions,
  addProductToDb, updateProductInDb, deleteProductFromDb,
  updateVendorInDb, createOrderInDb, updateOrderStatusInDb, updateUserInDb, updateLandingContentInDb,
  fetchUserFollowedVendors, addFollowerToDb, removeFollowerFromDb, fetchVendorFollowers, fetchVendorFollowerCount
} from './services/dataService.ts';
import { searchProductsByImage } from './services/geminiService.ts';
import { Loader } from 'lucide-react';
import { auth, onAuthStateChanged, signOut } from './services/firebase.ts';

const App: React.FC = () => {
  // State
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.BUYER);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedVendorFollowerCount, setSelectedVendorFollowerCount] = useState<number>(0);
  const [selectedDesignerFilter, setSelectedDesignerFilter] = useState<string | null>(null);
  
  // Auth Navigation State
  const [authInitialMode, setAuthInitialMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>(UserRole.BUYER);
  const [authInitialPlan, setAuthInitialPlan] = useState<'Atelier' | 'Maison' | 'Couture' | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<User | Vendor | null>(null);

  // Data State
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [cmsContent, setCmsContent] = useState<LandingPageContent | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Visual Search State
  const [visualSearchResults, setVisualSearchResults] = useState<Product[] | null>(null);

  // Saved Items State (Wardrobe)
  const [savedItems, setSavedItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem('myfitstore_saved');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSavedOpen, setIsSavedOpen] = useState(false);

  // Followed Vendors State
  const [followedVendors, setFollowedVendors] = useState<Vendor[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('myfitstore_saved', JSON.stringify(savedItems));
  }, [savedItems]);

  // Fetch followed vendors and followers when currentUser changes
  useEffect(() => {
    const loadSocialData = async () => {
      if (currentUser) {
        // Load who the user follows
        const followed = await fetchUserFollowedVendors(currentUser.id);
        setFollowedVendors(followed);

        // If user is a Vendor, load their followers
        if (userRole === UserRole.VENDOR) {
            const vendorFollowers = await fetchVendorFollowers(currentUser.id);
            setFollowers(vendorFollowers);
        } else {
            setFollowers([]);
        }
      } else {
        setFollowedVendors([]);
        setFollowers([]);
      }
    };
    loadSocialData();
  }, [currentUser, userRole]);

  // Handle Shared Outfits via URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outfitIds = params.get('outfit');
    
    if (outfitIds && products.length > 0) {
      const ids = outfitIds.split(',');
      const sharedProducts = products.filter(p => ids.includes(p.id));
      
      if (sharedProducts.length > 0) {
        setSavedItems(prev => {
          // Merge shared items with existing, avoiding duplicates
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = sharedProducts.filter(p => !existingIds.has(p.id));
          return [...prev, ...newItems];
        });
        setIsSavedOpen(true);
        
        // Clean URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [products]);

  const handleToggleSave = (product: Product) => {
    setSavedItems(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleToggleFollow = async (vendor: Vendor) => {
      if (!currentUser) return;

      const isFollowing = followedVendors.some(v => v.id === vendor.id);
      
      // Optimistic Update
      setFollowedVendors(prev => {
          if (isFollowing) {
              return prev.filter(v => v.id !== vendor.id);
          }
          return [...prev, vendor];
      });

      // Update count if viewing the vendor
      if (selectedVendor && selectedVendor.id === vendor.id) {
          setSelectedVendorFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
      }

      if (isFollowing) {
          await removeFollowerFromDb(currentUser.id, vendor.id);
      } else {
          // Add follower
          const newFollower = {
              id: crypto.randomUUID(),
              name: currentUser.name,
              avatar: currentUser.avatar,
              location: currentUser.location || 'Unknown',
              joined: new Date().toISOString(),
              purchases: 0, // Default
              style: 'Eclectic', // Default or fetch from profile
              vendorId: vendor.id,
              followerId: currentUser.id
          };
          await addFollowerToDb(newFollower);
      }
  };

  // Initialize DB and Fetch Data
  const refreshData = async () => {
    try {
      const [dbVendors, dbProducts, dbOrders, dbUsers, dbContent, dbContacts] = await Promise.all([
        fetchVendors(), 
        fetchProducts(),
        fetchOrders(),
        fetchUsers(),
        fetchLandingContent(),
        fetchContactSubmissions()
      ]);
      setVendors(dbVendors);
      setProducts(dbProducts);
      setOrders(dbOrders);
      setAllUsers(dbUsers);
      setCmsContent(dbContent);
      setContactSubmissions(dbContacts);
    } catch (error) {
      console.error("Failed to refresh data", error);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        await seedDatabase();
        await refreshData();
      } catch (error) {
        console.error("Database initialization failed.", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    initData();
  }, []);

  // Listen for Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.emailVerified) {
          setIsLoggedIn(true);
          // Determine Role
          const adminEmails = ['instantassetrecovery830@gmail.com', 'juliemtrice7@proton.me'];
          if (adminEmails.includes(user.email?.toLowerCase() || '')) {
              setUserRole(UserRole.ADMIN);
              // For admin, we can create a dummy user object or fetch if exists
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
              const currentUsers = await fetchUsers();
              const dbUser = currentUsers.find(u => u.email.toLowerCase() === user.email?.toLowerCase());

              if (dbUser && dbUser.role) {
                  setUserRole(dbUser.role);
                  setCurrentUser(dbUser);
              } else {
                  // Fallback to Vendor check
                  const currentVendors = await fetchVendors();
                  const matchingVendor = currentVendors.find(v => v.email?.toLowerCase() === user.email?.toLowerCase());
                  
                  if (matchingVendor) {
                      setUserRole(UserRole.VENDOR);
                      setCurrentUser(matchingVendor);
                  } else {
                      setUserRole(UserRole.BUYER);
                      // If user not found in DB but logged in (e.g. just registered), create a temporary user object
                      // In a real app, registration flow would create the user record first.
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
        } else {
          // User exists but is not verified
          setIsLoggedIn(false);
          setUserRole(UserRole.BUYER);
          setCurrentUser(null);
          setCurrentView('AUTH');
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(UserRole.BUYER);
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Derived State: Active Products (only from active vendors)
  const activeProducts = products.filter(product => {
      const vendor = vendors.find(v => v.name === product.designer);
      return vendor ? vendor.subscriptionStatus === 'ACTIVE' : true; 
  });

  // Helper to check if a product is effectively a "New Arrival" (isNewSeason AND created within last 7 days)
  const isEffectiveNewArrival = (product: Product) => {
      if (!product.isNewSeason) return false;
      if (!product.createdAt) return false; // Assume not new if no date, or handle as needed
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(product.createdAt) > oneWeekAgo;
  };

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
        setAuthInitialPlan(undefined);
    }
    
    if (view !== 'MARKETPLACE') {
        setSelectedDesignerFilter(null);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsCartOpen(false);
  };

  const handleAuthNavigation = (mode: 'LOGIN' | 'REGISTER', role: UserRole, plan?: 'Atelier' | 'Maison' | 'Couture') => {
    setAuthInitialMode(mode);
    setAuthInitialRole(role);
    setAuthInitialPlan(plan);
    setCurrentView('AUTH');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsCartOpen(false);
  };

  const handleDesignerSelect = async (designerName: string) => {
    const vendor = vendors.find(v => v.name === designerName);
    if (vendor) {
      setSelectedVendor(vendor);
      const count = await fetchVendorFollowerCount(vendor.id);
      setSelectedVendorFollowerCount(count);
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
        <AuthView 
          onLogin={handleLogin} 
          onNavigate={handleNavigate} 
          cmsContent={cmsContent}
          initialMode={authInitialMode}
          initialRole={authInitialRole}
          initialPlan={authInitialPlan}
        />
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
          <LandingView 
            onNavigate={handleNavigate} 
            isLoggedIn={isLoggedIn} 
            userRole={userRole} 
            vendors={vendors}
            products={activeProducts.map(p => ({...p, isNewSeason: isEffectiveNewArrival(p)}))} // Override isNewSeason for display
            onDesignerClick={handleDesignerSelect}
            cmsContent={cmsContent}
            onAuthRequest={handleAuthNavigation}
          />
        );
      case 'MARKETPLACE':
        return (
          <MarketplaceView 
            onNavigate={handleNavigate} 
            onProductSelect={handleProductSelect} 
            initialDesigner={selectedDesignerFilter}
            products={(visualSearchResults || activeProducts).filter(p => !isEffectiveNewArrival(p))}
            vendors={vendors}
            customTitle={visualSearchResults ? "Visual Search Results" : null}
            onClearFilter={handleClearVisualSearch}
            savedItems={savedItems}
            onToggleSave={handleToggleSave}
          />
        );
      case 'NEW_ARRIVALS':
        return (
          <NewArrivalsView 
            onProductSelect={handleProductSelect} 
            products={activeProducts.filter(p => isEffectiveNewArrival(p))}
            savedItems={savedItems}
            onToggleSave={handleToggleSave}
            onNavigate={handleNavigate}
            userRole={userRole}
            isLoggedIn={isLoggedIn}
          />
        );
      case 'NEW_ARRIVALS_MANAGE':
        return (
          <NewArrivalsManageView 
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            userRole={userRole}
            onNavigate={handleNavigate}
          />
        );
      case 'DESIGNERS':
        return <DesignersView onSelectDesigner={handleDesignerSelect} vendors={vendors} />;
      case 'VENDOR_PROFILE':
        return selectedVendor ? (
          <VendorProfileView 
            vendor={selectedVendor} 
            onProductSelect={handleProductSelect}
            onNavigate={handleNavigate}
            products={activeProducts.filter(p => !isEffectiveNewArrival(p))}
            savedItems={savedItems}
            onToggleSave={handleToggleSave}
            onToggleFollow={handleToggleFollow}
            isFollowing={followedVendors.some(v => v.id === selectedVendor.id)}
            followerCount={selectedVendorFollowerCount}
          />
        ) : <DesignersView onSelectDesigner={handleDesignerSelect} vendors={vendors} />;
      case 'PRODUCT_DETAIL':
        const associatedVendor = vendors.find(v => v.name === selectedProduct?.designer);
        return selectedProduct ? (
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
                products={activeProducts.filter(p => !isEffectiveNewArrival(p))}
                vendors={vendors}
                savedItems={savedItems}
                onToggleSave={handleToggleSave}
            />
        );
      case 'VENDOR_DASHBOARD':
      case 'ADMIN_PANEL':
      case 'BUYER_DASHBOARD':
        return (
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
            followedVendors={followedVendors}
            onToggleFollow={handleToggleFollow}
            onDesignerClick={handleDesignerSelect}
            followers={followers}
          />
        );
      case 'PROFILE_SETTINGS':
        return (
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
            onDesignerClick={handleDesignerSelect}
            followers={followers}
          />
        );
      case 'PRICING':
        return <PricingView onNavigate={handleNavigate} onRegister={(plan) => handleAuthNavigation('REGISTER', UserRole.VENDOR, plan)} />;
      case 'ABOUT':
        return <AboutView onNavigate={handleNavigate} cmsContent={cmsContent} />;
      default:
        return <LandingView onNavigate={handleNavigate} isLoggedIn={isLoggedIn} userRole={userRole} vendors={vendors} products={activeProducts} onDesignerClick={handleDesignerSelect} cmsContent={cmsContent} onAuthRequest={handleAuthNavigation} />;
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-luxury-cream flex flex-col items-center justify-center animate-fade-in">
        <h1 className="text-3xl font-serif font-bold tracking-widest mb-6">MyFitStore</h1>
        <Loader className="animate-spin text-luxury-gold" size={24} />
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">Loading Archives...</p>
      </div>
    );
  }

  return (
    <Layout 
      role={userRole} 
      cart={cart}
      isCartOpen={isCartOpen}
      setIsCartOpen={setIsCartOpen}
      isSavedOpen={isSavedOpen}
      setIsSavedOpen={setIsSavedOpen}
      onUpdateCartItem={handleUpdateCartItem}
      onRemoveFromCart={handleRemoveFromCart}
      onNavigate={handleNavigate}
      onRoleChange={setUserRole}
      currentView={currentView}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
      onPlaceOrder={handlePlaceOrder}
      onVisualSearch={handleVisualSearch}
      onAuthRequest={handleAuthNavigation}
    >
      {renderView()}
      
      {/* AI Concierge - Rendered globally but passed active products context */}
      <AiConcierge products={activeProducts} />
    </Layout>
  );
};

export default App;
