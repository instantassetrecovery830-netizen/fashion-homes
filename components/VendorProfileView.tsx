import React, { useState } from 'react';
import { BadgeCheck, MapPin, Users, Star, ArrowLeft, Heart, Share2, Instagram, Twitter, Globe, Check } from 'lucide-react';
import { Vendor, Product, ViewState } from '../types';

interface VendorProfileViewProps {
  vendor: Vendor;
  onProductSelect: (product: Product) => void;
  onNavigate: (view: ViewState) => void;
  products: Product[];
}

export const VendorProfileView: React.FC<VendorProfileViewProps> = ({ vendor, onProductSelect, onNavigate, products }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Filter products for this specific vendor from the passed active products
  const vendorProducts = products.filter(p => p.designer === vendor.name);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `LUMIERRE | ${vendor.name}`,
          text: `Discover ${vendor.name} on LUMIERRE, the luxury fashion ecosystem.`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Profile link copied to clipboard.");
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden">
         <img 
           src={vendor.avatar} 
           alt="Cover" 
           className="w-full h-full object-cover blur-sm scale-110 opacity-50"
         />
         <div className="absolute inset-0 bg-black/20" />
         <button 
           onClick={() => onNavigate('DESIGNERS')}
           className="absolute top-8 left-6 md:left-12 flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest hover:text-luxury-gold transition-colors z-20"
         >
           <ArrowLeft size={16} /> Back to Designers
         </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative -mt-20 z-10">
        <div className="bg-white p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start gap-8 md:gap-16">
          
          {/* Avatar */}
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 relative">
             <img 
               src={vendor.avatar} 
               alt={vendor.name} 
               className="w-full h-full object-cover border-4 border-white shadow-lg"
             />
             {vendor.verificationStatus === 'VERIFIED' && (
               <div className="absolute -bottom-3 -right-3 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white">
                 <BadgeCheck size={20} />
               </div>
             )}
          </div>

          {/* Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-serif italic mb-2">{vendor.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={14} /> Paris, France</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {isFollowing ? '12.5K' : '12.4K'} Followers</span>
                  <span className="flex items-center gap-1"><Star size={14} className="fill-luxury-gold text-luxury-gold" /> 4.9 Rating</span>
                </div>
              </div>
              <div className="flex gap-3">
                 <button 
                   onClick={handleFollow}
                   className={`px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                       isFollowing 
                       ? 'bg-white border border-black text-black' 
                       : 'bg-black text-white hover:bg-luxury-gold border border-transparent'
                   }`}
                 >
                   {isFollowing && <Check size={14} />}
                   {isFollowing ? 'Following' : 'Follow'}
                 </button>
                 <button 
                   onClick={handleShare}
                   className="border border-gray-200 p-3 hover:border-black transition-colors"
                   title="Share Profile"
                 >
                   <Share2 size={16} />
                 </button>
              </div>
            </div>

            <p className="text-gray-600 font-light leading-relaxed max-w-2xl mb-8">
              {vendor.bio} Known for architectural silhouettes and a commitment to sustainable luxury. 
              Each piece is handcrafted in our atelier, ensuring the highest standards of quality and ethical production.
            </p>

            <div className="flex gap-6 border-t border-gray-100 pt-6">
              <a href="#" className="text-gray-400 hover:text-black transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-black transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-black transition-colors"><Globe size={20} /></a>
            </div>
          </div>
        </div>

        {/* Collection */}
        <div className="py-24">
          <div className="flex justify-between items-end mb-12">
             <h2 className="text-3xl font-serif italic">Latest Collection</h2>
             <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{vendorProducts.length} Items</span>
          </div>

          {vendorProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p>No products currently available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
              {vendorProducts.map((product) => (
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
                    
                    {product.isNewSeason && (
                      <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
                        New Season
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 opacity-0 group-hover:opacity-100 flex items-end justify-center pb-8">
                      <button className="bg-white text-black text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-luxury-black hover:text-white transition-all duration-500 shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                        View Piece
                      </button>
                    </div>
                    
                    <button className="absolute top-4 right-4 text-white mix-blend-difference hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 duration-500">
                      <Heart size={20} strokeWidth={1.5} />
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
          )}
        </div>
      </div>
    </div>
  );
};