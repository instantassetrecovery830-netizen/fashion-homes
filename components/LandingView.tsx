import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Loader, Diamond } from 'lucide-react';
import { generateSeasonalTrend } from '../services/geminiService';
import { TrendAnalysis, ViewState, UserRole } from '../types';
import { MOCK_PRODUCTS } from '../constants';

interface LandingViewProps {
  onNavigate: (view: ViewState) => void;
  isLoggedIn: boolean;
  userRole: UserRole;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, isLoggedIn, userRole }) => {
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

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          alt="Campaign" 
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
        />
        
        <div className="relative z-20 text-center text-white px-4 animate-slide-up">
          <h2 className="text-sm md:text-base tracking-[0.3em] uppercase mb-4 opacity-90">Spring / Summer 2024</h2>
          <h1 className="text-5xl md:text-8xl font-serif font-medium mb-8 leading-tight">
            ETHEREAL <br /> 
            <span className="italic font-light">FORMS</span>
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
                <span className="text-xs font-bold uppercase tracking-[0.3em] mx-8">New Season Arrivals</span>
                <span className="text-xs font-serif italic mx-8">Global Shipping</span>
                <span className="text-xs font-bold uppercase tracking-[0.3em] mx-8">Maison Margaux × Kaizen</span>
                <span className="mx-8 text-black/50">•</span>
             </React.Fragment>
          ))}
        </div>
        {/* Style to support the custom animation if not in tailwind config */}
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

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
                  <img src="https://picsum.photos/id/338/300/400" className="w-full h-64 object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Trend 1" />
                  <img src="https://picsum.photos/id/342/300/400" className="w-full h-64 object-cover mt-12 grayscale hover:grayscale-0 transition-all duration-700" alt="Trend 2" />
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