import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Loader, Diamond } from 'lucide-react';
import { generateSeasonalTrend } from '../services/geminiService';
import { TrendAnalysis, ViewState, UserRole, Vendor } from '../types';
import { MOCK_PRODUCTS } from '../constants';

interface LandingViewProps {
  onNavigate: (view: ViewState) => void;
  isLoggedIn: boolean;
  userRole: UserRole;
  vendors: Vendor[];
  onDesignerClick: (designerName: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ 
  onNavigate, 
  isLoggedIn, 
  userRole, 
  vendors = [], 
  onDesignerClick 
}) => {
  const [trend, setTrend] = useState<TrendAnalysis | null>(null);
  const [loadingTrend, setLoadingTrend] = useState(false);

  useEffect(() => {
    const fetchTrend = async () => {
      setLoadingTrend(true);
      const data = await generateSeasonalTrend();
      setTrend(data);
      setLoadingTrend(false);
    };
    fetchTrend();
  }, []);

  const handleDashboardClick = () => {
    if (userRole === UserRole.ADMIN) onNavigate('ADMIN_PANEL');
    else if (userRole === UserRole.VENDOR) onNavigate('VENDOR_DASHBOARD');
    else onNavigate('BUYER_DASHBOARD');
  };

  const activeVendors = vendors.filter(v => v.subscriptionStatus === 'ACTIVE');

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1605289355680-e66a36d2e680?q=80&w=2070&auto=format&fit=crop" 
          alt="African Luxury Campaign" 
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
        />
        
        <div className="relative z-20 text-center text-white px-4 animate-slide-up">
          <h2 className="text-sm md:text-base tracking-[0.3em] uppercase mb-4 opacity-90">The New Vanguard</h2>
          <h1 className="text-5xl md:text-8xl font-serif font-medium mb-8 leading-tight">
            AFRICAN <br /> 
            <span className="italic font-light">LUXURY</span>
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onNavigate('MARKETPLACE')}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-luxury-gold hover:text-white transition-all duration-300 min-w-[200px] justify-center"
            >
              Shop Collection
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => onNavigate('PRICING')}
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-black/30 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 min-w-[200px] justify-center"
            >
              <Diamond size={12} /> Membership Access
            </button>

            {isLoggedIn && (
               <button 
                onClick={handleDashboardClick}
                className="group relative inline-flex items-center gap-3 px-8 py-4 border border-white text-white text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm min-w-[200px] justify-center"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Infinite Marquee */}
      <div className="bg-luxury-gold text-white py-4 overflow-hidden whitespace-nowrap border-y border-white/10">
        <div className="inline-flex animate-[marquee_20s_linear_infinite]">
          {[...Array(6)].map((_, i) => (
             <React.Fragment key={i}>
                <span className="text-xs font-bold uppercase tracking-[0.3em] mx-8">Lagos • Accra • Nairobi • Cape Town</span>
                <span className="text-xs font-serif italic mx-8">Heritage Reimagined</span>
                <span className="text-xs font-bold uppercase tracking-[0.3em] mx-8">Pan-African Aesthetics</span>
                <span className="mx-8 text-black/50">•</span>
             </React.Fragment>
          ))}
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* Shop by Designer Section */}
      <section className="py-24 bg-white border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4 block">The Ateliers</span>
            <h2 className="text-4xl md:text-5xl font-serif italic">Shop by Designer</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            {activeVendors.slice(0, 4).map((vendor) => (
              <div 
                key={vendor.id} 
                className="group flex flex-col items-center cursor-pointer"
                onClick={() => onDesignerClick(vendor.name)}
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-gray-100 p-1 mb-6 transition-all duration-500 group-hover:border-luxury-gold group-hover:scale-105 shadow-sm group-hover:shadow-xl">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 relative">
                    <img 
                      src={vendor.avatar} 
                      alt={vendor.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out" 
                    />
                  </div>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest border-b border-transparent group-hover:border-black pb-1 transition-all duration-300">
                  {vendor.name}
                </h3>
                <p className="text-[10px] text-gray-400 mt-2 font-serif italic">{vendor.location}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
             <button 
                onClick={() => onNavigate('DESIGNERS')}
                className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-luxury-gold hover:border-luxury-gold transition-colors"
             >
                View All Ateliers
             </button>
          </div>
        </div>
      </section>

      {/* AI Curator Section */}
      <section className="py-24 bg-luxury-black text-luxury-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-12">
            <Sparkles className="text-luxury-gold" size={24} />
            <h3 className="text-xs font-bold tracking-widest uppercase">AI Trend Forecast</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              {loadingTrend ? (
                <div className="h-48 flex items-center justify-center border border-white/10">
                  <Loader className="animate-spin text-luxury-gold" />
                </div>
              ) : trend ? (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-4xl md:text-6xl font-serif leading-none">{trend.title}</h2>
                  <p className="text-gray-400 text-lg font-light leading-relaxed">
                    {trend.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Palette</p>
                    <div className="flex gap-4">
                      {trend.colorPalette.map((color, idx) => (
                        <div key={idx} className="w-12 h-12 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative">
               {/* Editorial Grid Mockup */}
               <div className="grid grid-cols-2 gap-4">
                  <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800" className="w-full h-64 object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="African Fashion Trend 1" />
                  <img src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=800" className="w-full h-64 object-cover mt-12 grayscale hover:grayscale-0 transition-all duration-700" alt="African Fashion Trend 2" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight Products */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
           <h2 className="text-3xl font-serif italic">Editor's Picks</h2>
           <button onClick={() => onNavigate('MARKETPLACE')} className="text-xs uppercase border-b border-black pb-1 hover:text-luxury-gold hover:border-luxury-gold transition-colors">View All</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
          {MOCK_PRODUCTS.slice(0, 3).map((product) => (
            <div key={product.id} className="group cursor-pointer" onClick={() => onNavigate('MARKETPLACE')}>
              <div className="relative overflow-hidden mb-6 aspect-[3/4]">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {product.isNewSeason && (
                  <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
                    New Season
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wide mb-1">{product.designer}</h3>
              <p className="font-serif text-lg italic text-gray-600 mb-2">{product.name}</p>
              <p className="text-sm font-medium">${product.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};