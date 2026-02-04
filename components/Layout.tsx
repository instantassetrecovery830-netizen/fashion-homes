
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, Search, User, Globe, Trash2, ArrowRight, LogOut, Settings, CheckCircle, Ruler, Loader, Camera, CreditCard, Calendar, Lock, ArrowLeft, Mail, Home, Store, Bell, Info, AlertTriangle } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { NAV_LINKS } from '../constants.ts';
import { UserRole, ViewState, CartItem, Order, AppNotification } from '../types.ts';
import { auth } from '../services/firebase.ts';
import { fetchNotifications, markNotificationRead, createNotificationInDb } from '../services/dataService.ts';

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
  
  // Notification State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  
  // Track the latest notification ID to detect new ones
  const latestNotificationIdRef = useRef<string | null>(null);
  
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
      if (auth.currentUser?.email) {
          setCustomerEmail(auth.currentUser.email);
      }
  }, [auth.currentUser, isCartOpen]);

  // Reset checkout step when cart closes
  useEffect(() => {
    if (!isCartOpen) {
        setTimeout(() => setCheckoutStep('CART'), 500);
    }
  }, [isCartOpen]);

  // Click outside listener for notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- REAL-TIME NOTIFICATION LOGIC ---
  
  // 1. Fetch initial notifications & Poll
  const loadNotifications = async () => {
      // Use user ID if logged in, otherwise 'all'
      const userId = auth.currentUser?.uid;
      const data = await fetchNotifications(userId);
      
      if (data.length > 0) {
          const newest = data[0];
          // If we have a new notification that is different from the last one we saw
          if (latestNotificationIdRef.current && newest.id !== latestNotificationIdRef.current) {
              // It is a new activity! Pop it up.
              // Only pop up if it's reasonably recent (created in last 2 mins)
              const timeDiff = new Date().getTime() - new Date(newest.date).getTime();
              if (timeDiff < 120000) { 
                  setActiveToast(newest);
                  setTimeout(() => setActiveToast(null), 6000);
              }
          }
          // Update ref
          latestNotificationIdRef.current = newest.id;
      }

      setNotifications(data);
  };

  useEffect(() => {
      loadNotifications();
      // Poll every 10 seconds for updates to catch real-time events faster
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
  }, [auth.currentUser]); // Reload when user changes

  // 2. Simulate Active "Marketing" Events (Optional, separate from Order events)
  useEffect(() => {
      const randomNotificationInterval = setInterval(async () => {
          // Low chance for random marketing blasts
          if (Math.random() > 0.8) { 
              const newNotif: AppNotification = {
                  id: `promo_${Date.now()}`,
                  userId: 'all',
                  title: "Flash Sale Alert",
                  message: "20% off selected items for the next hour.",
                  read: false,
                  date: new Date().toISOString(),
                  type: 'PROMO'
              };
              
              await createNotificationInDb(newNotif);
              // Force reload immediately so the polling logic above picks it up and toasts it
              loadNotifications();
          }
      }, 45000); 

      return () => clearInterval(randomNotificationInterval);
  }, []);

  const handleNotificationClick = async (notif: AppNotification) => {
      if (!notif.read) {
          await markNotificationRead(notif.id);
          // Update local state
          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      }
      setActiveToast(null); // Dismiss toast if clicked
      if (notif.link) {
          onNavigate(notif.link as ViewState);
          setShowNotifications(false);
      }
  };

  const markAllRead = async () => {
      const unread = notifications.filter(n => !n.read);
      for (const n of unread) {
          await markNotificationRead(n.id);
      }
      setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

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
  const onPaystackSuccess = async (reference: any) => {
    setIsProcessingCheckout(true);

    const newOrder: Order = {
        id: `ord_${Date.now()}`,
        customerName: customerEmail || 'Guest User', 
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
        alert("Order creation failed. Please contact support.");
    } finally {
        setIsProcessingCheckout(false);
    }
  };

  const onPaystackClose = () => {
      console.log('Payment closed');
      setIsProcessingCheckout(false);
  };

  const handleFinalizeOrder = () => {
    if (!customerEmail) {
        alert("Please enter your email address for the receipt.");
        return;
    }
    setIsProcessingCheckout(true);
    // @ts-ignore
    initializePayment(onPaystackSuccess, onPaystackClose);
  };

  return (
    <div className="min-h-screen bg-luxury-cream text-luxury-black font-sans selection:bg-luxury-gold selection:text-white transition-colors duration-500 relative">
      
      {/* Toast Notification */}
      {activeToast && (
        <div 
            onClick={() => handleNotificationClick(activeToast)}
            className="fixed top-24 right-6 z-[60] bg-white border border-luxury-gold/30 shadow-2xl p-4 max-w-sm w-full animate-slide-up flex gap-4 items-start rounded-sm cursor-pointer hover:bg-gray-50 transition-colors"
        >
            <div className="w-8 h-8 rounded-full bg-luxury-black text-luxury-gold flex items-center justify-center shrink-0">
                <Bell size={14} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-luxury-black mb-1">New Notification</h4>
                    <button onClick={(e) => { e.stopPropagation(); setActiveToast(null); }} className="text-gray-400 hover:text-black">
                        <X size={14} />
                    </button>
                </div>
                <p className="text-sm font-serif italic text-luxury-black mb-1">{activeToast.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{activeToast.message}</p>
            </div>
        </div>
      )}

      {/* Navigation */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${
          isScrolled || mobileMenuOpen ? 'bg-white/95 backdrop-blur-md border-gray-100 py-3' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          {/* Mobile Menu Button (Hidden if Bottom Nav is preferred, but kept for secondary links) */}
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
            {/* Visual Search */}
            <div className="relative group hidden md:block">
                <button 
                    onClick={handleCameraClick}
                    className="hover:text-luxury-gold transition-colors relative"
                    title="Visual Search (Gemini)"
                >
                    {isSearching ? <Loader size={20} className="animate-spin text-luxury-gold" /> : <Camera size={20} />}
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
            </div>

            <Search size={20} className="cursor-pointer hover:text-luxury-gold transition-colors hidden sm:block" />
            
            {/* Notification Bell */}
            <div className="relative" ref={notifDropdownRef}>
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative hover:text-luxury-gold transition-colors"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {/* Dropdown */}
                {showNotifications && (
                    <div className="absolute right-0 top-full mt-4 w-80 bg-white border border-gray-100 shadow-xl rounded-sm z-50 animate-slide-up">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase tracking-widest">Notifications</h4>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-[10px] text-luxury-gold hover:underline">Mark all read</button>
                            )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <p className="text-xs">No updates yet.</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-luxury-cream/30' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-luxury-gold' : 'bg-gray-200'}`} />
                                            <div>
                                                <p className={`text-xs mb-1 ${!notif.read ? 'font-bold' : 'font-medium'}`}>{notif.title}</p>
                                                <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{notif.message}</p>
                                                <span className="text-[9px] text-gray-400 mt-2 block uppercase tracking-widest">
                                                    {new Date(notif.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* User / Auth Menu (Desktop) */}
            <div className="relative group hidden md:block">
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
                  onClick={() => onAuthRequest ? onAuthRequest('LOGIN', UserRole.BUYER) : onNavigate('AUTH')}
                  className="bg-black text-white px-5 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors whitespace-nowrap"
                >
                  Get Started
                </button>
              )}
            </div>

            <div 
              className="relative cursor-pointer hover:text-luxury-gold transition-colors hidden md:block" 
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

        {/* Mobile Menu Overlay (Secondary Links) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-0 left-0 w-full h-full bg-white z-40 overflow-y-auto pt-24 pb-10 px-6 flex flex-col gap-6 animate-fade-in md:hidden">
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
                onClick={() => { setMobileMenuOpen(false); onAuthRequest ? onAuthRequest('LOGIN', UserRole.BUYER) : onNavigate('AUTH'); }}
                className="text-2xl font-serif italic hover:text-luxury-gold transition-colors"
              >
                {isLoggedIn ? 'Account Settings' : 'Sign In / Register'}
              </button>
              {isLoggedIn && (
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                    className="text-xl font-serif italic text-red-500 hover:text-red-600 transition-colors mt-4 block"
                  >
                    Log Out
                  </button>
              )}
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
          {/* Drawer Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
             <div className="flex items-center gap-3">
                 {checkoutStep === 'PAYMENT' && !orderComplete && (
                     <button onClick={() => setCheckoutStep('CART')} className="hover:text-luxury-gold transition-colors">
                         <ArrowLeft size={20} />
                     </button>
                 )}
                 <h2 className="text-xl font-serif italic">{checkoutStep === 'PAYMENT' ? 'Secure Payment' : 'Your Selection'}</h2>
             </div>
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
            ) : checkoutStep === 'CART' ? (
              // CART VIEW
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
            ) : (
                // PAYMENT VIEW (Paystack)
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold uppercase text-gray-400">Total Amount</span>
                            <span className="font-bold text-lg">${cartTotal}</span>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-400">
                           <Lock size={12} /> <span className="uppercase tracking-wider">Secured by Paystack</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                            <div className="relative">
                                <input 
                                    type="email"
                                    placeholder="your@email.com"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    disabled={!!auth.currentUser?.email}
                                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent disabled:text-gray-500 disabled:bg-transparent"
                                />
                                <Mail size={16} className="absolute right-0 top-2 text-gray-400" />
                            </div>
                            <p className="text-[10px] text-gray-400">Receipt will be sent to this email.</p>
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 border border-blue-100 rounded-sm">
                        <p className="text-[10px] text-blue-800 leading-relaxed">
                            You will be redirected to Paystack to complete your secure payment. 
                            We accept Card, Bank Transfer, and USSD.
                        </p>
                    </div>
                </div>
            )}
          </div>

          {cart.length > 0 && !orderComplete && (
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              {checkoutStep === 'CART' ? (
                <>
                  <div className="flex justify-between items-center mb-6 text-sm">
                    <span className="uppercase tracking-widest text-gray-500">Subtotal</span>
                    <span className="font-bold text-lg">${cartTotal}</span>
                  </div>
                  <button 
                    onClick={handleProceedToPayment}
                    className="w-full bg-luxury-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2 group"
                  >
                    Proceed to Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleFinalizeOrder}
                  disabled={isProcessingCheckout}
                  className="w-full bg-luxury-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                   {isProcessingCheckout ? (
                       <>Processing <Loader className="animate-spin" size={14} /></>
                   ) : (
                       <>Pay with Paystack <Lock size={16} /></>
                   )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="pt-20 pb-24 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {!['PRODUCT_DETAIL', 'AUTH'].includes(currentView) && (
        <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 z-50 md:hidden flex justify-between items-center px-6 py-4 pb-safe">
          <button onClick={() => onNavigate('LANDING')} className={`flex flex-col items-center gap-1 ${currentView === 'LANDING' ? 'text-luxury-gold' : 'text-gray-400'}`}>
            <Home size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
          </button>
          
          <button onClick={() => onNavigate('MARKETPLACE')} className={`flex flex-col items-center gap-1 ${currentView === 'MARKETPLACE' ? 'text-luxury-gold' : 'text-gray-400'}`}>
            <Store size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Shop</span>
          </button>

          <div className="relative -top-5">
            <button 
              onClick={handleCameraClick}
              className="w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-luxury-gold transition-all"
            >
              {isSearching ? <Loader size={20} className="animate-spin" /> : <Camera size={24} />}
            </button>
          </div>

          <button onClick={() => setIsCartOpen(true)} className={`flex flex-col items-center gap-1 ${isCartOpen ? 'text-luxury-gold' : 'text-gray-400'}`}>
            <div className="relative">
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-luxury-gold text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Bag</span>
          </button>

          <button 
            onClick={() => {
              if (!isLoggedIn) {
                onAuthRequest ? onAuthRequest('LOGIN', UserRole.BUYER) : onNavigate('AUTH');
              } else {
                handleDashboardClick();
              }
            }} 
            className={`flex flex-col items-center gap-1 ${['VENDOR_DASHBOARD', 'BUYER_DASHBOARD', 'ADMIN_PANEL', 'PROFILE_SETTINGS'].includes(currentView) ? 'text-luxury-gold' : 'text-gray-400'}`}
          >
            <User size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">{isLoggedIn ? 'Profile' : 'Login'}</span>
          </button>
        </div>
      )}

      <footer className="bg-luxury-black text-luxury-cream py-20 px-6 mt-20 hidden md:block">
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
