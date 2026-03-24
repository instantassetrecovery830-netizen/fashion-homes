
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Filter, ChevronDown, Heart, Camera, X } from 'lucide-react';
import { Product, ViewState, Vendor } from '../types.ts';

interface MarketplaceViewProps {
  onProductSelect: (product: Product) => void;
  onNavigate: (view: ViewState) => void;
  initialDesigner?: string | null;
  products: Product[];
  vendors: Vendor[];
  customTitle?: string | null;
  onClearFilter?: () => void;
  savedItems?: Product[];
  onToggleSave?: (product: Product) => void;
}

const FILTERS = ['All', 'Outerwear', 'Bottoms', 'Knitwear', 'Footwear', 'Accessories'];

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ 
  onProductSelect, 
  initialDesigner, 
  products,
  vendors,
  customTitle,
  onClearFilter,
  savedItems = [],
  onToggleSave
}) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDesigner, setActiveDesigner] = useState('All Designers');

  // Handle initial filter from props
  useEffect(() => {
    if (initialDesigner) {
      setActiveDesigner(initialDesigner);
    } else {
        setActiveDesigner('All Designers');
    }
  }, [initialDesigner]);

  // Extract unique active designers from passed products
  const designers = useMemo(() => {
    const unique = Array.from(new Set(products.map(p => p.designer)));
    return ['All Designers', ...unique.sort()];
  }, [products]);

  const filteredProducts = useMemo(() => products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesDesigner = activeDesigner === 'All Designers' || p.designer === activeDesigner;
    return matchesCategory && matchesDesigner;
  }), [products, activeCategory, activeDesigner]);

  const isSaved = useCallback((productId: string) => savedItems.some(p => p.id === productId), [savedItems]);

  return (
    <div className="min-h-screen pt-4 md:pt-12 pb-24">
      {/* Header & Filters */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-6 md:mb-12 sticky top-[4.5rem] md:top-20 z-30 bg-white/90 backdrop-blur-md py-4 transition-all border-b border-gray-100/50">
        <div className="flex flex-col gap-4 md:gap-8">
          
          {/* Top Row: Title + Designer Select */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                <h1 className="text-2xl md:text-4xl font-serif italic truncate">
                    {customTitle || "Ready-to-Wear"}
                </h1>
                {customTitle && onClearFilter && (
                    <button 
                        onClick={onClearFilter}
                        className="bg-gray-100 hover:bg-gray-200 text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors duration-200 active:scale-95 shrink-0"
                    >
                        <X size={12} /> Clear
                    </button>
                )}
            </div>
            
            {/* Designer Dropdown */}
            {!customTitle && (
            <div className="relative w-full md:w-auto md:min-w-[240px]">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 mb-1 md:mb-2 block font-bold">Filter by Designer</label>
              <div className="relative group">
                <select 
                  value={activeDesigner}
                  onChange={(e) => setActiveDesigner(e.target.value)}
                  className="w-full appearance-none bg-transparent border-b border-gray-300 py-2 pr-8 text-xs md:text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-black cursor-pointer hover:border-luxury-gold transition-colors duration-200"
                >
                  {designers.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-black transition-colors" />
              </div>
            </div>
            )}
          </div>
          
          {/* Bottom Row: Category Pills */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {FILTERS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap px-4 py-2 border rounded-full transition-all duration-200 active:scale-95 flex-shrink-0 ${
                    activeCategory === cat 
                      ? 'bg-black text-white border-black' 
                      : 'bg-transparent text-gray-500 border-gray-200 hover:border-black hover:text-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
             <button className="hidden md:flex items-center gap-2 text-xs uppercase font-bold ml-4 border-l pl-6 border-gray-200 hover:text-luxury-gold transition-colors duration-200 whitespace-nowrap active:scale-95">
              <Filter size={14} /> More Filters
            </button>
          </div>

        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-3 md:px-6">
        {filteredProducts.length === 0 ? (
           <div className="py-24 text-center animate-fade-in">
             <div className="flex justify-center mb-4">
                {customTitle ? <Camera size={32} className="text-gray-300" /> : <Filter size={32} className="text-gray-300" />}
             </div>
             <p className="text-xl font-serif italic text-gray-400 mb-4">
                 {customTitle ? "No visual matches found in our current collection." : "No pieces found matching your criteria."}
             </p>
             <button 
               onClick={() => {
                   if (onClearFilter) onClearFilter();
                   setActiveCategory('All'); 
                   setActiveDesigner('All Designers');
               }} 
               className="text-xs font-bold uppercase border-b border-black pb-1 hover:text-luxury-gold hover:border-luxury-gold transition-colors duration-200 active:scale-95"
             >
               View Full Collection
             </button>
           </div>
        ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-16 animate-fade-in">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="group cursor-pointer active:scale-[0.98] transition-transform duration-200"
              onClick={() => onProductSelect(product)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-3 md:mb-6">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                
                {/* Overlay Action - Hidden on mobile to prevent sticky hover states */}
                <div className="hidden md:flex absolute inset-0 bg-black/10 transition-opacity duration-300 opacity-0 group-hover:opacity-100 items-end justify-center pb-8">
                  <button className="bg-white text-black text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-luxury-black hover:text-white transition-all duration-200 shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 active:scale-95">
                    Quick View
                  </button>
                </div>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(product); }}
                    className={`absolute top-2 right-2 md:top-4 md:right-4 p-1.5 md:p-0 transition-transform hover:scale-110 duration-300 md:opacity-0 md:group-hover:opacity-100 ${isSaved(product.id) ? 'opacity-100 text-luxury-gold' : 'text-white mix-blend-difference'}`}
                >
                  <Heart size={18} md:size={20} strokeWidth={1.5} fill={isSaved(product.id) ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start gap-1">
                <div className="overflow-hidden w-full">
                  <h3 className="text-[9px] md:text-xs font-bold uppercase tracking-widest mb-0.5 md:mb-1 truncate text-gray-500 md:text-black">{product.designer}</h3>
                  <p className="font-serif text-xs md:text-base text-gray-900 md:text-gray-600 italic group-hover:text-black transition-colors duration-200 truncate">{product.name}</p>
                </div>
                <span className="text-xs md:text-sm font-medium mt-1 md:mt-0">${product.price}</span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};
