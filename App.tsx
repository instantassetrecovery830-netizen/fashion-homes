import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Layout } from './components/Layout';
import { LandingView } from './components/LandingView';
import { MarketplaceView } from './components/MarketplaceView';
import { NewArrivalsView } from './components/NewArrivalsView';
import { DesignersView } from './components/DesignersView';
import { ProductDetail } from './components/ProductDetail';
import { Dashboard } from './components/Dashboard';
import { AuthView } from './components/AuthView';
import { FeatureFlags, Product, UserRole, ViewState } from './types';

const App: React.FC = () => {
  // State
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.BUYER);
  // Track if user is "officially" logged in for UI purposes
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDesignerFilter, setSelectedDesignerFilter] = useState<string | null>(null);
  
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
    setSelectedDesignerFilter(designerName);
    handleNavigate('MARKETPLACE');
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

  const handleAddToCart = (product: Product) => {
    setCart([...cart, product]);
    setIsCartOpen(true); // Open cart when item added
  };

  const handleRemoveFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
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
          <h1 className="text-4xl font-serif">LUMIERRE</h1>
          <p className="mt-4 uppercase tracking-widest text-sm">Under Maintenance</p>
        </div>
      );
    }

    switch (currentView) {
      case 'LANDING':
        return <LandingView onNavigate={handleNavigate} />;
      case 'MARKETPLACE':
        return <MarketplaceView onNavigate={handleNavigate} onProductSelect={handleProductSelect} initialDesigner={selectedDesignerFilter} />;
      case 'NEW_ARRIVALS':
        return <NewArrivalsView onProductSelect={handleProductSelect} />;
      case 'DESIGNERS':
        return <DesignersView onSelectDesigner={handleDesignerSelect} />;
      case 'PRODUCT_DETAIL':
        return selectedProduct ? (
          <ProductDetail 
            product={selectedProduct} 
            onAddToCart={handleAddToCart} 
            onBack={() => handleNavigate('MARKETPLACE')}
            featureFlags={featureFlags}
          />
        ) : <MarketplaceView onNavigate={handleNavigate} onProductSelect={handleProductSelect} />;
      case 'VENDOR_DASHBOARD':
      case 'ADMIN_PANEL':
      case 'BUYER_DASHBOARD':
        return (
          <Dashboard 
            role={userRole} 
            featureFlags={featureFlags} 
            toggleFeatureFlag={toggleFeatureFlag}
            onNavigate={handleNavigate}
          />
        );
      default:
        return <LandingView onNavigate={handleNavigate} />;
    }
  };

  // If we are in AUTH view, we might not want the main layout (nav/footer) interfering, 
  // or we want a minimal layout. The AuthView component handles its own layout, 
  // so we can render it directly.
  if (currentView === 'AUTH') {
    return renderView();
  }

  return (
    <Layout 
      role={userRole} 
      cart={cart}
      isCartOpen={isCartOpen}
      setIsCartOpen={setIsCartOpen}
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