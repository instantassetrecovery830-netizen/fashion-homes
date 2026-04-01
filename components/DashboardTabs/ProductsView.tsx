import React from 'react';
import { Package, Search, Plus, Filter, MoreVertical, Edit2, Trash2, Eye, Star, Archive, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, UserRole } from '../../types';

interface ProductsViewProps {
  products: Product[];
  role: UserRole;
  setIsSidebarOpen: (open: boolean) => void;
  setIsProductFormOpen: (open: boolean) => void;
  setProductForm: (product: Partial<Product>) => void;
  handleDeleteProduct: (id: string) => void;
  onUpdateProduct?: (product: Product) => Promise<void>;
  onProductSelect?: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  role,
  setIsSidebarOpen,
  setIsProductFormOpen,
  setProductForm,
  handleDeleteProduct,
  onUpdateProduct,
  onProductSelect
}) => {
  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif italic">Collection Management</h2>
          <p className="text-gray-500 text-sm mt-1">Curate and manage your luxury pieces</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-sm text-sm focus:border-black outline-none w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => {
              setProductForm({
                name: '',
                price: 0,
                description: '',
                category: '',
                designer: role === UserRole.VENDOR ? '' : '', // Will be set in Dashboard
                image: '',
                images: [],
                stock: 0,
                isPreOrder: false
              });
              setIsProductFormOpen(true);
            }}
            className="bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus size={16} /> Add Piece
          </button>
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
            <Package size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Total Pieces</p>
          <p className="text-2xl font-serif">{products.length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Low Stock</p>
          <p className="text-2xl font-serif text-orange-600">{products.filter(p => p.stock < 5).length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Out of Stock</p>
          <p className="text-2xl font-serif text-red-600">{products.filter(p => p.stock === 0).length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Total Value</p>
          <p className="text-2xl font-serif text-luxury-gold">${products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex gap-4">
            <button className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-black pb-1">All Pieces</button>
            <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors pb-1">Active</button>
            <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors pb-1">Archived</button>
          </div>
          <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
            <Filter size={14} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Piece</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Category</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Price</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Stock</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Approval</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={product.id} 
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-gray-100 rounded-sm overflow-hidden border border-gray-200">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm line-clamp-1">{product.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{product.designer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-sm">${product.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${product.stock < 5 ? 'text-red-500' : 'text-gray-600'}`}>
                        {product.stock}
                      </span>
                      {product.stock < 5 && <AlertCircle size={12} className="text-red-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] px-2 py-1 rounded-full font-bold uppercase tracking-widest border ${
                      product.stock > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {product.stock > 0 ? 'Active' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] px-2 py-1 rounded-full font-bold uppercase tracking-widest border ${
                      product.isApproved ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                    }`}>
                      {product.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {role === UserRole.ADMIN && !product.isApproved && (
                        <button 
                          onClick={() => onUpdateProduct && onUpdateProduct({ ...product, isApproved: true })}
                          className="p-2 hover:bg-gray-100 rounded-full text-green-500 hover:text-green-700 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => onProductSelect && onProductSelect(product)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setProductForm(product);
                          setIsProductFormOpen(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                    <Package size={48} className="mx-auto mb-4 opacity-10" />
                    <p>No pieces in your collection yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
