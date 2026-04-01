
import React, { useState, useEffect, useMemo } from 'react';
import { Heart, ThumbsUp, Clock, ShoppingBag } from 'lucide-react';
import { Product, UserRole } from '../types';

interface NewArrivalsViewProps {
  onProductSelect: (product: Product) => void;
  products: Product[];
  savedItems?: Product[];
  onToggleSave?: (product: Product) => void;
  onNavigate: (view: any) => void;
  userRole: UserRole;
  isLoggedIn: boolean;
  onVote?: (product: Product) => void;
  userVotes?: string[];
  onAuthRequest?: (mode: 'LOGIN' | 'REGISTER', role: UserRole) => void;
}

export const NewArrivalsView: React.FC<NewArrivalsViewProps> = ({ 
  onProductSelect, 
  products, 
  savedItems = [], 
  onToggleSave,
  onNavigate,
  userRole,
  isLoggedIn,
  onVote,
  userVotes = [],
  onAuthRequest
}) => {
  const newArrivals = useMemo(() => products.filter(p => p.isNewSeason), [products]);
  const isSaved = (productId: string) => savedItems.some(p => p.id === productId);

  // Countdown Timer Logic
  const calculateTimeLeft = (dropDate?: string) => {
      if (!dropDate) return { days: 0, hours: 0, minutes: 0 };
      const difference = +new Date(dropDate) - +new Date();
      if (difference > 0) {
          return {
              days: Math.floor(difference / (1000 * 60 * 60 * 24)),
              hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
              minutes: Math.floor((difference / 1000 / 60) % 60),
          };
      }
      return { days: 0, hours: 0, minutes: 0 };
  };

  const [timeLeft, setTimeLeft] = useState<{ [key: string]: any }>({});

  useEffect(() => {
      const timer = setInterval(() => {
          const newTimeLeft: { [key: string]: any } = {};
          newArrivals.forEach(product => {
              if (product.dropDate) {
                  newTimeLeft[product.id] = calculateTimeLeft(product.dropDate);
              }
          });
          setTimeLeft(newTimeLeft);
      }, 60000); // Update every minute

      // Initial calculation
      const initialTimeLeft: { [key: string]: any } = {};
      newArrivals.forEach(product => {
          if (product.dropDate) {
              initialTimeLeft[product.id] = calculateTimeLeft(product.dropDate);
          }
      });
      setTimeLeft(initialTimeLeft);

      return () => clearInterval(timer);
  }, [newArrivals]);


  return (
    <div className="min-h-screen pt-12 pb-24 animate-fade-in">
      {/* Editorial Header */}
      <div className="max-w-7xl mx-auto px-6 mb-16 relative">
        <div className="flex flex-col items-center text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-luxury-gold">Just Landed</span>
          <h1 className="text-5xl md:text-7xl font-serif italic">New Season</h1>
          <p className="max-w-xl text-gray-500 font-light leading-relaxed">
            Vote for your favorite pieces to drop faster. Pre-order now to secure your size.
          </p>
          
          {/* Manage Button - Only for Vendors and Admins */}
          {userRole !== UserRole.BUYER && (
            <button
              onClick={() => isLoggedIn ? onNavigate('NEW_ARRIVALS_MANAGE') : (onAuthRequest ? onAuthRequest('LOGIN', UserRole.VENDOR) : onNavigate('AUTH'))}
              className="mt-8 w-full md:w-auto bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors shadow-lg"
            >
              {isLoggedIn ? 'Add New Piece' : 'Sign in to Add New Piece'}
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
          {newArrivals.map((product) => (
            <div 
              key={product.id} 
              className="group cursor-pointer flex flex-col h-full"
              onClick={() => onProductSelect(product)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-6">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                
                {/* Countdown Overlay */}
                {product.dropDate && timeLeft[product.id] && (timeLeft[product.id].days > 0 || timeLeft[product.id].hours > 0) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md text-white p-3 flex justify-center items-center gap-4">
                        <div className="text-center">
                            <span className="block text-lg font-bold font-mono leading-none">{timeLeft[product.id].days}</span>
                            <span className="text-[8px] uppercase tracking-wider opacity-70">Days</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-lg font-bold font-mono leading-none">{timeLeft[product.id].hours}</span>
                            <span className="text-[8px] uppercase tracking-wider opacity-70">Hrs</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-lg font-bold font-mono leading-none">{timeLeft[product.id].minutes}</span>
                            <span className="text-[8px] uppercase tracking-wider opacity-70">Mins</span>
                        </div>
                    </div>
                )}

                <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
                    New Season
                </span>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(product); }}
                    className={`absolute top-4 right-4 transition-transform hover:scale-110 duration-300 opacity-0 group-hover:opacity-100 ${isSaved(product.id) ? 'opacity-100 text-luxury-gold' : 'text-white mix-blend-difference'}`}
                >
                  <Heart size={20} strokeWidth={1.5} fill={isSaved(product.id) ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-500">{product.designer}</h3>
                    <h2 className="font-serif text-xl italic mb-2">{product.name}</h2>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold bg-gray-100 px-2 py-1 rounded-full" title="Votes">
                      <ThumbsUp size={12} /> {product.votes || 0}
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3 flex-1">
                    {product.description}
                </p>

                <div className="flex gap-3 mt-auto">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onVote && onVote(product); }}
                        disabled={userVotes.includes(product.id)}
                        className={`flex-1 border border-black py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${userVotes.includes(product.id) ? 'bg-black text-white cursor-not-allowed opacity-70' : 'hover:bg-black hover:text-white'}`}
                    >
                        <ThumbsUp size={14} /> {userVotes.includes(product.id) ? 'Voted' : 'Vote to Drop'}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onProductSelect(product); }}
                        className="flex-1 bg-luxury-gold text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                        <ShoppingBag size={14} /> Pre-Order
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
