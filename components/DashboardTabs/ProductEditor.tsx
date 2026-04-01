import React from 'react';
import { X, Plus, Video, Loader, Trash2 } from 'lucide-react';
import { Product, UserRole } from '../../types';

interface ProductEditorProps {
  productForm: Partial<Product>;
  setProductForm: React.Dispatch<React.SetStateAction<Partial<Product>>>;
  setIsProductFormOpen: (open: boolean) => void;
  handleSaveProduct: () => void;
  isSavingProduct: boolean;
  role: UserRole;
  onNavigate: (tab: string) => void;
}

export const ProductEditor: React.FC<ProductEditorProps> = ({
  productForm,
  setProductForm,
  setIsProductFormOpen,
  handleSaveProduct,
  isSavingProduct,
  role,
  onNavigate
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsProductFormOpen(false)} />
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-slide-up rounded-sm">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-20">
          <h2 className="text-xl font-serif italic">{productForm.id ? 'Edit Product' : 'Add New Piece'}</h2>
          <button onClick={() => setIsProductFormOpen(false)} className="hover:rotate-90 transition-transform">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <label className="text-[10px] font-bold uppercase text-gray-400">Product Images (First image is cover)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Existing Images */}
                {(productForm.images && productForm.images.length > 0 ? productForm.images : (productForm.image ? [productForm.image] : [])).map((img, idx) => (
                  <div key={idx} className="aspect-[3/4] bg-gray-50 border border-gray-200 relative group rounded-sm overflow-hidden">
                    <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => {
                        const newImages = productForm.images ? [...productForm.images] : (productForm.image ? [productForm.image] : []);
                        newImages.splice(idx, 1);
                        setProductForm(prev => ({...prev, images: newImages, image: newImages[0] || ''}));
                      }}
                      className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                    >
                      <X size={14} />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-bold uppercase text-center py-1">
                        Main Cover
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add New Image Button */}
                <div className="aspect-[3/4] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative group cursor-pointer hover:border-luxury-gold transition-colors rounded-sm">
                  <div className="text-gray-400 flex flex-col items-center">
                    <Plus size={24} className="mb-2" />
                    <span className="text-[10px] uppercase tracking-wide font-bold text-center px-2">Add Image</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach((file: File) => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProductForm(prev => {
                              const currentImages = prev.images ? [...prev.images] : (prev.image ? [prev.image] : []);
                              const newImages = [...currentImages, reader.result as string];
                              return { ...prev, images: newImages, image: newImages[0] };
                            });
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Video Upload */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <label className="text-[10px] font-bold uppercase text-gray-400">Product Video (Optional)</label>
              <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative group cursor-pointer hover:border-luxury-gold transition-colors rounded-sm">
                {productForm.video ? (
                  <div className="relative w-full h-full">
                    <video src={productForm.video} controls className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setProductForm(prev => ({...prev, video: undefined}))}
                      className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-red-500 hover:bg-white z-10"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Video size={32} className="mb-2" />
                    <span className="text-[10px] uppercase tracking-wide font-bold text-center px-2">Upload Video</span>
                    <span className="text-[9px] text-gray-300 mt-1">MP4, WebM (Max 10MB)</span>
                  </div>
                )}
                {!productForm.video && (
                  <input 
                    type="file" 
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          alert("Video file is too large. Please upload a video smaller than 10MB.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProductForm(prev => ({ ...prev, video: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                )}
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Product Name</label>
                <input 
                  value={productForm.name || ''}
                  onChange={e => setProductForm({...productForm, name: e.target.value})}
                  className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                  placeholder="e.g. Silk Evening Gown"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Designer / Brand</label>
                <input 
                  value={productForm.designer || ''}
                  onChange={e => setProductForm({...productForm, designer: e.target.value})}
                  className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                  placeholder="Brand Name"
                  disabled={role === UserRole.VENDOR}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Price ($)</label>
                  <input 
                    type="number"
                    value={productForm.price || ''}
                    onChange={e => setProductForm({...productForm, price: Number(e.target.value)})}
                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Stock</label>
                  <input 
                    type="number"
                    value={productForm.stock || ''}
                    onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})}
                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Category</label>
                <select 
                  value={productForm.category || ''}
                  onChange={e => setProductForm({...productForm, category: e.target.value})}
                  className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                >
                  <option value="">Select...</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Tops">Tops</option>
                  <option value="Bottoms">Bottoms</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Footwear">Footwear</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isPreOrder"
                  checked={productForm.isPreOrder || false}
                  onChange={e => setProductForm({...productForm, isPreOrder: e.target.checked})}
                  className="accent-black"
                />
                <label htmlFor="isPreOrder" className="text-xs text-gray-600 cursor-pointer select-none">Available for Pre-Order</label>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-sm border border-gray-100 mt-2">
                <p className="text-[10px] text-gray-500">
                  <span className="font-bold">Note:</span> To upload "New Arrivals", please use the <button onClick={() => { setIsProductFormOpen(false); onNavigate('NEW_ARRIVALS_MANAGE'); }} className="underline text-black hover:text-luxury-gold">Manage New Arrivals</button> page. Items uploaded here are added to your standard collection.
                </p>
              </div>

              {/* Variants Management */}
              <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Product Variants (Size & Color)</label>
                  <button 
                    type="button"
                    onClick={() => {
                      const newVariants = [...(productForm.variants || [])];
                      newVariants.push({ id: `var_${Date.now()}`, size: '', color: '', stock: 0 });
                      setProductForm(prev => ({ ...prev, variants: newVariants }));
                    }}
                    className="text-[10px] font-bold uppercase text-luxury-gold hover:text-black transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Variant
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(productForm.variants || []).map((variant, vIdx) => (
                    <div key={variant.id} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-sm border border-gray-100">
                      <div className="col-span-4">
                        <label className="text-[8px] font-bold uppercase text-gray-400 block mb-1">Size</label>
                        <input 
                          value={variant.size}
                          onChange={e => {
                            const newVariants = [...(productForm.variants || [])];
                            newVariants[vIdx].size = e.target.value;
                            setProductForm(prev => ({ ...prev, variants: newVariants }));
                          }}
                          className="w-full border-b border-gray-200 py-1 text-xs focus:border-black outline-none bg-transparent"
                          placeholder="e.g. M"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-[8px] font-bold uppercase text-gray-400 block mb-1">Color</label>
                        <input 
                          value={variant.color}
                          onChange={e => {
                            const newVariants = [...(productForm.variants || [])];
                            newVariants[vIdx].color = e.target.value;
                            setProductForm(prev => ({ ...prev, variants: newVariants }));
                          }}
                          className="w-full border-b border-gray-200 py-1 text-xs focus:border-black outline-none bg-transparent"
                          placeholder="e.g. Red"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[8px] font-bold uppercase text-gray-400 block mb-1">Stock</label>
                        <input 
                          type="number"
                          value={variant.stock}
                          onChange={e => {
                            const newVariants = [...(productForm.variants || [])];
                            newVariants[vIdx].stock = Number(e.target.value);
                            setProductForm(prev => ({ ...prev, variants: newVariants }));
                          }}
                          className="w-full border-b border-gray-200 py-1 text-xs focus:border-black outline-none bg-transparent"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center pb-1">
                        <button 
                          type="button"
                          onClick={() => {
                            const newVariants = [...(productForm.variants || [])];
                            newVariants.splice(vIdx, 1);
                            setProductForm(prev => ({ ...prev, variants: newVariants }));
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {(productForm.variants || []).length === 0 && (
                    <p className="text-[10px] text-gray-400 italic text-center py-4 border border-dashed border-gray-200 rounded-sm">
                      No variants added. Use the button above to add sizes and colors.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Description</label>
            <textarea 
              value={productForm.description || ''}
              onChange={e => setProductForm({...productForm, description: e.target.value})}
              className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none bg-gray-50 h-24 resize-none"
              placeholder="Product details..."
            />
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <button 
              onClick={() => setIsProductFormOpen(false)}
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveProduct}
              disabled={isSavingProduct}
              className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSavingProduct ? <Loader size={16} className="animate-spin" /> : (productForm.id ? 'Save Changes' : 'Add to Collection')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
