
import React from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { Product, Vendor } from '../../types.ts';

interface NewArrivalsFeedProps {
    products: Product[];
    vendors: Vendor[];
    setIsSidebarOpen: (open: boolean) => void;
    onProductSelect?: (product: Product) => void;
}

export const NewArrivalsFeed: React.FC<NewArrivalsFeedProps> = ({
    products,
    vendors,
    setIsSidebarOpen,
    onProductSelect
}) => {
    // Filter for active new arrivals (last 7 days) from active vendors/admin
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newArrivalsFeed = products
        .filter(product => {
            // 1. Must be marked as New Season
            if (!product.isNewSeason) return false;
            
            // 2. Must be created within last 7 days
            if (!product.createdAt) return false;
            if (new Date(product.createdAt) <= oneWeekAgo) return false;

            // 3. Vendor must be active (or be Admin/System - if no vendor found, we assume it's Admin/System and show it)
            const vendor = vendors.find(v => v.name === product.designer);
            return vendor ? vendor.subscriptionStatus === 'ACTIVE' : true;
        })
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif italic">New Arrivals</h2>
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                    <Menu size={20} />
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {newArrivalsFeed.map(product => (
                    <div 
                        key={product.id} 
                        className="bg-white border border-gray-100 group relative rounded-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => onProductSelect && onProductSelect(product)}
                    >
                        <div className="aspect-[3/4] bg-gray-50 overflow-hidden relative">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute top-2 left-2 bg-black text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wide">
                                New Season
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-sm truncate pr-2">{product.name}</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">{product.designer}</p>
                                </div>
                                <span className="text-sm font-medium">${product.price}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {newArrivalsFeed.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-400 bg-gray-50 rounded-sm border border-dashed border-gray-200">
                        <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No new arrivals this week. Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
