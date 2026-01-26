import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid 
} from 'recharts';
import { 
  Package, Users, DollarSign, Activity, Settings, ToggleRight, 
  Plus, Image as ImageIcon, LayoutDashboard, Shirt, ShoppingBag, 
  ChevronRight, Sparkles, UploadCloud, Trash2, ArrowUpRight
} from 'lucide-react';
import { FeatureFlags, UserRole, Product, ViewState } from '../types';
import { MOCK_PRODUCTS } from '../constants';

const SALES_DATA = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

interface DashboardProps {
  role: UserRole;
  featureFlags: FeatureFlags;
  toggleFeatureFlag: (key: keyof FeatureFlags) => void;
  onNavigate: (view: ViewState) => void;
}

type DashboardTab = 'OVERVIEW' | 'PRODUCTS' | 'UPLOAD' | 'ORDERS' | 'SETTINGS' | 'MARKETPLACE';

export const Dashboard: React.FC<DashboardProps> = ({ role, featureFlags, toggleFeatureFlag, onNavigate }) => {
  const isAdmin = role === UserRole.ADMIN;
  const isVendor = role === UserRole.VENDOR;
  const isBuyer = role === UserRole.BUYER;
  
  const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');
  const [localProducts, setLocalProducts] = useState<Product[]>(MOCK_PRODUCTS);

  // Form State for Upload
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Outerwear',
    description: '',
    image: '',
    designer: 'Maison Margaux', // Hardcoded for demo
    stock: 1
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: `new-${Date.now()}`,
      name: newProduct.name || 'Untitled Piece',
      price: newProduct.price || 0,
      category: newProduct.category || 'Uncategorized',
      description: newProduct.description || '',
      image: newProduct.image || 'https://picsum.photos/600/800', // Fallback
      designer: newProduct.designer || 'Maison Margaux',
      rating: 0,
      stock: newProduct.stock || 1,
      isNewSeason: true
    };
    setLocalProducts([product, ...localProducts]);
    setActiveTab('PRODUCTS');
    // Reset form
    setNewProduct({
        name: '',
        price: 0,
        category: 'Outerwear',
        description: '',
        image: '',
        designer: 'Maison Margaux',
        stock: 1
    });
  };

  const generateAiDescription = () => {
    // Simulation of AI generation
    setNewProduct({
      ...newProduct,
      description: "A transcendental piece featuring architectural pleats and a structured silhouette. Crafted from ethically sourced organic silk, this garment embodies the duality of modern chaos and serene minimalism."
    });
  };

  const getSidebarItems = () => {
    if (isBuyer) {
      return [
        { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
        { id: 'ORDERS', label: 'My Orders', icon: Package },
        { id: 'MARKETPLACE', label: 'Shop Now', icon: ShoppingBag, action: () => onNavigate('MARKETPLACE') },
      ];
    }
    const items = [
      { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
      { id: 'PRODUCTS', label: 'My Collection', icon: Shirt },
      { id: 'UPLOAD', label: 'Add New Piece', icon: Plus },
      { id: 'ORDERS', label: 'Orders', icon: ShoppingBag },
    ];
    if (isAdmin) {
      items.push({ id: 'SETTINGS', label: 'Platform Settings', icon: Settings });
    }
    return items;
  };

  const renderSidebar = () => (
    <div className="w-full md:w-64 bg-white border-r border-gray-100 min-h-screen p-6 fixed md:relative z-10 hidden md:block">
      <div className="mb-12">
        <h2 className="text-xl font-serif font-bold italic">Atelier.</h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{role} Portal</p>
      </div>

      <nav className="space-y-2">
        {getSidebarItems().map((item) => (
          <button
            key={item.id}
            onClick={() => item.action ? item.action() : setActiveTab(item.id as DashboardTab)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
              activeTab === item.id 
                ? 'bg-black text-white shadow-lg' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <item.icon size={16} />
            {item.label}
            {item.id === 'MARKETPLACE' && <ArrowUpRight size={14} className="ml-auto" />}
          </button>
        ))}
      </nav>
    </div>
  );

  const renderOverview = () => {
    if (isBuyer) {
       return (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-full bg-gray-50 text-black">
                    <Package size={20} />
                  </div>
               </div>
               <h3 className="text-2xl font-bold mb-1">12</h3>
               <p className="text-xs text-gray-500 uppercase tracking-wide">Orders Placed</p>
            </div>
            <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-full bg-gray-50 text-black">
                    <DollarSign size={20} />
                  </div>
               </div>
               <h3 className="text-2xl font-bold mb-1">$4,850</h3>
               <p className="text-xs text-gray-500 uppercase tracking-wide">Total Spent</p>
            </div>
             <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 cursor-pointer group hover:border-black transition-colors" onClick={() => onNavigate('MARKETPLACE')}>
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-full bg-gray-50 text-black group-hover:bg-black group-hover:text-white transition-colors">
                    <ShoppingBag size={20} />
                  </div>
               </div>
               <h3 className="text-2xl font-bold mb-1">Shop</h3>
               <p className="text-xs text-gray-500 uppercase tracking-wide">Browse New Arrivals</p>
            </div>
          </div>
          
           <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-bold uppercase tracking-widest">Recent Purchases</h3>
               <button onClick={() => setActiveTab('ORDERS')} className="text-xs underline">View All</button>
             </div>
             {/* Mock mini list */}
              <div className="space-y-4">
                 {[1, 2].map(i => (
                  <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-16 bg-gray-100">
                         <img src={`https://picsum.photos/seed/${i}order/200/300`} className="w-full h-full object-cover" alt="Item"/>
                       </div>
                       <div>
                         <p className="font-serif italic text-sm">Asymmetric Silk Trench</p>
                         <p className="text-xs text-gray-500">Delivered on Oct {10 + i}</p>
                       </div>
                    </div>
                    <span className="text-sm font-bold">$1,250</span>
                  </div>
                 ))}
              </div>
           </div>
        </div>
       )
    }

    return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '$124,500', icon: DollarSign, color: 'text-green-600' },
          { label: 'Active Orders', value: '45', icon: Package, color: 'text-blue-600' },
          { label: 'Total Views', value: '89.2K', icon: Activity, color: 'text-purple-600' },
          { label: isAdmin ? 'Active Vendors' : 'Followers', value: isAdmin ? '12' : '3.4K', icon: Users, color: 'text-orange-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-full bg-gray-50 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-xs text-green-500 font-bold">+12%</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Performance Analytics</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChartComponent data={SALES_DATA} />
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )};

  const renderProducts = () => (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-serif italic">Current Collection</h3>
        <button 
          onClick={() => setActiveTab('UPLOAD')}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors"
        >
          <Plus size={16} /> Add Piece
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100">
            <tr>
              <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Product</th>
              <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Category</th>
              <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Price</th>
              <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Stock</th>
              <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {localProducts.map((product) => (
              <tr key={product.id} className="group hover:bg-gray-50 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-4">
                    <img src={product.image} className="w-12 h-16 object-cover bg-gray-100" alt={product.name} />
                    <div>
                      <p className="font-serif font-medium">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-sm text-gray-600">{product.category}</td>
                <td className="py-4 text-sm font-bold">${product.price}</td>
                <td className="py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock} Units
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
      {/* Form Side */}
      <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
        <h3 className="text-xl font-serif italic mb-8">Upload New Piece</h3>
        
        <form onSubmit={handleUpload} className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="relative group">
              <input 
                type="text" 
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                required
                className="w-full py-3 border-b border-gray-200 outline-none bg-transparent focus:border-black transition-colors peer placeholder-transparent"
                id="pName"
                placeholder="Name"
              />
              <label htmlFor="pName" className="absolute left-0 -top-3.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-gray-600">
                Product Name
              </label>
            </div>

            <div className="relative group">
              <input 
                type="number" 
                value={newProduct.price || ''}
                onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                required
                className="w-full py-3 border-b border-gray-200 outline-none bg-transparent focus:border-black transition-colors peer placeholder-transparent"
                id="pPrice"
                placeholder="Price"
              />
              <label htmlFor="pPrice" className="absolute left-0 -top-3.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-gray-600">
                Price ($)
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="relative group">
              <select 
                value={newProduct.category}
                onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                className="w-full py-3 border-b border-gray-200 outline-none bg-transparent focus:border-black transition-colors text-sm"
              >
                <option>Outerwear</option>
                <option>Bottoms</option>
                <option>Knitwear</option>
                <option>Footwear</option>
                <option>Accessories</option>
              </select>
              <label className="absolute left-0 -top-3.5 text-xs text-gray-600">Category</label>
            </div>

            <div className="relative group">
               <input 
                type="number" 
                value={newProduct.stock || ''}
                onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                required
                className="w-full py-3 border-b border-gray-200 outline-none bg-transparent focus:border-black transition-colors peer placeholder-transparent"
                id="pStock"
                placeholder="Stock"
              />
              <label htmlFor="pStock" className="absolute left-0 -top-3.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-gray-600">
                Stock Quantity
              </label>
            </div>
          </div>

          <div className="relative group">
            <input 
              type="url" 
              value={newProduct.image}
              onChange={e => setNewProduct({...newProduct, image: e.target.value})}
              placeholder="https://example.com/image.jpg"
              className="w-full py-3 border-b border-gray-200 outline-none bg-transparent focus:border-black transition-colors text-sm"
            />
            <label className="absolute left-0 -top-3.5 text-xs text-gray-600">Image URL</label>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-black">
              <UploadCloud size={14} /> <span>or upload from device</span>
            </div>
          </div>

          <div className="relative group">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-gray-600">Description</label>
              <button 
                type="button" 
                onClick={generateAiDescription}
                className="flex items-center gap-1 text-[10px] uppercase font-bold text-luxury-gold hover:opacity-80 transition-opacity"
              >
                <Sparkles size={12} /> AI Editorial Enhance
              </button>
            </div>
            <textarea 
              value={newProduct.description}
              onChange={e => setNewProduct({...newProduct, description: e.target.value})}
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-sm outline-none bg-gray-50 focus:border-black transition-colors text-sm font-serif"
              placeholder="Describe the silhouette, fabric, and inspiration..."
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={() => setActiveTab('PRODUCTS')}
              className="w-1/3 py-4 border border-gray-200 text-xs font-bold uppercase tracking-widest hover:border-black transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="w-2/3 bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors"
            >
              Publish to Marketplace
            </button>
          </div>
        </form>
      </div>

      {/* Preview Side */}
      <div className="flex flex-col items-center justify-center bg-gray-50 p-8 border border-dashed border-gray-300 rounded-sm">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-6">Marketplace Preview</p>
        
        {/* Card Preview */}
        <div className="w-full max-w-xs bg-white group cursor-default shadow-xl">
           <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
              {newProduct.image ? (
                <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon size={48} />
                </div>
              )}
              {newProduct.isNewSeason && (
                 <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
                    New Season
                 </span>
              )}
           </div>
           <div className="px-4 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-1">{newProduct.designer || 'Designer Name'}</h3>
              <p className="font-serif text-gray-600 italic mb-2">{newProduct.name || 'Product Name'}</p>
              <span className="text-sm font-medium">${newProduct.price || '0.00'}</span>
           </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
        <div className="flex items-center gap-2 mb-6">
          <Settings size={18} />
          <h3 className="text-sm font-bold uppercase tracking-widest">Platform Controls</h3>
        </div>
        
        <div className="space-y-6">
          {Object.keys(featureFlags).map((flag) => (
            <div key={flag} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600 capitalize">{flag.replace(/([A-Z])/g, ' $1').trim()}</span>
              <button 
                onClick={() => toggleFeatureFlag(flag as keyof FeatureFlags)}
                className={`transition-colors ${featureFlags[flag as keyof FeatureFlags] ? 'text-green-600' : 'text-gray-300'}`}
              >
                <ToggleRight size={32} className={`transform transition-transform ${featureFlags[flag as keyof FeatureFlags] ? 'rotate-0' : 'rotate-180 opacity-50'}`} />
              </button>
            </div>
          ))}
        </div>
    </div>
  );

  const renderOrders = () => {
    // Shared order render logic or specific for Buyer
    return (
      <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 animate-slide-up">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-6">{isBuyer ? 'My Purchase History' : 'Recent Orders'}</h3>
        <ul className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <li key={i} className="flex justify-between items-start text-sm border-b border-gray-50 pb-6 last:pb-0 last:border-0">
              <div className="flex items-start gap-4">
                <div className="w-16 h-20 bg-gray-100 shrink-0">
                   <img src={`https://picsum.photos/seed/${i}order/300/400`} className="w-full h-full object-cover" alt="Order"/>
                </div>
                <div>
                  <p className="font-bold text-base mb-1">Order #492{i}</p>
                  <p className="text-xs text-gray-500 mb-2">Placed on Oct 12, 2023</p>
                  <div className="flex flex-col gap-1">
                     <span className="text-xs text-gray-700">1 x Structure Knit Sweater</span>
                     <span className="text-xs text-gray-700">1 x Minimalist Tote</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <span className="font-bold">$1,250.00</span>
                 <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded ${
                   i === 1 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                 }`}>
                   {i === 1 ? 'Delivered' : 'Processing'}
                 </span>
                 <button className="text-xs underline text-gray-400 mt-2 hover:text-black">View Details</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-cream flex flex-col md:flex-row">
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Header */}
          <div className="md:hidden mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-serif italic">Atelier.</h1>
            <div className="flex gap-4">
               {getSidebarItems().map(item => (
                 <button key={item.id} onClick={() => item.action ? item.action() : setActiveTab(item.id as DashboardTab)}>
                   <item.icon size={20}/>
                 </button>
               ))}
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-serif font-medium mb-2 capitalize">
              {activeTab === 'MARKETPLACE' ? 'Marketplace' : activeTab.toLowerCase().replace('_', ' ')}
            </h1>
            <p className="text-gray-500 text-sm">
              {isBuyer ? 'Track your collection and purchases.' : 'Manage your fashion house operations.'}
            </p>
          </div>

          {activeTab === 'OVERVIEW' && renderOverview()}
          {activeTab === 'PRODUCTS' && renderProducts()}
          {activeTab === 'UPLOAD' && renderUpload()}
          {activeTab === 'ORDERS' && renderOrders()}
          {activeTab === 'SETTINGS' && isAdmin && renderSettings()}
        </div>
      </div>
    </div>
  );
};

// Helper for Recharts to avoid direct render issues
const AreaChartComponent = ({ data }: { data: any[] }) => (
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
    <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#9ca3af" axisLine={false} tickLine={false} />
    <YAxis tick={{fontSize: 12}} stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
    <Tooltip 
      contentStyle={{ backgroundColor: '#0a0a0a', border: 'none', borderRadius: '0px', color: '#fff' }}
      itemStyle={{ color: '#fff' }}
    />
    <Line type="monotone" dataKey="sales" stroke="#0a0a0a" strokeWidth={2} dot={{ r: 4, fill: '#0a0a0a' }} activeDot={{ r: 6, fill: '#d4af37' }} />
  </LineChart>
);