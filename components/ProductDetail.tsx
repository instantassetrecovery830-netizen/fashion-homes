import React, { useState, useEffect } from 'react';
import { Star, Truck, ShieldCheck, Sparkles, User, Send, AlertCircle, Clock, Ruler } from 'lucide-react';
import { Product, Vendor } from '../types';
import { getStyleMatch } from '../services/geminiService';

interface ProductDetailProps {
  product: Product;
  vendor?: Vendor;
  onAddToCart: (product: Product, size: string, measurements?: string) => void;
  onBack: () => void;
  onViewDesigner?: () => void;
  featureFlags: { enableAiStyleMatch: boolean; enableReviews: boolean; };
}

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, vendor, onAddToCart, onBack, onViewDesigner, featureFlags }) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [measurements, setMeasurements] = useState('');
  const [styleTip, setStyleTip] = useState<string | null>(null);
  const [loadingStyle, setLoadingStyle] = useState(false);
  const [activeImage, setActiveImage] = useState(product.image);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([
    { id: 'r1', author: 'Elena K.', rating: 5, text: 'The fabric quality is unmatched. Fits perfectly.', date: '2 days ago' },
    { id: 'r2', author: 'Marc D.', rating: 4, text: 'Stunning silhouette, though the sleeves are slightly long.', date: '1 week ago' }
  ]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);

  useEffect(() => {
    setActiveImage(product.image);
    setSelectedSize(null);
    setMeasurements('');
    setSizeError(false);
    setStyleTip(null);
  }, [product]);

  // Generate mock additional images for the gallery
  const galleryImages = [
    product.image,
    `https://picsum.photos/seed/${product.id}detail1/800/1200`,
    `https://picsum.photos/seed/${product.id}detail2/800/1200`,
    `https://picsum.photos/seed/${product.id}detail3/800/1200`,
  ];

  const handleStyleMatch = async () => {
    setLoadingStyle(true);
    const tip = await getStyleMatch(product.name);
    setStyleTip(tip);
    setLoadingStyle(false);
  };

  const handleAddToCartClick = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    onAddToCart(product, selectedSize, measurements);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.trim()) return;
    const review: Review = {
      id: `new-${Date.now()}`,
      author: 'You', // In a real app, from auth context
      rating: newRating,
      text: newReview,
      date: 'Just now'
    };
    setReviews([review, ...reviews]);
    setNewReview('');
  };

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <button onClick={onBack} className="text-xs uppercase font-bold tracking-widest mb-8 hover:text-luxury-gold transition-colors">
          ← Back to Marketplace
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          {/* Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[3/4] overflow-hidden bg-gray-50 cursor-zoom-in relative">
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 ease-out" 
              />
              {product.isPreOrder && (
                 <div className="absolute top-4 left-4 bg-luxury-gold text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                   <Clock size={12} /> Pre-Order
                 </div>
              )}
            </div>
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-[3/4] bg-gray-50 overflow-hidden transition-all duration-300 ${
                    activeImage === img 
                      ? 'ring-1 ring-black ring-offset-2 opacity-100' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
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
                    <button 
                        onClick={onViewDesigner}
                        className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 hover:text-luxury-gold hover:border-luxury-gold transition-colors"
                    >
                        View Profile
                    </button>
                </div>
            )}

            {/* AI Style Match */}
            {featureFlags.enableAiStyleMatch && (
              <div className="p-6 bg-luxury-cream border border-luxury-gold/20 rounded-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-luxury-gold" />
                  <h4 className="text-xs font-bold uppercase tracking-widest">LUMIERRE AI Stylist</h4>
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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className={`text-xs font-bold uppercase ${sizeError ? 'text-red-500' : ''}`}>Select Size</p>
                {sizeError && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> Required</span>}
              </div>
              
              <div className="flex flex-wrap gap-3">
                {product.sizes && product.sizes.length > 0 ? (
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
                ))) : (
                  <span className="text-sm text-gray-500 italic">One Size Only</span>
                )}
              </div>

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
              className="w-full bg-black text-white py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors"
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
                  />
                  <button type="submit" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-black text-white px-6 py-3 hover:bg-luxury-gold transition-colors">
                    <Send size={14} /> Submit Review
                  </button>
                </form>
              </div>

              {/* Review List */}
              <div className="space-y-8">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0 animate-fade-in">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-luxury-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {review.author.charAt(0)}
                        </div>
                        <span className="text-sm font-bold">{review.author}</span>
                      </div>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                    <div className="flex gap-1 mb-3 text-luxury-gold">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-gray-200'} />
                       ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed font-serif italic">"{review.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};