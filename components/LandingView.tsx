
import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Loader, Diamond, UserPlus } from 'lucide-react';
import { generateSeasonalTrend } from '../services/geminiService.ts';
import { TrendAnalysis, ViewState, UserRole, Vendor, Product, LandingPageContent } from '../types.ts';

interface LandingViewProps {
  onNavigate: (view: ViewState) => void;
  isLoggedIn: boolean;
  userRole: UserRole;
  vendors: Vendor[];
  products: Product[];
  onDesignerClick: (designerName: string) => void;
  cmsContent?: LandingPageContent;
  onAuthRequest?: (mode: 'LOGIN' | 'REGISTER', role: UserRole) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ 
  onNavigate, 
  isLoggedIn, 
  userRole, 
  vendors = [], 
  products = [],
  onDesignerClick,
  cmsContent,
  onAuthRequest
}) => {
  const [trend, setTrend] = useState<TrendAnalysis | null>(null);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  const spotlightProducts = products.slice(0, 3); // Display first 3 real products

  // Safe access to CMS content
  const hero = cmsContent?.hero || {
    videoUrl: "https://videos.pexels.com/video-files/3205917/3205917-uhd_2560_1440_25fps.mp4",
    posterUrl: "https://images.unsplash.com/photo-1605289355680-e66a36d2e680?q=80&w=2070&auto=format&fit=crop",
    subtitle: "The New Vanguard",
    titleLine1: "DIGITAL",
    titleLine2: "AVANT-GARDE",
    buttonText: "Shop Collection"
  };
  
  const marqueeText = cmsContent?.marquee?.text || "Lagos • Accra • Nairobi • Cape Town • Heritage Reimagined • Pan-African Aesthetics";
  const marqueeItems = marqueeText.split("•").map(s => s.trim()).filter(Boolean);

  const campaign = cmsContent?.campaign || {
    subtitle: "The Campaign",
    title: "Urban Chronicles",
    image1: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1887&auto=format&fit=crop",
    image2: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1888&auto=format&fit=crop",
    image3: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2070&auto=format&fit=crop",
    image4: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1886&auto=format&fit=crop",
    overlayText1: "Street Edition"
  };

  const designersSection = cmsContent?.designers || { subtitle: "The Ateliers", title: "Shop by Designer" };
  const spotlightSection = cmsContent?.spotlight || { title: "Editor's Picks" };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full overflow-hidden flex items-center justify-center bg-luxury-black">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={hero.posterUrl}
          className="absolute inset-0 w-full h-full object-cover animate-fade-in opacity-90"
        >
          <source src={hero.videoUrl} type="video/mp4" />
          <img 
            src={hero.posterUrl} 
            alt="Hero Campaign" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </video>
        
        <div className="relative z-20 text-center text-white px-6 animate-slide-up w-full max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-[10px] md:text-base tracking-[0.3em] uppercase mb-4 opacity-90 text-luxury-gold">{hero.subtitle}</h2>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-medium mb-8 md:mb-10 leading-tight drop-shadow-2xl">
            {hero.titleLine1} <br /> 
            <span className="italic font-light">{hero.titleLine2}</span>
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md md:max-w-none">
            <button 
              onClick={() => onNavigate('MARKETPLACE')}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-3 md:py-4 bg-white text-black text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase hover:bg-luxury-gold hover:text-white transition-all duration-300 w-full sm:w-auto sm:min-w-[200px] shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              {hero.buttonText}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            {!isLoggedIn && (
              <button 
                onClick={() => onAuthRequest ? onAuthRequest('REGISTER', UserRole.BUYER) : onNavigate('AUTH')}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 md:py-4 bg-luxury-gold text-white text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300 w-full sm:w-auto sm:min-w-[200px] shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                <UserPlus size={14} /> Get Started
              </button>
            )}
            
            <button 
              onClick={() => onNavigate('PRICING')}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 md:py-4 bg-black/40 backdrop-blur-md border border-white/30 text-white text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black hover:border-white transition-all duration-300 w-full sm:w-auto sm:min-w-[200px]"
            >
              <Diamond size={12} /> Membership
            </button>

            {isLoggedIn && (
               <button 
                onClick={handleDashboardClick}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-3 md:py-4 border border-white text-white text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm w-full sm:w-auto sm:min-w-[200px]"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Infinite Marquee with Parallax */}
      <div className="bg-luxury-gold text-white py-3 md:py-4 overflow-hidden whitespace-nowrap border-y border-white/10 relative z-30">
        {/* Parallax Wrapper */}
        <div style={{ transform: `translateX(${scrollY * -0.15}px)`, willChange: 'transform' }}>
          {/* Animation Wrapper: 30s duration, linear timing */}
          <div className="inline-flex animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
            {[...Array(6)].map((_, i) => (
               <React.Fragment key={i}>
                  {marqueeItems.map((item, idx) => (
                     <React.Fragment key={idx}>
                        <span className={`text-[10px] md:text-xs mx-4 md:mx-8 ${idx % 2 === 0 ? 'font-bold uppercase tracking-[0.3em]' : 'font-serif italic'}`}>{item}</span>
                        <span className="mx-4 md:mx-8 text-black/50">•</span>
                     </React.Fragment>
                  ))}
               </React.Fragment>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* Shop by Designer Section */}
      <section className="py-16 md:py-24 bg-luxury-cream border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-luxury-taupe mb-4 block">{designersSection.subtitle}</span>
            <h2 className="text-3xl md:text-5xl font-serif italic text-luxury-black">{designersSection.title}</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-20">
            {activeVendors.slice(0, 4).map((vendor) => (
              <div 
                key={vendor.id} 
                className="group flex flex-col items-center cursor-pointer w-[40%] md:w-auto"
                onClick={() => onDesignerClick(vendor.name)}
              >
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border border-gray-100 p-1 mb-4 md:mb-6 transition-all duration-500 group-hover:border-luxury-gold group-hover:scale-105 shadow-sm group-hover:shadow-xl">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 relative">
                    <img 
                      src={vendor.avatar} 
                      alt={vendor.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out" 
                    />
                  </div>
                </div>
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest border-b border-transparent group-hover:border-luxury-black pb-1 transition-all duration-300 text-luxury-charcoal text-center">
                  {vendor.name}
                </h3>
                <p className="text-[9px] md:text-[10px] text-luxury-taupe mt-1 md:mt-2 font-serif italic">{vendor.location}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12 md:mt-16">
             <button 
                onClick={() => onNavigate('DESIGNERS')}
                className="text-[10px] md:text-xs font-bold uppercase tracking-widest border-b border-luxury-black pb-1 hover:text-luxury-gold hover:border-luxury-gold transition-colors text-luxury-black"
             >
                View All Ateliers
             </button>
          </div>
        </div>
      </section>

      {/* AI Curator Section */}
      <section className="py-16 md:py-24 bg-luxury-black text-luxury-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8 md:mb-12">
            <Sparkles className="text-luxury-gold" size={20} />
            <h3 className="text-[10px] md:text-xs font-bold tracking-widest uppercase">AI Trend Forecast</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              {loadingTrend ? (
                <div className="h-48 flex items-center justify-center border border-white/10">
                  <Loader className="animate-spin text-luxury-gold" />
                </div>
              ) : trend ? (
                <div className="space-y-6 md:space-y-8 animate-fade-in">
                  <h2 className="text-3xl md:text-6xl font-serif leading-none">{trend.title}</h2>
                  <p className="text-gray-400 text-sm md:text-lg font-light leading-relaxed">
                    {trend.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-[10px] md:text-xs uppercase tracking-wider text-gray-500">Palette</p>
                    <div className="flex gap-4">
                      {trend.colorPalette.map((color, idx) => (
                        <div key={idx} className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative hidden md:block">
               {/* Editorial Grid Mockup */}
               <div className="grid grid-cols-2 gap-4">
                  <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800" className="w-full h-64 object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="African Fashion Trend 1" />
                  <img src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=800" className="w-full h-64 object-cover mt-12 grayscale hover:grayscale-0 transition-all duration-700" alt="African Fashion Trend 2" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign / Visual Section */}
      <section className="py-16 md:py-24 bg-luxury-cream">
        <div className="max-w-7xl mx-auto px-6">
           <div className="mb-12 text-center">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-luxury-taupe mb-2 block">{campaign.subtitle}</span>
              <h2 className="text-3xl md:text-4xl font-serif italic text-luxury-black">{campaign.title}</h2>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 h-auto md:h-[600px] auto-rows-fr">
              <div 
                onClick={() => onNavigate('MARKETPLACE')}
                className="col-span-2 md:col-span-2 row-span-2 relative group overflow-hidden h-[300px] md:h-full cursor-pointer"
              >
                 <img src={campaign.image1} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Outfit 1" />
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                 <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{campaign.overlayText1}</p>
                 </div>
              </div>
              <div 
                onClick={() => onNavigate('MARKETPLACE')}
                className="col-span-1 relative group overflow-hidden h-[150px] md:h-full cursor-pointer"
              >
                 <img src={campaign.image2} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Outfit 2" />
              </div>
              <div 
                onClick={() => onNavigate('MARKETPLACE')}
                className="col-span-1 relative group overflow-hidden h-[150px] md:h-full cursor-pointer"
              >
                 <img src={campaign.image3} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Outfit 3" />
              </div>
               <div 
                 onClick={() => onNavigate('MARKETPLACE')}
                 className="col-span-2 relative group overflow-hidden h-[150px] md:h-full cursor-pointer"
               >
                 <img src={campaign.image4} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Outfit 4" />
              </div>
           </div>
        </div>
      </section>

      {/* Spotlight Products */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 bg-luxury-cream-dark">
        <div className="flex justify-between items-end mb-8 md:mb-12">
           <h2 className="text-2xl md:text-3xl font-serif italic text-luxury-black">{spotlightSection.title}</h2>
           <button onClick={() => onNavigate('MARKETPLACE')} className="text-[10px] md:text-xs uppercase border-b border-black pb-1 hover:text-luxury-gold hover:border-luxury-gold transition-colors text-luxury-black">View All</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-x-8 md:gap-y-12">
          {spotlightProducts.length > 0 ? spotlightProducts.map((product) => (
            <div key={product.id} className="group cursor-pointer" onClick={() => onNavigate('MARKETPLACE')}>
              <div className="relative overflow-hidden mb-4 md:mb-6 aspect-[3/4]">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                {product.isNewSeason && (
                  <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
                    New Season
                  </span>
                )}
              </div>
              <h3 className="font-bold text-xs md:text-sm uppercase tracking-wide mb-1 text-luxury-charcoal">{product.designer}</h3>
              <p className="font-serif text-base md:text-lg italic text-luxury-taupe mb-2">{product.name}</p>
              <p className="text-xs md:text-sm font-medium text-luxury-black">${product.price}</p>
            </div>
          )) : (
            <div className="col-span-3 text-center text-gray-400 py-12">
              <p>No products featured at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
