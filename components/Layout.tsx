
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, Search, User, Globe, Trash2, ArrowRight, LogOut, Settings, CheckCircle, Ruler, Loader, Camera, CreditCard, Calendar, Lock, ArrowLeft, Mail, Home, Store, Bell, Info, AlertTriangle, ChevronRight, Instagram, Twitter, Facebook } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { NAV_LINKS } from '../constants.ts';
import { UserRole, ViewState, CartItem, Order, AppNotification } from '../types.ts';
import { auth } from '../services/firebase.ts';
import { markNotificationRead } from '../services/dataService.ts';

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
  notifications?: AppNotification[];
  onRefreshNotifications?: () => void;
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
  onAuthRequest,
  notifications = [],
  onRefreshNotifications
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [measurementError, setMeasurementError] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  
  // Track the latest notification ID to detect new ones
  const latestNotificationIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  
  // Checkout State
  const [checkoutStep, setCheckoutStep] = useState<'CART' | 'PAYMENT'>('CART');
  const [customerEmail, setCustomerEmail] = useState('');
  
  // --- PAYSTACK CONFIGURATION ---
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

  // --- NOTIFICATION TOAST LOGIC ---
  useEffect(() => {
      if (notifications.length > 0) {
          const newest = notifications[0];
          
          // Determine if we should show toast
          const isNew = newest.id !== latestNotificationIdRef.current;
          const isRelevant = !newest.read; // Only show unread as toasts
          const isRecent = (new Date().getTime() - new Date(newest.date).getTime()) < 60000; // Created in last minute

          // Handle first load vs updates
          if (isNew) {
              if (initializedRef.current && isRelevant && isRecent) {
                  setActiveToast(newest);
                  setTimeout(() => setActiveToast(null), 6000);
              }
              // Update ref
              latestNotificationIdRef.current = newest.id;
          }
          initializedRef.current = true;
      }
  }, [notifications]);

  const handleNotificationClick = async (notif: AppNotification) => {
      if (!notif.read) {
          await markNotificationRead(notif.id);
          if (onRefreshNotifications) onRefreshNotifications();
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
      if (onRefreshNotifications) onRefreshNotifications();
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
          
          {/* Custom Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center gap-3 group focus:outline-none" 
            onClick={() => setMobileMenuOpen(true)}
          >
            <div className="flex flex-col gap-1.5 w-6">
                <span className="h-0.5 bg-black w-full transform origin-left group-hover:scale-x-75 transition-transform duration-300"></span>
                <span className="h-0.5 bg-black w-3/4 transform origin-left group-hover:scale-x-100 transition-transform duration-300"></span>
            </div>
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

        {/* Mobile Full Screen Menu - Redesigned */}
        <div 
            className={`fixed inset-0 z-[100] bg-white transition-all duration-500 ease-in-out md:hidden ${
                mobileMenuOpen 
                ? 'opacity-100 translate-y-0 visible' 
                : 'opacity-0 -translate-y-full invisible pointer-events-none'
            }`}
        >
            {/* Close Button */}
            <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-2 hover:rotate-90 transition-transform duration-300 z-50 text-black hover:text-luxury-gold"
            >
                <X size={32} strokeWidth={1} />
            </button>

            {/* Menu Content */}
            <div className="h-full flex flex-col justify-center px-8 relative overflow-hidden">
                {/* Decorative Background Text */}
                <div className="absolute -right-20 top-1/4 text-9xl font-serif italic text-gray-50 opacity-50 pointer-events-none rotate-90 whitespace-nowrap">
                    MyFitStore
                </div>

                <nav className="flex flex-col gap-6 relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Explore</p>
                    {NAV_LINKS.map((link, idx) => (
                        <button
                            key={link.label}
                            onClick={() => { setMobileMenuOpen(false); onNavigate(link.view); }}
                            className="text-4xl sm:text-5xl font-serif italic text-left text-black hover:text-luxury-gold hover:pl-4 transition-all duration-300 relative group flex items-center gap-4"
                            style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                            {link.label}
                            <ArrowRight size={24} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-luxury-gold" strokeWidth={1} />
                        </button>
                    ))}
                    
                    <button
                        onClick={() => { setMobileMenuOpen(false); onNavigate('PRICING'); }}
                        className="text-4xl sm:text-5xl font-serif italic text-left text-black hover:text-luxury-gold hover:pl-4 transition-all duration-300 relative group"
                    >
                        Membership
                    </button>
                </nav>

                <div className="mt-12 pt-8 border-t border-gray-100 relative z-10">
                    {isLoggedIn ? (
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => { setMobileMenuOpen(false); handleDashboardClick(); }} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-luxury-gold transition-colors">
                                <Settings size={16} /> Dashboard
                            </button>
                            <button onClick={() => { setMobileMenuOpen(false); onNavigate('PROFILE_SETTINGS'); }} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-luxury-gold transition-colors">
                                <User size={16} /> Profile
                            </button>
                            <button onClick={() => { setMobileMenuOpen(false); onLogout(); }} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors col-span-2 mt-4">
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <button 
                                onClick={() => { setMobileMenuOpen(false); onAuthRequest ? onAuthRequest('LOGIN', UserRole.BUYER) : onNavigate('AUTH'); }} 
                                className="flex-1 py-4 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                            >
                                Sign In
                            </button>
                            <button 
                                onClick={() => { setMobileMenuOpen(false); onAuthRequest ? onAuthRequest('REGISTER', UserRole.BUYER) : onNavigate('AUTH'); }} 
                                className="flex-1 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors"
                            >
                                Join
                            </button>
                        </div>
                    )}
                </div>

                {/* Social Footer */}
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                    <div className="flex gap-6">
                        <Instagram size={20} className="text-gray-400 hover:text-black cursor-pointer transition-colors" />
                        <Twitter size={20} className="text-gray-400 hover:text-black cursor-pointer transition-colors" />
                        <Facebook size={20} className="text-gray-400 hover:text-black cursor-pointer transition-colors" />
                    </div>
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">© 2024</p>
                </div>
            </div>
        </div>
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
        <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 z-50 md:hidden flex justify-around items-end px-2 pt-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <button onClick={() => onNavigate('LANDING')} className={`flex flex-col items-center gap-1 p-2 ${currentView === 'LANDING' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}>
            <Home size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
          </button>
          
          <button onClick={() => onNavigate('MARKETPLACE')} className={`flex flex-col items-center gap-1 p-2 ${currentView === 'MARKETPLACE' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}>
            <Store size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Shop</span>
          </button>

          <div className="relative -top-6">
            <button 
              onClick={handleCameraClick}
              className="w-14 h-14 bg-black text-white rounded-full shadow-xl flex items-center justify-center hover:bg-luxury-gold transition-all transform hover:scale-105"
            >
              {isSearching ? <Loader size={20} className="animate-spin" /> : <Camera size={24} />}
            </button>
          </div>

          <button onClick={() => setIsCartOpen(true)} className={`flex flex-col items-center gap-1 p-2 ${isCartOpen ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}>
            <div className="relative">
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-luxury-gold text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full border border-white">
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
            className={`flex flex-col items-center gap-1 p-2 ${['VENDOR_DASHBOARD', 'BUYER_DASHBOARD', 'ADMIN_PANEL', 'PROFILE_SETTINGS'].includes(currentView) ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
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
