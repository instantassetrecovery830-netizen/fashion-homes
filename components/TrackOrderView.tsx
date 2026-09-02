import React, { useState, useEffect } from 'react';
import { 
  Truck, Package, Search, MapPin, CheckCircle2, Clock, 
  ArrowLeft, Copy, Check, RefreshCw, AlertCircle, ExternalLink, 
  ShieldCheck, ArrowRight, FileText, PhoneCall
} from 'lucide-react';
import { Order, ViewState } from '../types.ts';
import { useCurrency } from '../context/CurrencyContext.tsx';

interface TrackOrderViewProps {
  initialTrackingQuery?: string;
  orders?: Order[];
  onNavigate: (view: ViewState) => void;
  onSelectOrderForSupport?: (orderId: string) => void;
}

interface TrackingResult {
  success: boolean;
  source: string;
  carrier: string;
  trackingNumber: string;
  status: string; // DELIVERED | OUT_FOR_DELIVERY | TRANSIT | PROCESSING | FAILURE
  statusDetails: string;
  statusDate: string;
  eta: string;
  serviceLevel: string;
  origin: string;
  destination: string;
  history: Array<{
    status: string;
    details: string;
    location: string;
    timestamp: string;
  }>;
}

export const TrackOrderView: React.FC<TrackOrderViewProps> = ({
  initialTrackingQuery = '',
  orders = [],
  onNavigate,
  onSelectOrderForSupport
}) => {
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState(initialTrackingQuery);
  const [selectedCarrier, setSelectedCarrier] = useState('usps');
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-search if initial query passed
  useEffect(() => {
    if (initialTrackingQuery) {
      handleTrack(initialTrackingQuery);
    } else if (orders.length > 0) {
      // Default to most recent order if available
      const latest = orders[0];
      setSearchQuery(latest.id);
      handleTrack(latest.id, latest);
    }
  }, [initialTrackingQuery]);

  const handleTrack = async (queryToUse?: string, directOrderObj?: Order) => {
    const query = (queryToUse || searchQuery).trim();
    if (!query) return;

    setIsLoading(true);
    setErrorMsg(null);
    setTrackingData(null);
    setMatchedOrder(null);

    // 1. Check if query matches a known Order ID or Order's tracking number in Firestore/local state
    let targetOrder: Order | undefined = directOrderObj;
    if (!targetOrder) {
      targetOrder = orders.find(
        o => o.id.toLowerCase() === query.toLowerCase() || 
             (o.trackingNumber && o.trackingNumber.toLowerCase() === query.toLowerCase())
      );
    }

    if (targetOrder) {
      setMatchedOrder(targetOrder);
    }

    const trackingNumToSearch = targetOrder?.trackingNumber || query;
    const carrierToUse = targetOrder?.carrier || selectedCarrier;

    try {
      const response = await fetch(`/api/track-order?trackingNumber=${encodeURIComponent(trackingNumToSearch)}&carrier=${encodeURIComponent(carrierToUse)}`);
      if (!response.ok) {
        throw new Error("Unable to locate tracking details for this number.");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setTrackingData(data);
    } catch (err: any) {
      console.warn("Tracking API error:", err);
      setErrorMsg(err.message || "Unable to track package. Please check the tracking number and carrier.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTracking = () => {
    if (!trackingData) return;
    navigator.clipboard.writeText(trackingData.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine active milestone step (0: Order Placed, 1: Processing, 2: In Transit, 3: Out for Delivery, 4: Delivered)
  const getMilestoneIndex = (status?: string, orderStatus?: string) => {
    const s = (status || '').toUpperCase();
    const os = (orderStatus || '').toUpperCase();

    if (s === 'DELIVERED' || os === 'DELIVERED') return 4;
    if (s === 'OUT_FOR_DELIVERY' || s === 'OUT FOR DELIVERY') return 3;
    if (s === 'TRANSIT' || s === 'IN_TRANSIT' || os === 'SHIPPED') return 2;
    if (os === 'PROCESSING') return 1;
    return 1;
  };

  const milestoneStep = getMilestoneIndex(trackingData?.status, matchedOrder?.status);

  const steps = [
    { label: 'Order Confirmed', description: 'Atelier received order' },
    { label: 'Processing', description: 'Quality inspection & packed' },
    { label: 'In Transit', description: 'Carrier in route' },
    { label: 'Out for Delivery', description: 'Local courier assigned' },
    { label: 'Delivered', description: 'Package handed over' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('BUYER_DASHBOARD')}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft size={14} /> Back to Orders
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-luxury-gold" />
            <span className="text-xs uppercase tracking-widest font-bold text-gray-400">Shippo Carrier Verified</span>
          </div>
        </div>

        {/* Search Hero Card */}
        <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold block mb-1">
              Live Logistics Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif italic text-luxury-black">Track Your Order</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Enter your Order Number (e.g. <code className="bg-gray-100 px-1 py-0.5 rounded text-black font-mono">ord_...</code>) or Carrier Tracking Number.
            </p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Order ID (e.g. ord_172...) or Tracking Number"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-black focus:bg-white transition-all font-mono"
              />
            </div>

            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="px-3 py-3 bg-gray-50 border border-gray-200 text-xs uppercase font-bold tracking-wider text-gray-700 focus:outline-none focus:border-black"
            >
              <option value="usps">USPS Express</option>
              <option value="fedex">FedEx Air</option>
              <option value="dhl">DHL Express</option>
              <option value="ups">UPS Ground</option>
              <option value="shippo">Shippo Global</option>
            </select>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-black text-white text-xs uppercase font-bold tracking-widest hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Tracking...
                </>
              ) : (
                <>
                  Track Package <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Shortcuts if user has no order */}
          {orders.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 border-t border-gray-50">
              <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-wider">Recent Orders:</span>
              {orders.slice(0, 3).map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery(ord.id);
                    handleTrack(ord.id, ord);
                  }}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-luxury-cream text-luxury-black rounded font-mono text-[11px] transition-colors"
                >
                  #{ord.id.slice(-8)} ({ord.status})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-start gap-3 text-red-700 animate-fade-in">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Tracking Lookup Failed</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Main Tracking Results Display */}
        {trackingData && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Status Summary & Milestone Bar */}
            <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-sm shadow-sm space-y-8">
              
              {/* Carrier & Live Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-sm font-serif text-lg font-bold">
                    {trackingData.carrier.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {trackingData.carrier} • {trackingData.serviceLevel}
                      </span>
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded border border-green-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" /> Live Status
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold font-mono text-luxury-black">
                        {trackingData.trackingNumber}
                      </span>
                      <button
                        onClick={handleCopyTracking}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-black transition-colors"
                        title="Copy Tracking Number"
                      >
                        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">
                    Estimated Delivery
                  </span>
                  <span className="text-xl font-serif font-bold text-luxury-gold">
                    {new Date(trackingData.eta).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Visual Progress Steps */}
              <div>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-0 right-0 h-1 bg-gray-100 -z-0">
                    <div 
                      className="h-full bg-luxury-gold transition-all duration-700"
                      style={{ width: `${(milestoneStep / (steps.length - 1)) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-5 relative z-10">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= milestoneStep;
                      const isCurrent = idx === milestoneStep;

                      return (
                        <div key={step.label} className="flex flex-col items-center text-center group">
                          <div 
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-luxury-black text-luxury-gold ring-4 ring-luxury-cream' 
                                : 'bg-white border-2 border-gray-200 text-gray-400'
                            } ${isCurrent ? 'scale-110 shadow-md' : ''}`}
                          >
                            {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                          </div>
                          <span className={`text-[11px] font-bold uppercase tracking-wider mt-3 block ${isCompleted ? 'text-black' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                          <span className="text-[10px] text-gray-400 hidden sm:block mt-0.5 max-w-[90px]">
                            {step.description}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Current Status Message Box */}
              <div className="p-4 bg-luxury-cream/40 border border-luxury-gold/20 rounded-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck size={20} className="text-luxury-gold shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-luxury-black">
                      Current Status: {trackingData.status.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{trackingData.statusDetails}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleTrack()}
                  className="p-2 hover:bg-white rounded text-gray-500 hover:text-black transition-colors"
                  title="Refresh Live Data"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>

            </div>

            {/* Grid Layout: History Log + Order Items */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Scan History Timeline (2 Columns) */}
              <div className="md:col-span-2 bg-white border border-gray-100 p-6 rounded-sm shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2">
                    <Clock size={14} className="text-luxury-gold" /> Carrier Scan History
                  </h3>
                  <span className="text-[10px] text-gray-400">Route: {trackingData.origin} → {trackingData.destination}</span>
                </div>

                <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                  {trackingData.history.map((evt, index) => (
                    <div key={index} className="flex items-start gap-4 relative z-10">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${index === 0 ? 'bg-luxury-gold' : 'bg-gray-300'}`}>
                        <MapPin size={12} />
                      </div>
                      <div className="flex-1 bg-gray-50/50 p-3.5 border border-gray-100 rounded-sm">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold uppercase tracking-wider text-black">{evt.status.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(evt.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{evt.details}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
                          📍 {evt.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Order Details Sidebar (1 Column) */}
              <div className="space-y-6">
                {matchedOrder ? (
                  <div className="bg-white border border-gray-100 p-6 rounded-sm shadow-sm space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold block">
                        Associated Order
                      </span>
                      <h4 className="font-mono text-sm font-bold text-black mt-0.5">#{matchedOrder.id}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Placed on {matchedOrder.date}</p>
                    </div>

                    {/* Shipping Destination */}
                    {matchedOrder.shippingAddress && (
                      <div className="p-3 bg-gray-50 rounded-sm text-xs space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-gray-400 block mb-1">
                          Delivery Destination
                        </span>
                        <p className="font-semibold text-black">{matchedOrder.customerName}</p>
                        <p className="text-gray-600">{matchedOrder.shippingAddress.street}</p>
                        <p className="text-gray-600">
                          {matchedOrder.shippingAddress.city}, {matchedOrder.shippingAddress.state} {matchedOrder.shippingAddress.zip}
                        </p>
                        <p className="text-gray-500 font-medium">{matchedOrder.shippingAddress.country}</p>
                      </div>
                    )}

                    {/* Order Items */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">
                        Package Contents ({matchedOrder.items.length})
                      </span>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {matchedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-xs p-2 bg-gray-50 rounded-sm">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-10 h-10 object-cover rounded shrink-0 border border-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate text-black">{item.name}</p>
                              <p className="text-[10px] text-gray-400 uppercase">{item.designer} • Size: {item.size}</p>
                            </div>
                            <span className="font-bold text-xs shrink-0">{formatPrice(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                      <span className="uppercase font-bold text-gray-400">Order Total</span>
                      <span className="font-bold text-base text-luxury-black">{formatPrice(matchedOrder.total)}</span>
                    </div>

                    {/* Support Button */}
                    <button
                      onClick={() => {
                        if (onSelectOrderForSupport) {
                          onSelectOrderForSupport(matchedOrder.id);
                        } else {
                          onNavigate('AI_CONCIERGE');
                        }
                      }}
                      className="w-full py-2.5 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <PhoneCall size={12} /> Contact Order Concierge
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 p-6 rounded-sm shadow-sm text-center space-y-3">
                    <Package size={32} className="mx-auto text-gray-300" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-black">Guest Tracking Mode</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Tracking as guest. Sign in to your MyFitStore account to automatically link orders, view custom buyer notes, and request return labels.
                    </p>
                    <button
                      onClick={() => onNavigate('AUTH')}
                      className="w-full py-2 bg-luxury-black text-white text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors"
                    >
                      Sign In To Account
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
