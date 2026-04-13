
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Star, Truck, ShieldCheck, Sparkles, User, Send, AlertCircle, Clock, Ruler, Heart, Video, Camera, X, Loader } from 'lucide-react';
import { Product, Vendor, User as AppUser, Order, Review, ProductVariant } from '../types.ts';
import { getStyleMatch } from '../services/geminiService.ts';
import { fetchProductReviews, submitReview, trackProductEvent } from '../services/dataService.ts';
import { logUserAction } from '../services/loggingService.ts';

interface ProductDetailProps {
  product: Product;
  vendor?: Vendor;
  onAddToCart: (product: Product, size: string, measurements?: string) => void;
  onBack: () => void;
  onViewDesigner?: () => void;
  featureFlags: { enableAiStyleMatch: boolean; enableReviews: boolean; };
  savedItems?: Product[];
  onToggleSave?: (product: Product) => void;
  onMessageClick?: (vendorId: string) => void;
  currentUser?: AppUser | Vendor | null;
  orders?: Order[];
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, vendor, onAddToCart, onBack, onViewDesigner, featureFlags, savedItems = [], onToggleSave, onMessageClick, currentUser, orders = [] }) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [measurements, setMeasurements] = useState('');
  const [styleTip, setStyleTip] = useState<string | null>(null);
  const [loadingStyle, setLoadingStyle] = useState(false);
  const [activeImage, setActiveImage] = useState(product.images?.[0] || product.image);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSaved = useMemo(() => savedItems.some(p => p.id === product.id), [savedItems, product.id]);

  useEffect(() => {
    setActiveImage(product.images?.[0] || product.image);
    setSelectedSize(null);
    setMeasurements('');
    setSizeError(false);
    setStyleTip(null);
    
    // Fetch reviews
    if (featureFlags.enableReviews) {
      fetchProductReviews(product.id).then(setReviews).catch(console.error);
    }

    // Track view event
    trackProductEvent(product.id, product.vendorId, 'VIEW').catch(console.error);
  }, [product, featureFlags.enableReviews]);

  // Eligibility check for reviews
  const canReview = useMemo(() => {
    if (!currentUser) return false;
    // Check if user has a delivered order containing this product
    return orders.some(order => 
      order.status === 'Delivered' && 
      order.items.some(item => item.id === product.id)
    );
  }, [currentUser, orders, product.id]);

  const hasReviewed = useMemo(() => {
    return reviews.some(r => r.userId === currentUser?.id);
  }, [reviews, currentUser?.id]);

  // Use product images if available, otherwise fallback to main image
  const galleryImages = useMemo(() => {
    const images = product.images && product.images.length > 0 
      ? [...product.images] 
      : [product.image];

    if (product.video) {
        images.push(product.video);
    }
    return images;
  }, [product.images, product.image, product.video]);

  const handleStyleMatch = useCallback(async () => {
    setLoadingStyle(true);
    const tip = await getStyleMatch(product.name);
    setStyleTip(tip);
    setLoadingStyle(false);
  }, [product.name]);

  const handleAddToCartClick = useCallback(() => {
    const hasVariants = product.variants && product.variants.length > 0;
    
    if (hasVariants) {
      if (!selectedSize) {
        setSizeError(true);
        return;
      }
      if (!selectedColor) {
        setColorError(true);
        return;
      }
    } else if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }

    setSizeError(false);
    setColorError(false);
    
    // Track cart event
    trackProductEvent(product.id, product.vendorId, 'CART_ADD').catch(console.error);
    if (currentUser) {
        logUserAction(currentUser.id, 'ADD_TO_CART', { productId: product.id, productName: product.name });
    }
    
    onAddToCart(product, selectedSize || 'One Size', measurements);
  }, [selectedSize, selectedColor, product, measurements, onAddToCart]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file as unknown as Blob);
    });
  };

  const removePhoto = (index: number) => {
    setReviewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleReviewSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.trim() || !currentUser) return;
    
    setIsSubmittingReview(true);
    try {
      const review: Review = {
        id: `rev_${Date.now()}`,
        productId: product.id,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.email.split('@')[0],
        rating: newRating,
        text: newReview,
        photos: reviewPhotos.length > 0 ? reviewPhotos : undefined,
        createdAt: new Date().toISOString()
      };
      
      await submitReview(review);
      if (currentUser) {
          logUserAction(currentUser.id, 'SUBMIT_REVIEW', { productId: product.id, rating: newRating });
      }
      setReviews(prev => [review, ...prev]);
      setNewReview('');
      setNewRating(5);
      setReviewPhotos([]);
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  }, [newReview, newRating, currentUser, product.id, reviewPhotos]);

  return (
    <div className="min-h-screen bg-white animate-fade-in pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <button onClick={onBack} className="text-xs uppercase font-bold tracking-widest mb-8 hover:text-luxury-gold transition-colors">
          ← Back to Marketplace
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          {/* Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[3/4] overflow-hidden bg-gray-50 cursor-zoom-in relative group">
              {activeImage === product.video ? (
                  <video 
                    src={activeImage} 
                    controls 
                    autoPlay 
                    loop 
                    muted 
                    className="w-full h-full object-cover" 
                  />
              ) : (
                  <img 
                    src={activeImage} 
                    alt={product.name} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 ease-out" 
                  />
              )}
              {product.isPreOrder && (
                 <div className="absolute top-4 left-4 bg-luxury-gold text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                   <Clock size={12} /> Pre-Order
                 </div>
              )}
              <button 
                onClick={() => onToggleSave && onToggleSave(product)}
                className={`absolute top-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-luxury-gold transition-all ${isSaved ? 'text-luxury-gold bg-white' : 'text-white'}`}
              >
                <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
              </button>
            </div>
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-[3/4] bg-gray-50 overflow-hidden transition-all duration-300 relative ${
                    activeImage === img 
                      ? 'ring-1 ring-black ring-offset-2 opacity-100' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {img === product.video ? (
                      <div className="w-full h-full flex items-center justify-center bg-black/10">
                          <Video size={24} className="text-white drop-shadow-md relative z-10" />
                          <video src={img} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                      </div>
                  ) : (
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="sticky top-32 h-fit space-y-8">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold uppercase tracking-widest">{product.designer}</h2>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-luxury-gold text-luxury-gold" />
                  <span className="text-xs font-medium">{product.rating} ({reviews.length} Reviews)</span>
                </div>
              </div>
              <h1 className="text-4xl font-serif italic mb-4">{product.name}</h1>
              <p className="text-2xl font-light">${product.price}</p>
            </div>

            <p className="text-gray-600 leading-relaxed font-light">
              {product.description} Constructed with precision and tailored for the modern silhouette. 
              This piece embodies the philosophy of {product.designer}, merging utility with high-fashion aesthetics.
            </p>

            {/* Designer Story Section */}
            {vendor && (
                <div className="border-l-2 border-luxury-gold pl-6 py-2 my-8 animate-fade-in">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Designer Story</h4>
                    <div className="flex items-center gap-4 mb-3">
                        <img src={vendor.avatar} alt={vendor.name} className="w-10 h-10 rounded-full object-cover" />
                        <span className="font-serif italic text-lg">{vendor.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3">{vendor.bio}</p>
                    <div className="flex items-center gap-4">
                      <button 
                          onClick={onViewDesigner}
                          className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 hover:text-luxury-gold hover:border-luxury-gold transition-colors"
                      >
                          View Profile
                      </button>
                      {onMessageClick && (
                        <button 
                            onClick={() => onMessageClick(vendor.id)}
                            className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 hover:text-luxury-gold hover:border-luxury-gold transition-colors"
                        >
                            Message Designer
                        </button>
                      )}
                    </div>
                </div>
            )}

            {/* AI Style Match */}
            {featureFlags.enableAiStyleMatch && (
              <div className="p-6 bg-luxury-cream border border-luxury-gold/20 rounded-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-luxury-gold" />
                  <h4 className="text-xs font-bold uppercase tracking-widest">MyFitStore AI Stylist</h4>
                </div>
                {styleTip ? (
                  <p className="text-sm font-serif italic text-gray-700 animate-fade-in">"{styleTip}"</p>
                ) : (
                  <button 
                    onClick={handleStyleMatch}
                    disabled={loadingStyle}
                    className="text-xs underline hover:text-luxury-gold disabled:opacity-50"
                  >
                    {loadingStyle ? 'Curating advice...' : 'Get Styling Advice'}
                  </button>
                )}
              </div>
            )}

            <div className="space-y-6">
              {/* Size Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className={`text-xs font-bold uppercase ${sizeError ? 'text-red-500' : ''}`}>Select Size</p>
                  {sizeError && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> Required</span>}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {product.variants && product.variants.length > 0 ? (
                    Array.from(new Set(product.variants.map(v => v.size))).map(size => (
                      <button
                        key={size}
                        onClick={() => { setSelectedSize(size); setSizeError(false); }}
                        className={`min-w-[48px] h-12 px-3 flex items-center justify-center border text-sm transition-all ${
                          selectedSize === size 
                            ? 'bg-black text-white border-black' 
                            : 'border-gray-200 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))
                  ) : product.sizes && product.sizes.length > 0 ? (
                    product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => { setSelectedSize(size); setSizeError(false); }}
                        className={`min-w-[48px] h-12 px-3 flex items-center justify-center border text-sm transition-all ${
                          selectedSize === size 
                            ? 'bg-black text-white border-black' 
                            : 'border-gray-200 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 italic">One Size Only</span>
                  )}
                </div>
              </div>

              {/* Color Selection (if variants exist) */}
              {product.variants && product.variants.length > 0 && selectedSize && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <p className={`text-xs font-bold uppercase ${colorError ? 'text-red-500' : ''}`}>Select Color</p>
                    {colorError && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> Required</span>}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.variants
                      .filter(v => v.size === selectedSize)
                      .map(variant => (
                        <button
                          key={variant.id}
                          disabled={variant.stock <= 0}
                          onClick={() => { setSelectedColor(variant.color); setColorError(false); }}
                          className={`px-4 h-12 flex items-center justify-center border text-sm transition-all relative ${
                            selectedColor === variant.color 
                              ? 'bg-black text-white border-black' 
                              : 'border-gray-200 hover:border-black'
                          } ${variant.stock <= 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          {variant.color}
                          {variant.stock <= 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] px-1 rounded-full">Out</span>
                          )}
                          {variant.stock > 0 && variant.stock <= 5 && (
                            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] px-1 rounded-full">{variant.stock} left</span>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Custom Measurements Section for Pre-Order */}
              {product.isPreOrder && (
                <div className="pt-4 animate-fade-in border-t border-gray-50 mt-4">
                  <div className="flex items-center gap-2 mb-3 text-luxury-gold">
                    <Ruler size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Custom Measurements</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                     For our made-to-order pieces, we ensure the perfect fit. Please provide your measurements (Bust, Waist, Hips, Height).
                  </p>
                  <textarea
                    value={measurements}
                    onChange={(e) => setMeasurements(e.target.value)}
                    placeholder="e.g. Bust: 85cm, Waist: 64cm, Hips: 92cm, Height: 175cm"
                    className="w-full p-4 border border-gray-200 bg-gray-50 text-sm focus:border-black outline-none min-h-[100px] resize-none font-serif placeholder-gray-400"
                  />
                </div>
              )}
            </div>

            <button 
              onClick={handleAddToCartClick}
              className="hidden md:block w-full bg-black text-white py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors"
            >
              {product.isPreOrder ? 'Pre-Order Now' : 'Add to Bag'}
            </button>
            
            {product.isPreOrder && (
              <p className="text-[10px] text-gray-500 text-center italic">
                * This item is made-to-measure. You will be asked for measurements at checkout.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Truck size={16} />
                <span>Free Express Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} />
                <span>Authenticity Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {featureFlags.enableReviews && (
          <div className="border-t border-gray-100 pt-16">
            <h3 className="text-2xl font-serif italic mb-8">Client Reviews</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Write Review */}
              <div className="bg-gray-50 p-8 h-fit">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Write a Review</h4>
                {!currentUser ? (
                  <p className="text-sm text-gray-500 italic">Please log in to leave a review.</p>
                ) : !canReview ? (
                  <p className="text-sm text-gray-500 italic">You can only review items from orders that have been delivered.</p>
                ) : hasReviewed ? (
                  <p className="text-sm text-gray-500 italic">You have already reviewed this product. Thank you!</p>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className={`transition-colors ${star <= newRating ? 'text-luxury-gold' : 'text-gray-300'}`}
                        >
                          <Star size={20} fill={star <= newRating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      placeholder="Share your thoughts on the fit, fabric, and style..."
                      className="w-full p-4 border border-gray-200 bg-white text-sm focus:border-black outline-none min-h-[120px]"
                      disabled={isSubmittingReview}
                    />
                    
                    {/* Photo Upload */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {reviewPhotos.map((photo, idx) => (
                          <div key={idx} className="relative w-16 h-16 border border-gray-200 rounded-sm overflow-hidden">
                            <img src={photo} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(idx)}
                              className="absolute top-0 right-0 bg-white/80 p-0.5 text-red-500 hover:text-red-700"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        {reviewPhotos.length < 3 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-16 h-16 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-luxury-gold hover:border-luxury-gold transition-colors"
                          >
                            <Camera size={16} />
                            <span className="text-[8px] uppercase mt-1">Add</span>
                          </button>
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handlePhotoUpload} 
                        accept="image/*" 
                        multiple
                        className="hidden" 
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmittingReview || !newReview.trim()}
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-black text-white px-6 py-3 hover:bg-luxury-gold transition-colors disabled:opacity-50"
                    >
                      {isSubmittingReview ? <Loader size={14} className="animate-spin" /> : <Send size={14} />} 
                      Submit Review
                    </button>
                  </form>
                )}
              </div>

              {/* Review List */}
              <div className="space-y-8">
                {reviews.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No reviews yet. Be the first to share your thoughts!</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0 animate-fade-in">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-luxury-black text-white rounded-full flex items-center justify-center text-xs font-bold uppercase">
                            {review.userName.charAt(0)}
                          </div>
                          <span className="text-sm font-bold">{review.userName}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-1 mb-3 text-luxury-gold">
                         {[...Array(5)].map((_, i) => (
                           <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-gray-200'} />
                         ))}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed font-serif italic mb-3">"{review.text}"</p>
                      
                      {/* Display Review Photos */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {review.photos.map((photo, idx) => (
                            <div key={idx} className="w-16 h-16 border border-gray-100 rounded-sm overflow-hidden cursor-zoom-in" onClick={() => setActiveImage(photo)}>
                              <img src={photo} alt={`Review photo ${idx}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar for Mobile */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 md:hidden z-40 flex items-center gap-4 mb-[env(safe-area-inset-bottom)]">
         <div className="flex-1">
            <p className="text-xs font-bold uppercase line-clamp-1">{product.name}</p>
            <p className="text-sm">${product.price}</p>
         </div>
         <button 
            onClick={handleAddToCartClick}
            className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-luxury-gold transition-colors"
         >
            Add to Bag
         </button>
      </div>
    </div>
  );
};
