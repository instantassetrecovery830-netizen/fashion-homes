import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Layout } from './components/Layout';
import { LandingView } from './components/LandingView';
import { MarketplaceView } from './components/MarketplaceView';
import { NewArrivalsView } from './components/NewArrivalsView';
import { DesignersView } from './components/DesignersView';
import { VendorProfileView } from './components/VendorProfileView';
import { ProductDetail } from './components/ProductDetail';
import { Dashboard } from './components/Dashboard';
import { AuthView } from './components/AuthView';
import { PricingView } from './components/PricingView';
import { FeatureFlags, Product, UserRole, ViewState, Vendor, CartItem, Order } from './types';
import { MOCK_VENDORS, MOCK_PRODUCTS, MOCK_ORDERS } from './constants';
import { 
  seedDatabase, fetchVendors, fetchProducts, fetchOrders,
  addProductToDb, updateProductInDb, deleteProductFromDb,
  updateVendorInDb, createOrderInDb, updateOrderStatusInDb
} from './services/dataService';
import { Loader } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.BUYER);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedDesignerFilter, setSelectedDesignerFilter] = useState<string | null>(null);
  
  // Data State
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Initialize DB and Fetch Data
  const refreshData = async () => {
    try {
      const [dbVendors, dbProducts, dbOrders] = await Promise.all([
        fetchVendors(), 
        fetchProducts(),
        fetchOrders()
      ]);
      setVendors(dbVendors);
      setProducts(dbProducts);
      setOrders(dbOrders);
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
        // Even if fail, we might show empty states rather than full mocks to enforce 'real' mode
      } finally {
        setIsLoadingData(false);
      }
    };
    initData();
  }, []);

  // Derived State: Active Products (only from active vendors)
  const activeProducts = products.filter(product => {
      const vendor = vendors.find(v => v.name === product.designer);
      return vendor ? vendor.subscriptionStatus === 'ACTIVE' : true; // Default to true if no vendor found
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
    if (view !== 'MARKETPLACE') {
        setSelectedDesignerFilter(null);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsCartOpen(false);
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
    setIsLoggedIn(true);
    if (role === UserRole.ADMIN) {
      handleNavigate('ADMIN_PANEL');
    } else if (role === UserRole.VENDOR) {
      handleNavigate('VENDOR_DASHBOARD');
    } else {
      handleNavigate('MARKETPLACE');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(UserRole.BUYER);
    handleNavigate('LANDING');
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
    // This receives the full array, but we need to find diffs or update individually.
    // For the Dashboard implementation, it usually passes the full list but implies a single update.
    // We will assume simpler single updates are better, but for compatibility with Dashboard signature:
    // We will just find the changed vendor and update it.
    
    // In a real app, the Dashboard would call updateVendor directly. 
    // Here we iterate and update (or better, modify Dashboard to call specific update)
    // For now, let's just assume the Dashboard modifies one vendor and calls this.
    // To be safe, we will just update all vendors in the passed array (not efficient but functional for demo-removal)
    // BETTER: Modify Dashboard to not require setVendors for single updates, but for now we iterate.
    
    for (const v of updatedVendors) {
       await updateVendorInDb(v);
    }
    await refreshData();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    await updateOrderStatusInDb(orderId, status);
    await refreshData();
  };
  
  const handlePlaceOrder = async (order: Order) => {
     await createOrderInDb(order);
     await refreshData();
     setCart([]); // Clear cart
  };

  const toggleFeatureFlag = (key: keyof FeatureFlags) => {
    setFeatureFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // View Routing
  const renderView = () => {
    if (currentView === 'AUTH') {
      return <AuthView onLogin={handleLogin} onNavigate={handleNavigate} />;
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
            onDesignerClick={handleDesignerSelect}
          />
        );
      case 'MARKETPLACE':
        return (
          <MarketplaceView 
            onNavigate={handleNavigate} 
            onProductSelect={handleProductSelect} 
            initialDesigner={selectedDesignerFilter}
            products={activeProducts}
            vendors={vendors}
          />
        );
      case 'NEW_ARRIVALS':
        return <NewArrivalsView onProductSelect={handleProductSelect} products={activeProducts} />;
      case 'DESIGNERS':
        return <DesignersView onSelectDesigner={handleDesignerSelect} vendors={vendors} />;
      case 'VENDOR_PROFILE':
        return selectedVendor ? (
          <VendorProfileView 
            vendor={selectedVendor} 
            onProductSelect={handleProductSelect}
            onNavigate={handleNavigate}
            products={activeProducts}
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
          />
        ) : (
            <MarketplaceView 
                onNavigate={handleNavigate} 
                onProductSelect={handleProductSelect} 
                products={activeProducts}
                vendors={vendors}
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
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onProductSelect={handleProductSelect}
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
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onProductSelect={handleProductSelect}
          />
        );
      case 'PRICING':
        return <PricingView onNavigate={handleNavigate} onLogin={() => handleLogin(UserRole.VENDOR)} />;
      default:
        return <LandingView onNavigate={handleNavigate} isLoggedIn={isLoggedIn} userRole={userRole} vendors={vendors} onDesignerClick={handleDesignerSelect} />;
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

  if (currentView === 'AUTH') {
    return renderView();
  }

  return (
    <Layout 
      role={userRole} 
      cart={cart}
      isCartOpen={isCartOpen}
      setIsCartOpen={setIsCartOpen}
      onUpdateCartItem={handleUpdateCartItem}
      onRemoveFromCart={handleRemoveFromCart}
      onNavigate={handleNavigate}
      onRoleChange={setUserRole}
      currentView={currentView}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
      onPlaceOrder={handlePlaceOrder}
    >
      {renderView()}
    </Layout>
  );
};

export default App;