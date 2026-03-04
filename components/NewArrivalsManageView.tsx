import React, { useState, useMemo } from 'react';
import { Product, UserRole } from '../types';
import { Trash2, Edit2, Plus, Image as ImageIcon, X, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import { auth } from '../services/firebase';

interface NewArrivalsManageViewProps {
  products: Product[];
  onAddProduct: (product: Product) => Promise<void>;
  onUpdateProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  userRole: UserRole;
  onNavigate: (view: any) => void;
}

export const NewArrivalsManageView: React.FC<NewArrivalsManageViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  userRole,
  onNavigate
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentUser = auth.currentUser;

  // Filter products: 
  // 1. Must be "New Arrival" (isNewSeason === true)
  // 2. If not Admin, must belong to current user (match designer name)
  const myNewArrivals = useMemo(() => {
    if (!currentUser) return [];
    
    if (userRole === UserRole.ADMIN) {
        return products.filter(p => p.isNewSeason);
    }

    const userName = currentUser.displayName || currentUser.email?.split('@')[0] || '';
    return products.filter(p => p.isNewSeason && p.designer === userName);
  }, [products, userRole, currentUser]);

  const uploadCount = myNewArrivals.length;
  const canUpload = userRole === UserRole.ADMIN || uploadCount < 3;

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Anonymous';
      
      const productToSave: Product = {
        id: formData.id || `prod_${Date.now()}`,
        name: formData.name,
        designer: formData.designer || userName, 
        price: Number(formData.price),
        category: formData.category,
        image: formData.image || 'https://via.placeholder.com/400x600',
        description: formData.description || '',
        rating: formData.rating || 5,
        stock: Number(formData.stock) || 1,
        sizes: formData.sizes || ['S', 'M', 'L'],
        isNewSeason: true, 
        isPreOrder: !!formData.isPreOrder
      };

      if (formData.id) {
        await onUpdateProduct(productToSave);
        setSuccessMsg("New Arrival updated successfully.");
      } else {
        await onAddProduct(productToSave);
        setSuccessMsg("New Arrival published successfully.");
      }
      
      setIsFormOpen(false);
      setFormData({});
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);

    } catch (err) {
      console.error(err);
      setError("Failed to save product. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setIsFormOpen(true);
    setError(null);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this New Arrival?")) {
      await onDeleteProduct(productId);
      setSuccessMsg("Item deleted successfully.");
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-luxury-cream animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Success Toast */}
        {successMsg && (
            <div className="fixed top-24 right-6 z-50 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-sm shadow-xl animate-slide-up flex items-center gap-3">
                <div className="bg-green-100 p-1 rounded-full"><div className="w-2 h-2 bg-green-600 rounded-full" /></div>
                <span className="text-sm font-medium">{successMsg}</span>
            </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <button 
                onClick={() => onNavigate('MARKETPLACE')}
                className="flex items-center gap-2 text-gray-500 hover:text-black mb-4 transition-colors text-xs uppercase tracking-widest"
            >
                <ArrowLeft size={16} /> Back to Market
            </button>
            <h1 className="text-3xl md:text-4xl font-serif italic mb-2">Manage New Arrivals</h1>
            <p className="text-gray-500 text-sm">
              {userRole === UserRole.ADMIN 
                ? "Manage all new season drops." 
                : `You have used ${uploadCount} of 3 available slots.`}
            </p>
          </div>

          <button
            onClick={() => {
                setFormData({ designer: currentUser?.displayName || currentUser?.email?.split('@')[0] });
                setIsFormOpen(true);
            }}
            disabled={!canUpload}
            className={`w-full md:w-auto justify-center flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
              canUpload 
                ? 'bg-luxury-black text-white hover:bg-luxury-gold' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus size={16} /> Add New Piece
          </button>
        </div>

        {/* Limit Warning */}
        {!canUpload && userRole !== UserRole.ADMIN && (
            <div className="bg-yellow-50 border border-yellow-100 p-4 mb-8 flex items-center gap-3 text-yellow-800 rounded-sm">
                <AlertCircle size={20} />
                <span className="text-xs font-bold uppercase tracking-wide">Upload Limit Reached</span>
                <span className="text-sm">You have reached the maximum of 3 New Arrivals. Please delete or edit an existing item.</span>
            </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myNewArrivals.length === 0 ? (
            <div className="col-span-full py-24 text-center text-gray-400 border border-dashed border-gray-200 rounded-sm bg-gray-50/50">
              <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <ImageIcon size={24} className="opacity-20" />
                  </div>
              </div>
              <h3 className="text-lg font-serif italic mb-2">No New Arrivals Yet</h3>
              <p className="text-xs uppercase tracking-widest mb-6">Share your latest pieces with the community</p>
              <button
                onClick={() => {
                    setFormData({ designer: currentUser?.displayName || currentUser?.email?.split('@')[0] });
                    setIsFormOpen(true);
                }}
                className="text-luxury-gold hover:text-black underline text-sm transition-colors"
              >
                Create your first drop
              </button>
            </div>
          ) : (
            myNewArrivals.map(product => (
              <div key={product.id} className="bg-white group relative border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
                    New Season
                  </div>
                  {userRole === UserRole.ADMIN && (
                      <div className="absolute top-4 right-4 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                          {product.designer}
                      </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-400">
                          {userRole === UserRole.ADMIN ? product.designer : 'Your Drop'}
                      </h3>
                      <p className="font-serif italic text-lg text-black">{product.name}</p>
                    </div>
                    <span className="text-sm font-medium">${product.price}</span>
                  </div>
                  
                  <div className="flex gap-2 mt-6 pt-4 border-t border-gray-50">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-colors"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Form */}
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-slide-up rounded-sm">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-20">
                <h2 className="text-xl font-serif italic">{formData.id ? 'Edit New Arrival' : 'Add New Arrival'}</h2>
                <button onClick={() => setIsFormOpen(false)} className="hover:rotate-90 transition-transform">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 text-sm rounded-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Product Image</label>
                    <div className="aspect-[3/4] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative group cursor-pointer hover:border-luxury-gold transition-colors">
                      {formData.image ? (
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <ImageIcon size={32} className="mb-2" />
                          <span className="text-xs uppercase tracking-wide">Upload Image</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {formData.image && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white text-xs font-bold uppercase tracking-widest">Change Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Product Name</label>
                      <input 
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                        placeholder="e.g. Silk Evening Gown"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Designer / Brand</label>
                      <input 
                        value={formData.designer || ''}
                        onChange={e => setFormData({...formData, designer: e.target.value})}
                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                        placeholder="Your Brand Name"
                        disabled={userRole !== UserRole.ADMIN} // Only admin can change designer name freely? Or let users edit it? Let's lock it for non-admins to enforce ownership.
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Price ($)</label>
                        <input 
                          type="number"
                          value={formData.price || ''}
                          onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                          className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Category</label>
                        <select 
                          value={formData.category || ''}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                          className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                          required
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
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Description</label>
                      <textarea 
                        value={formData.description || ''}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none bg-gray-50 h-24 resize-none"
                        placeholder="Product details..."
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input 
                            type="checkbox" 
                            id="isPreOrder"
                            checked={formData.isPreOrder || false}
                            onChange={e => setFormData({...formData, isPreOrder: e.target.checked})}
                            className="accent-black"
                        />
                        <label htmlFor="isPreOrder" className="text-xs text-gray-600 cursor-pointer select-none">Available for Pre-Order</label>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? <Loader size={16} className="animate-spin" /> : (formData.id ? 'Save Changes' : 'Publish Arrival')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
