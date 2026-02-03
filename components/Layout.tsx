
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, Search, User, Globe, Trash2, ArrowRight, LogOut, Settings, CheckCircle, Ruler, Loader, Camera, CreditCard, Calendar, Lock, ArrowLeft, Mail } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { NAV_LINKS } from '../constants.ts';
import { UserRole, ViewState, CartItem, Order } from '../types.ts';
import { authService } from '../services/auth.ts';

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
  onVisualSearch?: (file: File) => Promise<void>;
  onAuthRequest?: (mode: 'LOGIN' | 'REGISTER', role: UserRole) => void;
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
  onPlaceOrder,
  onVisualSearch,
  onAuthRequest
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [measurementError, setMeasurementError] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Checkout State
  const [checkoutStep, setCheckoutStep] = useState<'CART' | 'PAYMENT'>('CART');
  const [customerEmail, setCustomerEmail] = useState('');
  
  // --- PAYSTACK CONFIGURATION ---
  // Replace with your public key from Paystack Dashboard
  const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; 

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: customerEmail,
    amount: cartTotal * 100, // Paystack expects amount in kobo (or lowest currency unit)
    publicKey: PAYSTACK_PUBLIC_KEY,
  };

  // Initialize Paystack hook
  // @ts-ignore - Types might not resolve perfectly in all envs without install
  const initializePayment = usePaystackPayment(paystackConfig);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync email when auth state changes or cart opens
  useEffect(() => {
      if (authService.user?.email) {
          setCustomerEmail(authService.user.email);
      }
  }, [isCartOpen, isLoggedIn]);

  // Reset checkout step when cart closes
  useEffect(() => {
    if (!isCartOpen) {
        setTimeout(() => {
            setCheckoutStep('CART');
            setOrderComplete(false);
        }, 500);
    }
  }, [isCartOpen]);

  const handleDashboardClick = () => {
    if (role === UserRole.ADMIN) onNavigate('ADMIN_PANEL');
    else if (role === UserRole.VENDOR) onNavigate('VENDOR_DASHBOARD');
    else onNavigate('BUYER_DASHBOARD');
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onVisualSearch) {
      setIsSearching(true);
      try {
        await onVisualSearch(file);
      } finally {
        setIsSearching(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleProceedToPayment = () => {
    // Validate Pre-Orders
    const hasInvalidPreOrder = cart.some(item => 
      item.isPreOrder && (!item.measurements || item.measurements.length < 5)
    );

    if (hasInvalidPreOrder) {
      setMeasurementError(true);
      return;
    }
    setMeasurementError(false);

    if (!isLoggedIn) {
       onAuthRequest ? onAuthRequest('LOGIN', UserRole.BUYER) : onNavigate('AUTH');
       setIsCartOpen(false);
       return;
    }

    setCheckoutStep('PAYMENT');
  };

  // Called when Paystack success callback fires
  const onPaystackSuccess = async () => {
      setIsProcessingCheckout(true);
      try {
          if (onPlaceOrder) {
              const order: Order = {
                  id: `ord_${Date.now()}`,
                  customerName: authService.user?.displayName || customerEmail || 'Guest',
                  date: new Date().toISOString().split('T')[0],
                  total: cartTotal,
                  status: 'Processing',
                  items: [...cart]
              };
              await onPlaceOrder(order);
              setOrderComplete(true);
          }
      } catch (error) {
          console.error("Order processing failed", error);
          alert("Payment successful but order creation failed. Please contact support.");
      } finally {
          setIsProcessingCheckout(false);
      }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-luxury-gold selection:text-white">
      {/* Visual Search Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      {/* Navigation Bar */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          <div className="flex items-center gap-6">
            <button className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 
              onClick={() => onNavigate('LANDING')} 
              className={`text-2xl font-serif font-bold italic cursor-pointer ${currentView === 'LANDING' && !isScrolled ? 'text-white' : 'text-black'}`}
            >
              MyFitStore
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                onClick={() => onNavigate(link.view)}
                className={`text-xs font-bold uppercase tracking-widest hover:text-luxury-gold transition-colors ${currentView === 'LANDING' && !isScrolled ? 'text-white/80' : 'text-gray-500'}`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            {isSearching ? (
                <Loader className={`animate-spin ${currentView === 'LANDING' && !isScrolled ? 'text-white' : 'text-black'}`} size={20} />
            ) : (
                <button 
                  onClick={handleCameraClick}
                  className={`hover:scale-110 transition-transform ${currentView === 'LANDING' && !isScrolled ? 'text-white' : 'text-black'}`}
                  title="Visual Search"
                >
                  <Camera size={20} />
                </button>
            )}
            
            <button 
                onClick={isLoggedIn ? handleDashboardClick : () => onNavigate('AUTH')}
                className={`hover:scale-110 transition-transform ${currentView === 'LANDING' && !isScrolled ? 'text-white' : 'text-black'}`}
            >
                <User size={20} />
            </button>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`relative hover:scale-110 transition-transform ${currentView === 'LANDING' && !isScrolled ? 'text-white' : 'text-black'}`}
            >
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-luxury-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl font-serif italic">Menu</h2>
            <button onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col gap-8">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                onClick={() => {
                  onNavigate(link.view);
                  setMobileMenuOpen(false);
                }}
                className="text-2xl font-serif italic text-left"
              >
                {link.label}
              </button>
            ))}
            <div className="h-px bg-gray-100 my-4" />
            
            {isLoggedIn ? (
                <>
                    <button onClick={() => { handleDashboardClick(); setMobileMenuOpen(false); }} className="text-sm font-bold uppercase tracking-widest text-left block w-full mb-4">
                        My Dashboard
                    </button>
                    <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="text-sm font-bold uppercase tracking-widest text-left block w-full text-red-500">
                        Logout
                    </button>
                </>
            ) : (
                <button onClick={() => { onNavigate('AUTH'); setMobileMenuOpen(false); }} className="text-sm font-bold uppercase tracking-widest text-left">
                    Sign In / Register
                </button>
            )}
          </nav>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-slide-left flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <h2 className="text-xl font-serif italic">
                {orderComplete ? 'Order Confirmed' : (checkoutStep === 'PAYMENT' ? 'Checkout' : 'Shopping Bag')}
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {orderComplete ? (
                 <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle size={40} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-serif italic mb-2">Thank you!</h3>
                        <p className="text-gray-500">Your order is being processed by the atelier.</p>
                    </div>
                    <button 
                        onClick={() => { setIsCartOpen(false); setOrderComplete(false); setCheckoutStep('CART'); }}
                        className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest"
                    >
                        Continue Shopping
                    </button>
                 </div>
              ) : checkoutStep === 'PAYMENT' ? (
                 <div className="space-y-8">
                    <button onClick={() => setCheckoutStep('CART')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black">
                        <ArrowLeft size={14} /> Back to Bag
                    </button>
                    
                    <div className="bg-gray-50 p-6 rounded-sm border border-gray-100">
                        <h3 className="font-bold uppercase tracking-widest text-xs mb-4">Order Summary</h3>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Subtotal</span>
                            <span>${cartTotal}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="border-t border-gray-200 my-4 pt-4 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${cartTotal}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact Email</label>
                        <input 
                            type="email" 
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none"
                            placeholder="Enter your email"
                        />
                    </div>

                    <button
                        // @ts-ignore - Paystack hook return type inference
                        onClick={() => initializePayment(onPaystackSuccess, () => alert("Payment cancelled"))}
                        disabled={!customerEmail || isProcessingCheckout}
                        className="w-full bg-luxury-gold text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isProcessingCheckout ? <Loader className="animate-spin" size={16}/> : <><CreditCard size={16}/> Pay Now</>}
                    </button>
                    <p className="text-[10px] text-center text-gray-400">Secured by Paystack</p>
                 </div>
              ) : (
                <>
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <ShoppingBag size={48} strokeWidth={1} className="mb-4 opacity-50" />
                      <p className="text-sm">Your bag is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {cart.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="flex gap-4 animate-fade-in">
                          <img src={item.image} alt={item.name} className="w-20 h-24 object-cover bg-gray-50" />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-sm">{item.designer}</h3>
                              <button onClick={() => onRemoveFromCart(index)} className="text-gray-300 hover:text-red-500">
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">{item.name}</p>
                            <p className="text-xs text-gray-500 mb-2">Size: {item.size}</p>
                            
                            {item.isPreOrder && (
                                <div className="bg-luxury-gold/10 p-2 border border-luxury-gold/20 rounded-sm">
                                    <p className="text-[10px] text-luxury-gold font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                                        <Ruler size={10} /> Measurements Required
                                    </p>
                                    <textarea 
                                        placeholder="Bust, Waist, Hip, Height..."
                                        className={`w-full text-[10px] bg-transparent border-b ${measurementError && !item.measurements ? 'border-red-500' : 'border-luxury-gold/30'} focus:border-luxury-gold outline-none resize-none h-8`}
                                        value={item.measurements}
                                        onChange={(e) => onUpdateCartItem(index, { measurements: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="mt-2 text-sm font-medium">${item.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {cart.length > 0 && !orderComplete && checkoutStep === 'CART' && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                {measurementError && (
                    <p className="text-xs text-red-500 mb-4 text-center font-bold">Please provide measurements for Pre-Order items.</p>
                )}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold uppercase tracking-widest">Total</span>
                  <span className="text-xl font-serif italic">${cartTotal}</span>
                </div>
                <button 
                    onClick={handleProceedToPayment}
                    className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors flex justify-center items-center gap-2"
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`pt-0 min-h-screen ${currentView !== 'LANDING' ? 'bg-luxury-cream' : ''}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-luxury-black text-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-serif italic">MyFitStore</h3>
            <p className="text-gray-400 text-sm font-light leading-relaxed">
              Curating the future of African fashion through digital innovation and artisanal heritage.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-500">Explore</h4>
            <ul className="space-y-4 text-sm font-light">
              <li><button onClick={() => onNavigate('MARKETPLACE')} className="hover:text-luxury-gold transition-colors">Collection</button></li>
              <li><button onClick={() => onNavigate('DESIGNERS')} className="hover:text-luxury-gold transition-colors">Designers</button></li>
              <li><button onClick={() => onNavigate('ABOUT')} className="hover:text-luxury-gold transition-colors">The Maison</button></li>
              <li><button onClick={() => onNavigate('PRICING')} className="hover:text-luxury-gold transition-colors">Membership</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-500">Legal</h4>
            <ul className="space-y-4 text-sm font-light">
              <li><a href="#" className="hover:text-luxury-gold transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-luxury-gold transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-luxury-gold transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-luxury-gold transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-500">Newsletter</h4>
            <p className="text-gray-400 text-sm font-light mb-4">Join the vanguard. Receive exclusive drops and editorial content.</p>
            <div className="flex border-b border-gray-700 pb-2">
              <input type="email" placeholder="Email Address" className="bg-transparent w-full outline-none text-sm placeholder-gray-600" />
              <button className="text-xs font-bold uppercase hover:text-luxury-gold">Join</button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 gap-4">
          <p>© 2024 MyFitStore. All rights reserved.</p>
          <div className="flex items-center gap-6">
             <Globe size={14} />
             <span>Paris • Lagos • Tokyo</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
