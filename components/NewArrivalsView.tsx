
import React from 'react';
import { Heart } from 'lucide-react';
import { Product, UserRole } from '../types';

interface NewArrivalsViewProps {
  onProductSelect: (product: Product) => void;
  products: Product[];
  savedItems?: Product[];
  onToggleSave?: (product: Product) => void;
  onNavigate: (view: any) => void;
  userRole: UserRole;
  isLoggedIn: boolean;
}

export const NewArrivalsView: React.FC<NewArrivalsViewProps> = ({ 
  onProductSelect, 
  products, 
  savedItems = [], 
  onToggleSave,
  onNavigate,
  userRole,
  isLoggedIn
}) => {
  const newArrivals = products.filter(p => p.isNewSeason);
  const isSaved = (productId: string) => savedItems.some(p => p.id === productId);

  return (
    <div className="min-h-screen pt-12 pb-24 animate-fade-in">
      {/* Editorial Header */}
      <div className="max-w-7xl mx-auto px-6 mb-16 relative">
        <div className="flex flex-col items-center text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-luxury-gold">Just Landed</span>
          <h1 className="text-5xl md:text-7xl font-serif italic">New Season</h1>
          <p className="max-w-xl text-gray-500 font-light leading-relaxed">
            The latest drops from our curated selection of avant-garde designers. 
            Discover the silhouettes defining this season's narrative.
          </p>
          
          {/* Manage Button - Only for Vendors and Admins */}
          {userRole !== UserRole.BUYER && (
            <button
              onClick={() => isLoggedIn ? onNavigate('NEW_ARRIVALS_MANAGE') : onNavigate('AUTH')}
              className="mt-8 w-full md:w-auto bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors shadow-lg"
            >
              {isLoggedIn ? 'Add New Piece' : 'Sign in to Add New Piece'}
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
          {newArrivals.map((product) => (
            <div 
              key={product.id} 
              className="group cursor-pointer"
              onClick={() => onProductSelect(product)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-6">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                
                <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
                    New Season
                </span>

                <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 opacity-0 group-hover:opacity-100 flex items-end justify-center pb-8">
                  <button className="bg-white text-black text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-luxury-black hover:text-white transition-all duration-500 shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                    Quick View
                  </button>
                </div>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(product); }}
                    className={`absolute top-4 right-4 transition-transform hover:scale-110 duration-300 opacity-0 group-hover:opacity-100 ${isSaved(product.id) ? 'opacity-100 text-luxury-gold' : 'text-white mix-blend-difference'}`}
                >
                  <Heart size={20} strokeWidth={1.5} fill={isSaved(product.id) ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-1">{product.designer}</h3>
                  <p className="font-serif text-gray-600 italic group-hover:text-black transition-colors">{product.name}</p>
                </div>
                <span className="text-sm font-medium">${product.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
