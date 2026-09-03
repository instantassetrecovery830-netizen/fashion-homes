
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Lock, CheckCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Product, DropPageContent } from '../types.ts';
import { joinWaitlistInDb } from '../services/dataService.ts';
import { auth } from '../services/firebase.ts';

interface TheDropViewProps {
  products: Product[];
  onNavigate: (view: any) => void;
  cmsContent?: DropPageContent;
  allDrops?: DropPageContent[];
}

export const TheDropView: React.FC<TheDropViewProps> = ({ products, onNavigate, cmsContent, allDrops }) => {
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [selectedDropIdx, setSelectedDropIdx] = useState(0);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // Available drops list
  const activeDropsList = useMemo(() => {
    if (allDrops && allDrops.length > 0) return allDrops;
    if (cmsContent) return [cmsContent];
    return [{
      id: 'default_drop',
      title: 'VANTABLACK ETHER COAT',
      subtitle: 'MAISON OMEGA',
      description: 'A masterpiece of light absorption. The Vantablack Ether Coat redefines the silhouette with a void-like presence. Highly limited run.',
      backgroundImages: [
        'https://images.unsplash.com/photo-1536766820879-059fec98ec0a?q=80&w=1974&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1600'
      ],
      countdownDate: new Date(Date.now() + 172800000).toISOString()
    }];
  }, [allDrops, cmsContent]);

  const activeDrop = activeDropsList[selectedDropIdx] || activeDropsList[0];

  const images = useMemo(() => {
    if (activeDrop?.backgroundImages && activeDrop.backgroundImages.length > 0) {
      return activeDrop.backgroundImages;
    }
    return ['https://images.unsplash.com/photo-1536766820879-059fec98ec0a?q=80&w=1974&auto=format&fit=crop'];
  }, [activeDrop]);

  // Slideshow timer
  useEffect(() => {
    setCurrentSlideIdx(0);
  }, [selectedDropIdx]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIdx(prev => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [images]);

  useEffect(() => {
    if (!cmsContent && !allDrops) {
        const now = new Date();
        const upcoming = products
            .filter(p => p.releaseDate && new Date(p.releaseDate) > now)
            .sort((a, b) => new Date(a.releaseDate!).getTime() - new Date(b.releaseDate!).getTime());

        if (upcoming.length > 0) {
            setTargetProduct(upcoming[0]);
        }
    }
  }, [products, cmsContent, allDrops]);

  useEffect(() => {
    const targetDate = activeDrop?.countdownDate 
      ? new Date(activeDrop.countdownDate) 
      : (targetProduct?.releaseDate ? new Date(targetProduct.releaseDate) : null);
      
    if (!targetDate) return;

    const timer = setInterval(() => {
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();

        if (difference > 0) {
            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            });
        } else {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            clearInterval(timer);
        }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeDrop, targetProduct]);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;
      
      setIsSubmitting(true);
      await joinWaitlistInDb({
          id: `wait_${Date.now()}`,
          email,
          productId: targetProduct?.id || activeDrop?.id || 'general_drop',
          date: new Date().toISOString()
      });
      setIsSubmitting(false);
      setHasJoined(true);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col md:flex-row animate-fade-in">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(60,60,60,0.4),_transparent)] z-0" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent opacity-50 z-30" />

        {/* Multi-Drop Switcher Bar top overlay */}
        {activeDropsList.length > 1 && (
          <div className="absolute top-4 left-6 z-40 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-2 border border-white/10 rounded-full">
            <Sparkles size={12} className="text-luxury-gold" />
            <span className="text-[10px] uppercase font-bold text-gray-300 mr-1">Drops:</span>
            {activeDropsList.map((d, i) => (
              <button
                key={d.id || i}
                onClick={() => setSelectedDropIdx(i)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${
                  selectedDropIdx === i 
                    ? 'bg-luxury-gold text-white shadow-sm scale-105' 
                    : 'bg-white/10 text-gray-400 hover:text-white'
                }`}
              >
                #{i + 1} {d.title?.slice(0, 12)}...
              </button>
            ))}
          </div>
        )}

        {/* Left Side: Product Imagery Slideshow */}
        <div className="relative w-full md:w-1/2 h-[55vh] md:h-screen z-10 overflow-hidden group">
            {images.map((imgUrl, idx) => (
              <div 
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === currentSlideIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img 
                  src={imgUrl} 
                  alt={`${activeDrop.title} slide ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-[6s] scale-100 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
              </div>
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black z-10" />
            
            {/* Slideshow Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentSlideIdx((currentSlideIdx - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-colors border border-white/20"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlideIdx((currentSlideIdx + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-colors border border-white/20"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Slideshow Progress Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIdx(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentSlideIdx ? 'w-6 bg-luxury-gold' : 'w-1.5 bg-white/40 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Mobile Title Overlay */}
            <div className="absolute bottom-12 left-6 md:hidden z-20">
                <span className="text-luxury-gold text-xs font-bold uppercase tracking-[0.3em] mb-2 block animate-pulse">Incoming Drop</span>
                <h1 className="text-3xl font-serif italic text-white leading-none">{activeDrop.title}</h1>
            </div>
        </div>

        {/* Right Side: Details & Countdown */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-8 md:px-24 py-16 z-20 bg-black md:bg-transparent">
            
            <div className="hidden md:block mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="text-luxury-gold text-xs font-bold uppercase tracking-[0.3em]">Live Countdown</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-serif italic text-white leading-tight mb-4">{activeDrop.title}</h1>
                <p className="text-gray-400 text-lg uppercase tracking-widest">{activeDrop.subtitle}</p>
            </div>

            {/* Countdown Timer */}
            <div className="grid grid-cols-4 gap-4 mb-16 border-y border-white/10 py-8">
                {[
                    { label: 'Days', value: timeLeft.days },
                    { label: 'Hours', value: timeLeft.hours },
                    { label: 'Mins', value: timeLeft.minutes },
                    { label: 'Secs', value: timeLeft.seconds }
                ].map((item, idx) => (
                    <div key={idx} className="text-center">
                        <span className="block text-3xl md:text-5xl font-bold font-mono tabular-nums">{String(item.value).padStart(2, '0')}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">{item.label}</span>
                    </div>
                ))}
            </div>

            <p className="text-gray-400 font-light leading-relaxed mb-12 max-w-md">
                {activeDrop.description}
            </p>

            {/* Waitlist Action */}
            <div className="max-w-md">
                {hasJoined ? (
                    <div className="bg-white/5 border border-luxury-gold/30 p-6 flex items-center gap-4 animate-fade-in rounded-sm">
                        <CheckCircle className="text-luxury-gold" size={32} />
                        <div>
                            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-1">You're on the list</h4>
                            <p className="text-gray-400 text-xs">We will notify you at {email} the moment the drop goes live.</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleJoinWaitlist} className="space-y-4">
                        <div className="relative">
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ENTER EMAIL FOR ACCESS"
                                className="w-full bg-transparent border-b border-gray-600 py-4 text-sm text-white placeholder-gray-600 focus:border-luxury-gold outline-none transition-colors"
                            />
                            <Lock className="absolute right-0 top-4 text-gray-600" size={16} />
                        </div>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-white text-black py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-luxury-gold hover:text-white transition-all flex items-center justify-center gap-4 disabled:opacity-50 mt-6 group"
                        >
                            {isSubmitting ? 'Processing...' : 'Join Waitlist'} 
                            {!isSubmitting && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                        <p className="text-[10px] text-gray-600 text-center mt-4">
                            * By joining, you agree to receive email notifications regarding this release.
                        </p>
                    </form>
                )}
            </div>
        </div>
    </div>
  );
};

export default TheDropView;
