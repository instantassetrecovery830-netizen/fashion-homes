
import React, { useState } from 'react';
import { BadgeCheck, MapPin, Users, Star, ArrowLeft, Heart, Share2, Instagram, Twitter, Globe, Check, X, Link, Facebook, Mail, Video } from 'lucide-react';
import { Vendor, Product, ViewState } from '../types';

interface VendorProfileViewProps {
  vendor: Vendor;
  onProductSelect: (product: Product) => void;
  onNavigate: (view: ViewState) => void;
  products: Product[];
  savedItems?: Product[];
  onToggleSave?: (product: Product) => void;
  onToggleFollow?: (vendor: Vendor) => Promise<void>;
  isFollowing?: boolean;
  followerCount?: number;
}

export const VendorProfileView: React.FC<VendorProfileViewProps> = ({ 
  vendor, 
  onProductSelect, 
  onNavigate, 
  products, 
  savedItems = [], 
  onToggleSave,
  onToggleFollow,
  isFollowing = false,
  followerCount = 0
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Filter products for this specific vendor from the passed active products
  const vendorProducts = products.filter(p => p.designer === vendor.name);
  const isSaved = (productId: string) => savedItems.some(p => p.id === productId);

  // Define Theme Styles
  const themes = {
      MINIMALIST: {
          bg: 'bg-white',
          text: 'text-black',
          subText: 'text-gray-500',
          accent: 'text-luxury-gold',
          border: 'border-gray-100',
          button: 'bg-black text-white hover:bg-luxury-gold',
          secondaryButton: 'bg-white text-black border border-black',
          cardBg: 'bg-white',
          coverOpacity: 'opacity-50'
      },
      DARK: {
          bg: 'bg-zinc-900',
          text: 'text-white',
          subText: 'text-gray-400',
          accent: 'text-white',
          border: 'border-zinc-800',
          button: 'bg-white text-black hover:bg-gray-200',
          secondaryButton: 'bg-zinc-800 text-white border border-zinc-700',
          cardBg: 'bg-zinc-800',
          coverOpacity: 'opacity-40'
      },
      GOLD: {
          bg: 'bg-[#FDFCF8]',
          text: 'text-[#4A3B2A]',
          subText: 'text-[#8B7E6A]',
          accent: 'text-[#C5A059]',
          border: 'border-[#E8E0D5]',
          button: 'bg-[#C5A059] text-white hover:bg-[#B08D48]',
          secondaryButton: 'bg-transparent text-[#C5A059] border border-[#C5A059]',
          cardBg: 'bg-white',
          coverOpacity: 'opacity-60'
      }
  };

  const currentTheme = themes[vendor.visualTheme || 'MINIMALIST'];

  const handleFollowClick = () => {
    if (onToggleFollow) {
        onToggleFollow(vendor);
    }
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSocialShare = (platform: string) => {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`Check out ${vendor.name} on MyFitStore.`);
      let shareUrl = '';

      switch(platform) {
          case 'twitter':
              shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
              break;
          case 'facebook':
              shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
              break;
          case 'email':
              shareUrl = `mailto:?subject=${text}&body=${url}`;
              break;
      }
      
      if (shareUrl) window.open(shareUrl, '_blank');
  };

  return (
    <div className={`min-h-screen animate-fade-in relative ${currentTheme.bg}`}>
      {/* Share Modal Overlay */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md p-8 shadow-2xl relative animate-slide-up text-black">
                <button 
                    onClick={() => setShowShareModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                >
                    <X size={24} />
                </button>
                
                <h3 className="text-2xl font-serif italic mb-2 text-center">Share Profile</h3>
                <p className="text-center text-gray-500 text-sm mb-8">Spread the word about {vendor.name}</p>

                <div className="grid grid-cols-4 gap-4 mb-8">
                     {/* Copy Link */}
                     <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 group">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${linkCopied ? 'bg-green-100 text-green-600' : 'bg-gray-50 group-hover:bg-black group-hover:text-white'}`}>
                            {linkCopied ? <Check size={20} /> : <Link size={20} />}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{linkCopied ? 'Copied' : 'Copy'}</span>
                     </button>

                     {/* Twitter */}
                     <button onClick={() => handleSocialShare('twitter')} className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                            <Twitter size={20} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Twitter</span>
                     </button>
                     
                     {/* Facebook */}
                      <button onClick={() => handleSocialShare('facebook')} className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                            <Facebook size={20} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Facebook</span>
                     </button>

                     {/* Email */}
                      <button onClick={() => handleSocialShare('email')} className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                            <Mail size={20} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Email</span>
                     </button>
                </div>

                <div className="bg-gray-50 p-3 flex items-center justify-between border border-gray-100">
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">{window.location.href}</span>
                    <button onClick={handleCopyLink} className="text-xs font-bold uppercase tracking-widest hover:text-luxury-gold px-2">
                        {linkCopied ? 'Copied' : 'Copy Link'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden">
         <img 
           src={vendor.avatar} 
           alt="Cover" 
           className={`w-full h-full object-cover blur-sm scale-110 ${currentTheme.coverOpacity}`}
         />
         <div className="absolute inset-0 bg-black/10" />
         <button 
           onClick={() => onNavigate('DESIGNERS')}
           className="absolute top-8 left-6 md:left-12 flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-colors z-20"
         >
           <ArrowLeft size={16} /> Back to Designers
         </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative -mt-20 z-10 pb-24">
        <div className={`${currentTheme.cardBg} p-8 md:p-12 shadow-sm border ${currentTheme.border} flex flex-col md:flex-row items-start gap-8 md:gap-16 transition-colors`}>
          
          {/* Avatar */}
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 relative">
             <img 
               src={vendor.avatar} 
               alt={vendor.name} 
               className={`w-full h-full object-cover border-4 shadow-lg ${vendor.visualTheme === 'DARK' ? 'border-zinc-800' : 'border-white'}`}
             />
             {vendor.verificationStatus === 'VERIFIED' && (
               <div className={`absolute -bottom-3 -right-3 bg-blue-500 text-white p-1.5 rounded-full border-4 ${vendor.visualTheme === 'DARK' ? 'border-zinc-800' : 'border-white'}`}>
                 <BadgeCheck size={20} />
               </div>
             )}
          </div>

          {/* Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className={`text-3xl md:text-5xl font-serif italic mb-2 ${currentTheme.text}`}>{vendor.name}</h1>
                <div className={`flex items-center gap-4 text-sm ${currentTheme.subText}`}>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {vendor.location || 'Global'}</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {followerCount} Followers</span>
                  {/* <span className="flex items-center gap-1"><Star size={14} className={`fill-current ${currentTheme.accent}`} /> 4.9 Rating</span> */}
                </div>
              </div>
              <div className="flex gap-3">
                 <button 
                   onClick={handleFollowClick}
                   className={`px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                       isFollowing 
                       ? currentTheme.secondaryButton
                       : currentTheme.button
                   }`}
                 >
                   {isFollowing && <Check size={14} />}
                   {isFollowing ? 'Following' : 'Follow'}
                 </button>
                 <button 
                   onClick={handleShareClick}
                   className={`border ${currentTheme.border} p-3 hover:opacity-70 transition-colors ${currentTheme.text}`}
                   title="Share Profile"
                 >
                   <Share2 size={16} />
                 </button>
              </div>
            </div>

            <p className={`${currentTheme.subText} font-light leading-relaxed max-w-2xl mb-8`}>
              {vendor.bio} Known for architectural silhouettes and a commitment to sustainable luxury. 
              Each piece is handcrafted in our atelier, ensuring the highest standards of quality and ethical production.
            </p>

            <div className={`flex gap-6 border-t ${currentTheme.border} pt-6`}>
              <a href={vendor.instagram || "#"} className={`${currentTheme.subText} hover:${currentTheme.text} transition-colors`}><Instagram size={20} /></a>
              <a href={vendor.tiktok || "#"} className={`${currentTheme.subText} hover:${currentTheme.text} transition-colors`}><Video size={20} /></a>
              <a href={vendor.website || "#"} className={`${currentTheme.subText} hover:${currentTheme.text} transition-colors`}><Globe size={20} /></a>
            </div>
          </div>
        </div>

        {/* Moodboard / Gallery Section */}
        {((vendor.gallery && vendor.gallery.length > 0) || vendor.videoUrl) && (
            <div className="py-16">
                <div className="flex items-center gap-4 mb-8">
                    <div className={`h-px flex-1 ${currentTheme.border.replace('border', 'bg')}`} />
                    <h2 className={`text-xl font-serif italic ${currentTheme.text}`}>The Moodboard</h2>
                    <div className={`h-px flex-1 ${currentTheme.border.replace('border', 'bg')}`} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vendor.videoUrl && (
                        <div className="aspect-square bg-gray-100 overflow-hidden group relative col-span-2 row-span-2">
                            <video 
                                src={vendor.videoUrl} 
                                className="w-full h-full object-cover"
                                controls
                                muted
                                loop
                            />
                        </div>
                    )}
                    {vendor.gallery?.map((img, idx) => (
                        <div key={idx} className="aspect-square bg-gray-100 overflow-hidden group">
                            <img 
                                src={img} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale hover:grayscale-0"
                                alt={`Moodboard ${idx + 1}`} 
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Collection */}
        <div className="py-16">
          <div className="flex justify-between items-end mb-12">
             <h2 className={`text-3xl font-serif italic ${currentTheme.text}`}>Latest Collection</h2>
             <span className={`text-xs font-bold uppercase tracking-widest ${currentTheme.subText}`}>{vendorProducts.length} Items</span>
          </div>

          {vendorProducts.length === 0 ? (
            <div className={`text-center py-20 ${currentTheme.subText}`}>
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
                  <div className={`relative aspect-[3/4] overflow-hidden mb-6 ${vendor.visualTheme === 'DARK' ? 'bg-zinc-800' : 'bg-gray-100'}`}>
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
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(product); }}
                        className={`absolute top-4 right-4 transition-transform hover:scale-110 duration-300 opacity-0 group-hover:opacity-100 ${isSaved(product.id) ? 'opacity-100 text-luxury-gold' : 'text-white mix-blend-difference'}`}
                    >
                      <Heart size={20} strokeWidth={1.5} fill={isSaved(product.id) ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-xs font-bold uppercase tracking-widest mb-1 ${currentTheme.text}`}>{product.designer}</h3>
                      <p className={`font-serif italic transition-colors ${currentTheme.subText} group-hover:${currentTheme.text}`}>{product.name}</p>
                    </div>
                    <span className={`text-sm font-medium ${currentTheme.text}`}>${product.price}</span>
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
