
import React, { useState, useEffect } from 'react';
import { Timer, ArrowRight, Bell, Lock, CheckCircle, Mail } from 'lucide-react';
import { Product, DropPageContent } from '../types.ts';
import { joinWaitlistInDb } from '../services/dataService.ts';
import { auth } from '../services/firebase.ts';

interface TheDropViewProps {
  products: Product[];
  onNavigate: (view: any) => void;
  cmsContent?: DropPageContent;
}

export const TheDropView: React.FC<TheDropViewProps> = ({ products, onNavigate, cmsContent }) => {
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // Use CMS content if provided, otherwise fallback to product-based logic
  const defaultDrop = {
      title: 'VANTABLACK ETHER COAT',
      subtitle: 'MAISON OMEGA',
      description: 'A masterpiece of light absorption. The Vantablack Ether Coat redefines the silhouette with a void-like presence. Highly limited run.',
      backgroundImage: 'https://images.unsplash.com/photo-1536766820879-059fec98ec0a?q=80&w=1974&auto=format&fit=crop',
      countdownDate: new Date(Date.now() + 172800000).toISOString()
  };

  const dropData = {
      ...defaultDrop,
      ...(cmsContent || {})
  };

  useEffect(() => {
    // Find the next product with a release date in the future if no CMS date is used
    if (!cmsContent) {
        const now = new Date();
        const upcoming = products
            .filter(p => p.releaseDate && new Date(p.releaseDate) > now)
            .sort((a, b) => new Date(a.releaseDate!).getTime() - new Date(b.releaseDate!).getTime());

        if (upcoming.length > 0) {
            setTargetProduct(upcoming[0]);
        }
    }
  }, [products, cmsContent]);

  useEffect(() => {
    const targetDate = cmsContent ? new Date(cmsContent.countdownDate) : (targetProduct?.releaseDate ? new Date(targetProduct.releaseDate) : null);
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
            clearInterval(timer);
        }
    }, 1000);

    return () => clearInterval(timer);
  }, [cmsContent, targetProduct]);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;
      
      setIsSubmitting(true);
      await joinWaitlistInDb({
          id: `wait_${Date.now()}`,
          email,
          productId: targetProduct?.id || 'general_drop',
          date: new Date().toISOString()
      });
      setIsSubmitting(false);
      setHasJoined(true);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col md:flex-row animate-fade-in">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(60,60,60,0.4),_transparent)] z-0" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent opacity-50" />

        {/* Left Side: Product Imagery */}
        <div className="relative w-full md:w-1/2 h-[50vh] md:h-screen z-10 overflow-hidden group">
            <img 
                src={dropData.backgroundImage} 
                alt={dropData.title} 
                className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105 opacity-80 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black" />
            
            {/* Mobile Title Overlay */}
            <div className="absolute bottom-8 left-6 md:hidden">
                <span className="text-luxury-gold text-xs font-bold uppercase tracking-[0.3em] mb-2 block animate-pulse">Incoming Drop</span>
                <h1 className="text-3xl font-serif italic text-white leading-none">{dropData.title}</h1>
            </div>
        </div>

        {/* Right Side: Details & Countdown */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-8 md:px-24 py-16 z-20 bg-black md:bg-transparent">
            
            <div className="hidden md:block mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="text-luxury-gold text-xs font-bold uppercase tracking-[0.3em]">Live Countdown</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-serif italic text-white leading-tight mb-4">{dropData.title}</h1>
                <p className="text-gray-400 text-lg uppercase tracking-widest">{dropData.subtitle}</p>
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
                {dropData.description}
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
