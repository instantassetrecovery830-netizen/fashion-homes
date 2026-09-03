import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, ShoppingBag, Share2, Sparkles, CheckCircle2, ArrowRight, 
  User, Calendar, Clock, Lock, ShieldCheck, ChevronRight
} from 'lucide-react';
import { Product, ViewState, SharedWishlist } from '../types.ts';
import { fetchSharedWishlistFromDb } from '../services/dataService.ts';
import { ShareWishlistModal } from './ShareWishlistModal.tsx';

interface SharedWishlistViewProps {
  products: Product[];
  onAddToCart: (product: Product, size?: string) => void;
  onToggleSave: (product: Product) => void;
  savedItems?: Product[];
  onNavigate: (view: ViewState) => void;
  onProductSelect: (product: Product) => void;
}

export const SharedWishlistView: React.FC<SharedWishlistViewProps> = ({
  products,
  onAddToCart,
  onToggleSave,
  savedItems = [],
  onNavigate,
  onProductSelect
}) => {
  const [wishlistData, setWishlistData] = useState<SharedWishlist | null>(null);
  const [resolvedProducts, setResolvedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const parseQueryAndLoad = async () => {
      setIsLoading(true);
      const searchParams = new URLSearchParams(window.location.search);
      const wishlistId = searchParams.get('id') || searchParams.get('wishlist');
      const itemsParam = searchParams.get('items') || searchParams.get('outfit');

      if (wishlistId) {
        try {
          const fetched = await fetchSharedWishlistFromDb(wishlistId);
          if (fetched) {
            setWishlistData(fetched);
            // Match product objects
            const matched = fetched.productIds
              .map(id => products.find(p => p.id === id))
              .filter((p): p is Product => p !== undefined);
            
            setResolvedProducts(matched);
          }
        } catch (e) {
          console.error("Error fetching shared wishlist:", e);
        }
      } 

      // Fallback: parse direct comma-separated product IDs from query string
      if ((!wishlistData || resolvedProducts.length === 0) && itemsParam) {
        const ids = itemsParam.split(',').map(s => s.trim()).filter(Boolean);
        const matched = ids
          .map(id => products.find(p => p.id === id))
          .filter((p): p is Product => p !== undefined);

        setResolvedProducts(matched);
        if (!wishlistData) {
          setWishlistData({
            id: 'shared_query',
            title: 'Shared Curated Wardrobe',
            ownerName: 'Maison Connoisseur',
            productIds: ids,
            createdAt: new Date().toISOString(),
            note: 'A curated selection of luxury fashion items.'
          });
        }
      }

      setIsLoading(false);
    };

    parseQueryAndLoad();
  }, [products]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddAllToCart = () => {
    if (resolvedProducts.length === 0) return;
    resolvedProducts.forEach(p => {
      const defaultSize = p.sizes && p.sizes.length > 0 ? p.sizes[0] : 'M';
      onAddToCart(p, defaultSize);
    });
    showToast(`Added all ${resolvedProducts.length} items to your Shopping Bag!`);
  };

  const handleSaveAllToWardrobe = () => {
    if (resolvedProducts.length === 0) return;
    let savedCount = 0;
    resolvedProducts.forEach(p => {
      const isAlreadySaved = savedItems.some(s => s.id === p.id);
      if (!isAlreadySaved) {
        onToggleSave(p);
        savedCount++;
      }
    });
    showToast(savedCount > 0 ? `Saved ${savedCount} new items to Your Wardrobe!` : `All items are already in Your Wardrobe.`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const isSaved = (productId: string) => savedItems.some(s => s.id === productId);

  return (
    <div className="min-h-screen bg-luxury-cream/30 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-luxury-black text-white px-6 py-3.5 rounded-sm shadow-2xl border border-luxury-gold/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={18} className="text-luxury-gold shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
          <button onClick={() => onNavigate('LANDING')} className="hover:text-black">Home</button>
          <ChevronRight size={12} />
          <button onClick={() => onNavigate('MARKETPLACE')} className="hover:text-black">Collections</button>
          <ChevronRight size={12} />
          <span className="text-luxury-black">Shared Wardrobe</span>
        </div>

        {/* Hero Header Section */}
        <div className="bg-luxury-black text-white p-8 md:p-12 rounded-sm relative overflow-hidden shadow-xl border border-luxury-gold/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-gold/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-luxury-gold/20 border border-luxury-gold/40 text-luxury-gold text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">
              <Sparkles size={12} /> Curated Luxury Capsule
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif italic text-white leading-tight">
              {wishlistData?.title || 'Curated Wardrobe Collection'}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-300 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <User size={14} className="text-luxury-gold" />
                <span>Curated by: <strong className="text-white font-medium">{wishlistData?.ownerName || 'Maison Connoisseur'}</strong></span>
              </div>

              {wishlistData?.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-luxury-gold" />
                  <span>Created: {new Date(wishlistData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Heart size={14} className="text-luxury-gold" />
                <span>{resolvedProducts.length} Selected Pieces</span>
              </div>
            </div>

            {wishlistData?.note && (
              <blockquote className="mt-4 p-4 bg-white/5 border-l-2 border-luxury-gold text-gray-300 italic font-serif text-sm">
                "{wishlistData.note}"
              </blockquote>
            )}
          </div>

          {/* Action Toolbar Inside Hero */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleAddAllToCart}
                disabled={resolvedProducts.length === 0}
                className="px-6 py-3 bg-white text-luxury-black hover:bg-luxury-gold hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 rounded-sm shadow-md disabled:opacity-50"
              >
                <ShoppingBag size={15} /> Add All To My Cart
              </button>

              <button
                onClick={handleSaveAllToWardrobe}
                disabled={resolvedProducts.length === 0}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black transition-colors text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 rounded-sm disabled:opacity-50"
              >
                <Heart size={15} /> Save All To Wardrobe
              </button>
            </div>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-5 py-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 rounded-sm"
            >
              <Share2 size={15} /> Share This Collection
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
            <h2 className="text-xl font-serif italic text-luxury-black">
              Included Collection Items ({resolvedProducts.length})
            </h2>
            <button
              onClick={() => onNavigate('MARKETPLACE')}
              className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black flex items-center gap-1"
            >
              Explore Full Marketplace <ArrowRight size={14} />
            </button>
          </div>

          {isLoading ? (
            <div className="p-16 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
              Loading Shared Selection...
            </div>
          ) : resolvedProducts.length === 0 ? (
            <div className="bg-white p-16 text-center rounded-sm border border-gray-200 space-y-4">
              <Heart size={48} className="mx-auto text-gray-300" />
              <h3 className="text-lg font-serif italic text-gray-700">No products found in this shared collection</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                The items in this wishlist may no longer be available or the shared link is invalid.
              </p>
              <button
                onClick={() => onNavigate('MARKETPLACE')}
                className="mt-4 px-6 py-3 bg-luxury-black text-white text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors inline-block"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {resolvedProducts.map((product) => {
                const saved = isSaved(product.id);

                return (
                  <div 
                    key={product.id}
                    className="bg-white border border-gray-100 rounded-sm overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image Container */}
                      <div 
                        className="relative aspect-[3/4] bg-gray-100 overflow-hidden cursor-pointer"
                        onClick={() => {
                          onProductSelect(product);
                          onNavigate('PRODUCT_DETAIL');
                        }}
                      >
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Save Button Overlay */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(product);
                            showToast(saved ? `Removed ${product.name} from Wardrobe` : `Saved ${product.name} to Wardrobe`);
                          }}
                          className="absolute top-3 right-3 p-2.5 rounded-full bg-white/80 backdrop-blur-xs text-luxury-black hover:bg-white shadow-md transition-colors"
                          title={saved ? "Saved in Wardrobe" : "Save to Wardrobe"}
                        >
                          <Heart size={16} fill={saved ? "#C5A059" : "none"} className={saved ? "text-luxury-gold" : "text-luxury-black"} />
                        </button>

                        {/* Designer Badge */}
                        <div className="absolute bottom-3 left-3 bg-luxury-black/80 text-white backdrop-blur-xs px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-xs">
                          {product.designer}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-5 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{product.category}</p>
                        <h3 
                          onClick={() => {
                            onProductSelect(product);
                            onNavigate('PRODUCT_DETAIL');
                          }}
                          className="text-sm font-serif italic text-luxury-black hover:text-luxury-gold transition-colors cursor-pointer line-clamp-1"
                        >
                          {product.name}
                        </h3>
                        <p className="text-sm font-bold text-luxury-black">{formatPrice(product.price)}</p>
                      </div>
                    </div>

                    {/* Quick Add To Cart Button */}
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => {
                          const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M';
                          onAddToCart(product, defaultSize);
                          showToast(`Added ${product.name} to your Shopping Bag!`);
                        }}
                        className="w-full py-3 bg-gray-50 border border-gray-200 text-luxury-black hover:bg-luxury-black hover:text-white transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-sm"
                      >
                        <ShoppingBag size={14} /> Add To Bag
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareWishlistModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        savedItems={resolvedProducts}
        currentUser={null}
      />
    </div>
  );
};

export default SharedWishlistView;
