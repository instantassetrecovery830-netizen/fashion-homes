import React, { useState } from 'react';
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

const App: React.FC = () => {
  // State
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.BUYER);
  // Track if user is "officially" logged in for UI purposes
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedDesignerFilter, setSelectedDesignerFilter] = useState<string | null>(null);
  
  // Data State
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

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
    // Reset filters when navigating away from Marketplace/Designers unless specified
    if (view !== 'MARKETPLACE') {
        setSelectedDesignerFilter(null);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsCartOpen(false);
  };

  const handleDesignerSelect = (designerName: string) => {
    // Try to find the full vendor object
    const vendor = vendors.find(v => v.name === designerName);
    if (vendor) {
      setSelectedVendor(vendor);
      handleNavigate('VENDOR_PROFILE');
    } else {
      // Fallback to simple filtering if no profile exists
      setSelectedDesignerFilter(designerName);
      handleNavigate('MARKETPLACE');
    }
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    // Redirect based on role
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
    setIsCartOpen(true); // Open cart when item added
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

  const handleAddProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const toggleFeatureFlag = (key: keyof FeatureFlags) => {
    setFeatureFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // View Routing
  const renderView = () => {
    if (currentView === 'AUTH') {
      return <AuthView onLogin={handleLogin} onNavigate={handleNavigate} />;
    }

    if (featureFlags.maintenanceMode && userRole !== UserRole.ADMIN) {
      return (
        <div className="h-screen flex items-center justify-center flex-col">
          <h1 className="text-4xl font-serif">LUMIERRE</h1>
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
            setVendors={setVendors}
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
            setVendors={setVendors}
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
    >
      {renderView()}
    </Layout>
  );
};

export default App;