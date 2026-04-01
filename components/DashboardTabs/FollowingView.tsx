import React from 'react';
import { Heart, X, Menu } from 'lucide-react';
import { motion } from 'motion/react';

interface Vendor {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  location?: string;
  subscriptionStatus?: string;
}

interface FollowingViewProps {
  followedVendors: Vendor[];
  setIsSidebarOpen: (open: boolean) => void;
  onDesignerClick?: (name: string) => void;
  onToggleFollow?: (vendor: Vendor) => void;
}

export const FollowingView: React.FC<FollowingViewProps> = ({ 
  followedVendors, 
  setIsSidebarOpen, 
  onDesignerClick, 
  onToggleFollow 
}) => {
  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif italic">Ateliers You Follow</h2>
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
          <Menu size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {followedVendors.map(vendor => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={vendor.id} 
            className="bg-white border border-gray-100 p-8 flex flex-col items-center text-center rounded-sm hover:shadow-lg transition-all group"
          >
            <div className="relative mb-4">
              <img src={vendor.avatar} alt={vendor.name} className="w-24 h-24 rounded-full object-cover border border-gray-100 group-hover:scale-105 transition-transform duration-500" />
              {vendor.subscriptionStatus === 'ACTIVE' && (
                <div className="absolute -bottom-1 -right-1 bg-luxury-gold w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              )}
            </div>
            <h3 className="font-bold text-lg mb-1">{vendor.name}</h3>
            <p className="text-xs text-gray-500 mb-6 line-clamp-2 h-8">{vendor.bio}</p>
            <div className="flex gap-2 w-full mt-auto">
              <button 
                onClick={() => onDesignerClick && onDesignerClick(vendor.name)}
                className="flex-1 bg-black text-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors"
              >
                View Profile
              </button>
              {onToggleFollow && (
                <button 
                  onClick={() => onToggleFollow(vendor)}
                  className="border border-gray-200 px-3 py-3 text-black hover:text-red-500 hover:border-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {followedVendors.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400 bg-gray-50 rounded-sm border border-dashed border-gray-200">
            <Heart size={48} className="mx-auto mb-4 opacity-20" />
            <p>You are not following any ateliers yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
