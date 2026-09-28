import React, { useState } from 'react';
import { 
  BadgeCheck, MapPin, Users, Star, ArrowLeft, Heart, Share2, Instagram, 
  Twitter, Globe, Check, X, Link, Facebook, Mail, Video, Sparkles,
  Quote, ShieldCheck, BookOpen, Layers, MessageCircle, ChevronDown
} from 'lucide-react';
import { Vendor, Product, ViewState } from '../types.ts';
import { useCurrency } from '../context/CurrencyContext.tsx';

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
  onMessageClick?: (vendorId: string) => void;
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
  followerCount = 0,
  onMessageClick
}) => {
  const { formatPrice } = useCurrency();
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Filter products for this specific vendor
  const vendorProducts = products.filter(p => p.designer === vendor.name || (p.vendorId && p.vendorId === vendor.id));
  const isSaved = (productId: string) => savedItems.some(p => p.id === productId);

  // Define Theme Styles with expanded palette
  const themes: Record<string, {
    bg: string;
    text: string;
    subText: string;
    accent: string;
    border: string;
    button: string;
    secondaryButton: string;
    cardBg: string;
    storyCardBg: string;
    coverOpacity: string;
  }> = {
    MINIMALIST: {
      bg: 'bg-white',
      text: 'text-black',
      subText: 'text-gray-500',
      accent: 'text-luxury-gold',
      border: 'border-gray-100',
      button: 'bg-black text-white hover:bg-luxury-gold hover:text-black',
      secondaryButton: 'bg-white text-black border border-black hover:bg-gray-50',
      cardBg: 'bg-white',
      storyCardBg: 'bg-gray-50/70',
      coverOpacity: 'opacity-50'
    },
    DARK: {
      bg: 'bg-zinc-950',
      text: 'text-white',
      subText: 'text-zinc-400',
      accent: 'text-luxury-gold',
      border: 'border-zinc-800',
      button: 'bg-white text-black hover:bg-zinc-200',
      secondaryButton: 'bg-zinc-900 text-white border border-zinc-700 hover:bg-zinc-800',
      cardBg: 'bg-zinc-900',
      storyCardBg: 'bg-zinc-900/80',
      coverOpacity: 'opacity-40'
    },
    GOLD: {
      bg: 'bg-[#FDFCF8]',
      text: 'text-[#3E3224]',
      subText: 'text-[#7D6F5E]',
      accent: 'text-[#C5A059]',
      border: 'border-[#EAE2D5]',
      button: 'bg-[#C5A059] text-white hover:bg-[#B08D48]',
      secondaryButton: 'bg-transparent text-[#C5A059] border border-[#C5A059] hover:bg-[#C5A059]/10',
      cardBg: 'bg-white',
      storyCardBg: 'bg-[#FAF7F0]',
      coverOpacity: 'opacity-60'
    },
    'AVANT-GARDE': {
      bg: 'bg-stone-50',
      text: 'text-stone-900',
      subText: 'text-stone-500',
      accent: 'text-black',
      border: 'border-stone-200',
      button: 'bg-stone-900 text-white hover:bg-black',
      secondaryButton: 'bg-stone-100 text-stone-900 border border-stone-300 hover:bg-stone-200',
      cardBg: 'bg-white',
      storyCardBg: 'bg-stone-100/60',
      coverOpacity: 'opacity-50'
    },
    CLASSIC: {
      bg: 'bg-[#FAF8F5]',
      text: 'text-[#222222]',
      subText: 'text-[#666666]',
      accent: 'text-[#8C6D46]',
      border: 'border-[#E5DFD7]',
      button: 'bg-[#222222] text-white hover:bg-[#8C6D46]',
      secondaryButton: 'bg-white text-[#222222] border border-[#CCCCCC] hover:bg-gray-50',
      cardBg: 'bg-white',
      storyCardBg: 'bg-[#F5F0E8]',
      coverOpacity: 'opacity-55'
    },
    'HAUTE-COUTURE': {
      bg: 'bg-[#121214]',
      text: 'text-[#F5F5F7]',
      subText: 'text-[#A1A1A6]',
      accent: 'text-[#E5C158]',
      border: 'border-[#26262B]',
      button: 'bg-[#E5C158] text-black font-bold hover:bg-white',
      secondaryButton: 'bg-[#1C1C21] text-white border border-[#383842] hover:bg-[#2A2A33]',
      cardBg: 'bg-[#1A1A1F]',
      storyCardBg: 'bg-[#16161B]',
      coverOpacity: 'opacity-40'
    }
  };

  const currentTheme = themes[vendor.visualTheme || 'MINIMALIST'] || themes.MINIMALIST;

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
    const text = encodeURIComponent(`Explore ${vendor.name} on MyFitStore Haute Horlogerie & Fashion.`);
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

  const hasCustomHero = Boolean(vendor.heroBanner);
  const hasBrandStory = Boolean(vendor.brandStory || vendor.storyTitle || vendor.artisanQuote);

  return (
    <div className={`min-h-screen animate-fade-in relative ${currentTheme.bg}`}>
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md p-8 shadow-2xl relative animate-slide-up text-black">
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-serif italic mb-2 text-center">Share Atelier Profile</h3>
            <p className="text-center text-gray-500 text-sm mb-8">Share {vendor.name}'s collections with fellow collectors</p>

            <div className="grid grid-cols-4 gap-4 mb-8">
              <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 group">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${linkCopied ? 'bg-green-100 text-green-600' : 'bg-gray-50 group-hover:bg-black group-hover:text-white'}`}>
                  {linkCopied ? <Check size={20} /> : <Link size={20} />}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{linkCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button onClick={() => handleSocialShare('twitter')} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <Twitter size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Twitter</span>
              </button>
              
              <button onClick={() => handleSocialShare('facebook')} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <Facebook size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Facebook</span>
              </button>

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

      {/* Hero Banner Section */}
      {hasCustomHero ? (
        /* Bespoke Verified Atelier Hero Banner */
        <div className="relative w-full h-[450px] md:h-[550px] overflow-hidden bg-black flex items-end">
          <img 
            src={vendor.heroBanner} 
            alt={vendor.name} 
            className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Custom Overlay Opacity */}
          <div 
            className="absolute inset-0 transition-all"
            style={{ backgroundColor: `rgba(0,0,0, ${(vendor.heroOverlayOpacity ?? 40) / 100})` }}
          />

          <button 
            onClick={() => onNavigate('DESIGNERS')}
            className="absolute top-8 left-6 md:left-12 flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-colors z-20 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
          >
            <ArrowLeft size={14} /> Back to Designers
          </button>

          {/* Banner Tagline & Headline Overlays */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-16 w-full text-white">
            <div className="max-w-3xl space-y-3 animate-fade-in">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.25em] text-luxury-gold bg-black/60 px-3.5 py-1.5 rounded-full border border-luxury-gold/40 backdrop-blur-md">
                <Sparkles size={12} /> Verified Atelier Collection
              </span>
              <h1 className="text-4xl md:text-6xl font-serif italic tracking-wide text-white drop-shadow-lg leading-tight">
                {vendor.heroHeadline || vendor.name}
              </h1>
              <p className="text-sm md:text-base text-gray-200 font-light max-w-2xl drop-shadow leading-relaxed">
                {vendor.heroTagline || vendor.bio}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Cover Banner */
        <div className="h-64 md:h-80 w-full relative overflow-hidden bg-zinc-900">
          <img 
            src={vendor.coverImage || vendor.avatar} 
            alt="Cover" 
            className={`w-full h-full object-cover blur-sm scale-110 ${currentTheme.coverOpacity}`}
          />
          <div className="absolute inset-0 bg-black/25" />
          <button 
            onClick={() => onNavigate('DESIGNERS')}
            className="absolute top-8 left-6 md:left-12 flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-colors z-20 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <ArrowLeft size={14} /> Back to Designers
          </button>
        </div>
      )}

      {/* Main Profile Info Card */}
      <div className="max-w-7xl mx-auto px-6 relative -mt-16 md:-mt-20 z-10 pb-16">
        <div className={`${currentTheme.cardBg} p-8 md:p-12 shadow-xl border ${currentTheme.border} flex flex-col md:flex-row items-start gap-8 md:gap-16 transition-colors rounded-sm`}>
          
          {/* Avatar Seal */}
          <div className="w-32 h-32 md:w-44 md:h-44 shrink-0 relative">
            <img 
              src={vendor.avatar} 
              alt={vendor.name} 
              className={`w-full h-full object-cover border-4 shadow-lg ${vendor.visualTheme === 'DARK' ? 'border-zinc-800' : 'border-white'}`}
            />
            {vendor.verificationStatus === 'VERIFIED' && (
              <div 
                className="absolute -bottom-3 -right-3 bg-blue-600 text-white p-2 rounded-full border-4 border-white shadow-md flex items-center justify-center"
                title="Verified Atelier by MyFitStore"
              >
                <BadgeCheck size={20} />
              </div>
            )}
          </div>

          {/* Info & Core Bio */}
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className={`text-3xl md:text-5xl font-serif italic mb-1 ${currentTheme.text}`}>{vendor.name}</h1>
                  {vendor.verificationStatus === 'VERIFIED' && (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  )}
                </div>
                <div className={`flex flex-wrap items-center gap-4 text-xs ${currentTheme.subText} mt-1`}>
                  <span className="flex items-center gap-1"><MapPin size={13} /> {vendor.location || 'Global Atelier'}</span>
                  <span className="flex items-center gap-1"><Users size={13} /> {followerCount} Followers</span>
                  {vendor.subscriptionPlan && (
                    <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-gold bg-luxury-gold/10 px-2 py-0.5 rounded border border-luxury-gold/20">
                      {vendor.subscriptionPlan} Tier
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={handleFollowClick}
                  className={`px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm ${
                    isFollowing ? currentTheme.secondaryButton : currentTheme.button
                  }`}
                >
                  {isFollowing && <Check size={14} />}
                  {isFollowing ? 'Following' : 'Follow Atelier'}
                </button>

                {onMessageClick && (
                  <button
                    onClick={() => onMessageClick(vendor.id)}
                    className={`border ${currentTheme.border} p-3 hover:opacity-70 transition-colors ${currentTheme.text} flex items-center gap-1.5`}
                    title="Send Atelier Inquiry"
                  >
                    <MessageCircle size={16} />
                  </button>
                )}

                <button 
                  onClick={handleShareClick}
                  className={`border ${currentTheme.border} p-3 hover:opacity-70 transition-colors ${currentTheme.text}`}
                  title="Share Profile"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            <p className={`${currentTheme.subText} font-light leading-relaxed max-w-2xl mb-8 text-sm md:text-base`}>
              {vendor.bio || "Exquisite artisanal craftsmanship, sustainable bespoke tailoring, and architectural silhouettes handcrafted in our signature atelier."}
            </p>

            <div className={`flex gap-6 border-t ${currentTheme.border} pt-6`}>
              {vendor.instagram && (
                <a href={vendor.instagram.startsWith('http') ? vendor.instagram : `https://instagram.com/${vendor.instagram}`} target="_blank" rel="noopener noreferrer" className={`${currentTheme.subText} hover:${currentTheme.text} transition-colors flex items-center gap-1 text-xs`}><Instagram size={17} /> <span>Instagram</span></a>
              )}
              {vendor.tiktok && (
                <a href={vendor.tiktok.startsWith('http') ? vendor.tiktok : `https://tiktok.com/@${vendor.tiktok}`} target="_blank" rel="noopener noreferrer" className={`${currentTheme.subText} hover:${currentTheme.text} transition-colors flex items-center gap-1 text-xs`}><Video size={17} /> <span>TikTok</span></a>
              )}
              {vendor.website && (
                <a href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} target="_blank" rel="noopener noreferrer" className={`${currentTheme.subText} hover:${currentTheme.text} transition-colors flex items-center gap-1 text-xs`}><Globe size={17} /> <span>Website</span></a>
              )}
            </div>
          </div>
        </div>

        {/* Brand Story & Atelier Craftsmanship Section */}
        {hasBrandStory && (
          <div className="py-16">
            <div className={`${currentTheme.storyCardBg} border ${currentTheme.border} p-8 md:p-14 rounded-sm shadow-sm space-y-10`}>
              <div className="border-b border-gray-200/40 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-luxury-gold flex items-center gap-1.5 mb-1">
                    <BookOpen size={13} /> The Maison's Heritage
                  </span>
                  <h2 className={`text-2xl md:text-4xl font-serif italic ${currentTheme.text}`}>
                    {vendor.storyTitle || "The Atelier Story & Craftsmanship"}
                  </h2>
                  {vendor.storySubtitle && (
                    <p className={`text-xs md:text-sm font-light mt-1 ${currentTheme.subText}`}>
                      {vendor.storySubtitle}
                    </p>
                  )}
                </div>

                {vendor.brandManifesto && (
                  <div className="text-right hidden md:block">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 block font-bold">Atelier Manifesto</span>
                    <span className="text-xs italic text-luxury-gold font-serif">{vendor.brandManifesto}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Story Narrative Text */}
                <div className="lg:col-span-7 space-y-6">
                  {vendor.brandStory ? (
                    <div className={`space-y-4 text-sm md:text-base leading-relaxed font-light ${currentTheme.subText}`}>
                      {vendor.brandStory.split('\n\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm md:text-base leading-relaxed font-light ${currentTheme.subText}`}>
                      Each bespoke collection from {vendor.name} is drafted, cut, and assembled with strict adherence to master tailoring principles. By fusing ethical provenance with avant-garde draping, our atelier redefines contemporary slow luxury.
                    </p>
                  )}

                  {vendor.brandManifesto && (
                    <div className="p-4 bg-luxury-gold/5 border-l-2 border-luxury-gold text-xs leading-relaxed text-gray-700 italic md:hidden">
                      <strong className="block not-italic font-bold uppercase text-[9px] text-luxury-gold mb-1">Brand Manifesto</strong>
                      {vendor.brandManifesto}
                    </div>
                  )}
                </div>

                {/* Artisan Quote Spotlight & Craft Card */}
                <div className="lg:col-span-5 space-y-6">
                  {vendor.artisanQuote && (
                    <div className={`${currentTheme.cardBg} border ${currentTheme.border} p-6 md:p-8 rounded-sm shadow-md relative overflow-hidden`}>
                      <Quote size={40} className="text-luxury-gold/20 absolute -top-2 -left-2 pointer-events-none" />
                      <p className={`text-base md:text-lg font-serif italic relative z-10 leading-relaxed ${currentTheme.text}`}>
                        {vendor.artisanQuote}
                      </p>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="font-bold uppercase tracking-wider text-black">
                          {vendor.artisanQuoteAuthor || vendor.name}
                        </span>
                        <span className="text-[10px] text-luxury-gold uppercase font-bold tracking-widest">
                          Master Artisan
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Craftsmanship Workshop Photos */}
                  {vendor.storyImages && vendor.storyImages.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-2">
                        Atelier Craftsmanship In Detail
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {vendor.storyImages.map((img, idx) => (
                          <div key={idx} className="aspect-square bg-gray-200 overflow-hidden rounded-xs border border-gray-100 group">
                            <img 
                              src={img} 
                              alt={`Craftsmanship ${idx + 1}`} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Moodboard / Video Section */}
        {((vendor.gallery && vendor.gallery.length > 0) || vendor.videoUrl) && (
          <div className="py-16">
            <div className="flex items-center gap-4 mb-8">
              <div className={`h-px flex-1 ${currentTheme.border.replace('border', 'bg')}`} />
              <h2 className={`text-xl font-serif italic ${currentTheme.text}`}>The Moodboard & Studio Visuals</h2>
              <div className={`h-px flex-1 ${currentTheme.border.replace('border', 'bg')}`} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vendor.videoUrl && (
                <div className="aspect-square bg-gray-100 overflow-hidden group relative col-span-2 row-span-2 rounded-xs shadow-sm">
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
                <div key={idx} className="aspect-square bg-gray-100 overflow-hidden group rounded-xs border border-gray-100">
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

        {/* Collection Grid */}
        <div className="py-16">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className={`text-3xl font-serif italic ${currentTheme.text}`}>Current Collection</h2>
              <p className={`text-xs mt-1 ${currentTheme.subText}`}>Pieces currently available directly from this atelier</p>
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${currentTheme.subText}`}>
              {vendorProducts.length} Items Available
            </span>
          </div>

          {vendorProducts.length === 0 ? (
            <div className={`text-center py-20 ${currentTheme.subText} border border-dashed ${currentTheme.border} rounded-sm`}>
              <p className="font-serif italic text-lg">No pieces currently listed in this collection.</p>
              <p className="text-xs text-gray-400 mt-1">Check back soon for upcoming season drops from {vendor.name}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
              {vendorProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="group cursor-pointer"
                  onClick={() => onProductSelect(product)}
                >
                  <div className={`relative aspect-[3/4] overflow-hidden mb-6 ${vendor.visualTheme === 'DARK' ? 'bg-zinc-800' : 'bg-gray-100'} rounded-xs shadow-sm`}>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    
                    {product.isNewSeason && (
                      <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wide shadow-sm">
                        New Season
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/15 transition-opacity duration-500 opacity-0 group-hover:opacity-100 flex items-end justify-center pb-8">
                      <button className="bg-white text-black text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-black hover:text-white transition-all duration-500 shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
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
                    <span className={`text-sm font-medium ${currentTheme.text}`}>{formatPrice(product.price)}</span>
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
