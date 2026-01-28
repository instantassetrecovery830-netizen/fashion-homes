
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Search, User, Globe, Trash2, ArrowRight, LogOut, Settings, CheckCircle, Ruler, Loader } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { UserRole, ViewState, CartItem, Order } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  onUpdateCartItem: (index: number, updates: Partial<CartItem>) => void;
  onRemoveFromCart: (index: number) => void;
  onNavigate: (view: ViewState) => void;
  onRoleChange: (role: UserRole) => void;
  currentView: ViewState;
  isLoggedIn: boolean;
  onLogout: () => void;
  onPlaceOrder?: (order: Order) => Promise<void>;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  role, 
  cart,
  isCartOpen,
  setIsCartOpen,
  onUpdateCartItem,
  onRemoveFromCart,
  onNavigate,
  onRoleChange,
  currentView,
  isLoggedIn,
  onLogout,
  onPlaceOrder
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [measurementError, setMeasurementError] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handleDashboardClick = () => {
    if (role === UserRole.ADMIN) onNavigate('ADMIN_PANEL');
    else if (role === UserRole.VENDOR) onNavigate('VENDOR_DASHBOARD');
    else onNavigate('BUYER_DASHBOARD');
  };

  const handleCheckout = async () => {
    // Validate Pre-Orders
    const hasInvalidPreOrder = cart.some(item => 
      item.isPreOrder && (!item.measurements || item.measurements.length < 5)
    );

    if (hasInvalidPreOrder) {
      setMeasurementError(true);
      return;
    }
    setMeasurementError(false);
    setIsProcessingCheckout(true);

    if (!isLoggedIn) {
       // Force auth if not logged in
       setIsProcessingCheckout(false);
       onNavigate('AUTH');
       setIsCartOpen(false);
       return;
    }

    const newOrder: Order = {
        id: `ord_${Date.now()}`,
        customerName: 'Guest User', // Ideally from Auth
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        total: cartTotal,
        status: 'Processing',
        items: [...cart]
    };

    try {
        if (onPlaceOrder) {
            await onPlaceOrder(newOrder);
        }
        setOrderComplete(true);
        setTimeout(() => {
          setOrderComplete(false);
          setIsCartOpen(false);
          handleDashboardClick();
        }, 2000);
    } catch (e) {
        console.error("Checkout failed", e);
        alert("Checkout failed. Please try again.");
    } finally {
        setIsProcessingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-cream text-luxury-black font-sans selection:bg-luxury-gold selection:text-white transition-colors duration-500">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${
          isScrolled || mobileMenuOpen ? 'bg-white/95 backdrop-blur-md border-gray-100 py-3' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <div 
            className="text-2xl md:text-3xl font-serif font-bold tracking-widest cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => onNavigate('LANDING')}
          >
            MyFitStore
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 text-xs font-medium tracking-widest uppercase">
            {NAV_LINKS.map((link) => (
              <a 
                key={link.label} 
                onClick={() => onNavigate(link.view)}
                className={`hover:text-luxury-gold transition-colors cursor-pointer ${currentView === link.view ? 'text-luxury-gold border-b border-luxury-gold pb-0.5' : ''}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4 md:gap-6">
            <Search size={20} className="cursor-pointer hover:text-luxury-gold transition-colors hidden sm:block" />
            
            {/* User / Auth Menu */}
            <div className="relative group">
              {isLoggedIn ? (
                <>
                  <User 
                    size={20} 
                    className="cursor-pointer transition-colors text-luxury-black hover:text-luxury-gold"
                    onClick={() => onNavigate('PROFILE_SETTINGS')}
                  />
                  
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                    <div className="p-4 border-b border-gray-50">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Signed in as</p>
                      <p className="font-bold text-sm">{role}</p>
                    </div>
                    
                    <button
                      onClick={handleDashboardClick}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Settings size={14} /> Dashboard
                    </button>

                    <button
                      onClick={() => onNavigate('PROFILE_SETTINGS')}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <User size={14} /> Profile Settings
                    </button>
                    
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-500"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => onNavigate('AUTH')}
                  className="bg-black text-white px-5 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors whitespace-nowrap"
                >
                  Get Started
                </button>
              )}
            </div>

            <div 
              className="relative cursor-pointer hover:text-luxury-gold transition-colors" 
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-luxury-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-0 left-0 w-full h-full bg-white z-40 overflow-y-auto pt-24 pb-10 px-6 flex flex-col gap-6 animate-fade-in">
             {NAV_LINKS.map((link) => (
              <a 
                key={link.label} 
                onClick={() => { setMobileMenuOpen(false); onNavigate(link.view); }}
                className="text-2xl font-serif italic hover:text-luxury-gold transition-colors"
              >
                {link.label}
              </a>
            ))}
             <button 
                onClick={() => { setMobileMenuOpen(false); onNavigate('PRICING'); }}
                className="text-2xl font-serif italic hover:text-luxury-gold transition-colors text-left"
              >
                Membership & Pricing
              </button>
            <div className="border-t border-gray-100 pt-6 mt-2">
              <button 
                onClick={() => { setMobileMenuOpen(false); onNavigate('AUTH'); }}
                className="text-2xl font-serif italic hover:text-luxury-gold transition-colors"
              >
                Sign In / Register
              </button>
            </div>
            {/* Quick Role Switch for Mobile Dev - kept from previous implementation logic for convenience */}
            <div className="mt-4 border-t border-gray-100 pt-4">
               <p className="text-[10px] text-gray-300 uppercase px-2 mb-2">Dev: Quick Switch</p>
                <div className="flex gap-4">
                  {Object.values(UserRole).map((r) => (
                    <button
                      key={r}
                      onClick={() => { onRoleChange(r); setMobileMenuOpen(false); }}
                      className="text-xs text-gray-400 hover:text-black"
                    >
                      {r}
                    </button>
                  ))}
                </div>
            </div>
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      <div 
        className={`fixed inset-0 z-[60] transition-visibility duration-500 ${isCartOpen ? 'visible' : 'invisible'}`}
      >
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsCartOpen(false)}
        />
        <div 
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
             <h2 className="text-xl font-serif italic">Your Selection</h2>
             <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform duration-300">
               <X size={24} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {orderComplete ? (
              <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
                <CheckCircle size={64} className="text-green-500 mb-6" />
                <h3 className="text-2xl font-serif italic mb-2">Order Confirmed</h3>
                <p className="text-gray-500 text-sm max-w-xs">Your pieces are being prepared by the atelier. You will receive a confirmation shortly.</p>
              </div>
            ) : cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingBag size={48} className="mb-4 opacity-20" />
                <p className="text-sm uppercase tracking-widest">Your bag is empty</p>
                <button 
                  onClick={() => { setIsCartOpen(false); onNavigate('MARKETPLACE'); }}
                  className="mt-6 text-xs underline hover:text-black"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="animate-fade-in">
                  <div className="flex gap-4 mb-4">
                    <div className="w-24 h-32 bg-gray-100 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-1">{item.designer}</h3>
                        <p className="font-serif italic text-sm text-gray-600 leading-tight">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-2">Size: {item.size}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-medium">${item.price}</span>
                        <button 
                          onClick={() => onRemoveFromCart(index)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pre-Order Custom Fit Section */}
                  {item.isPreOrder && (
                    <div className={`p-4 bg-gray-50 border ${measurementError && (!item.measurements || item.measurements.length < 5) ? 'border-red-300 bg-red-50' : 'border-gray-100'} rounded-sm`}>
                      <div className="flex items-center gap-2 mb-2 text-luxury-gold">
                        <Ruler size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Pre-Order: Custom Fit</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">This piece is made-to-order. Please provide your measurements (Bust, Waist, Hips, Height).</p>
                      <textarea
                        value={item.measurements || ''}
                        onChange={(e) => onUpdateCartItem(index, { measurements: e.target.value })}
                        placeholder="e.g. Bust: 85cm, Waist: 64cm, Hips: 92cm, Height: 175cm"
                        className="w-full text-xs p-3 border border-gray-200 outline-none focus:border-black bg-white resize-none font-sans"
                        rows={3}
                      />
                      {measurementError && (!item.measurements || item.measurements.length < 5) && (
                        <p className="text-[10px] text-red-500 mt-1">* Measurements required for checkout</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && !orderComplete && (
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center mb-6 text-sm">
                <span className="uppercase tracking-widest text-gray-500">Subtotal</span>
                <span className="font-bold text-lg">${cartTotal}</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={isProcessingCheckout}
                className="w-full bg-luxury-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {isProcessingCheckout ? (
                    <>Processing <Loader className="animate-spin" size={14} /></>
                ) : (
                    <>Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="pt-20 min-h-screen">
        {children}
      </main>

      <footer className="bg-luxury-black text-luxury-cream py-20 px-6 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-serif font-bold tracking-widest mb-6">MyFitStore</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Redefining luxury digital commerce through curation, technology, and sustainable innovation.
            </p>
          </div>
          <div>
            <h4 className="uppercase text-xs font-bold tracking-widest mb-6 text-white">Client Services</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>FAQ</li>
              <li>Shipping & Returns</li>
              <li>Size Guide</li>
              <li>Track Order</li>
            </ul>
          </div>
          <div>
            <h4 className="uppercase text-xs font-bold tracking-widest mb-6 text-white">The Company</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="cursor-pointer hover:text-luxury-gold transition-colors" onClick={() => onNavigate('ABOUT')}>About Us</li>
              <li>Careers</li>
              <li className="cursor-pointer hover:text-luxury-gold transition-colors" onClick={() => onNavigate('PRICING')}>Membership & Pricing</li>
              <li>Sustainability</li>
            </ul>
          </div>
          <div>
            <h4 className="uppercase text-xs font-bold tracking-widest mb-6 text-white">Newsletter</h4>
            <div className="flex border-b border-gray-600 pb-2">
              <input type="email" placeholder="EMAIL ADDRESS" className="bg-transparent w-full outline-none text-white placeholder-gray-600 text-sm" />
              <button className="text-xs uppercase hover:text-luxury-gold">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-900 flex justify-between items-center text-xs text-gray-600">
          <div>© 2024 MyFitStore. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-4">
             <Globe size={14} /> <span>US / USD</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
