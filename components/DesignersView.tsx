
import React from 'react';
import { BadgeCheck, ArrowRight } from 'lucide-react';
import { Vendor } from '../types.ts';

interface DesignersViewProps {
  onSelectDesigner: (designerName: string) => void;
  vendors: Vendor[];
}

export const DesignersView: React.FC<DesignersViewProps> = ({ onSelectDesigner, vendors }) => {
  // Ensure vendors are both subscribed and verified by admin
  const activeVendors = vendors.filter(v => v.subscriptionStatus === 'ACTIVE' && v.verificationStatus === 'VERIFIED');

  return (
    <div className="min-h-screen pt-12 pb-24 animate-fade-in bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-20 border-b border-gray-100 pb-12">
        <h1 className="text-4xl md:text-6xl font-serif italic mb-6">The Ateliers</h1>
        <p className="text-gray-500 max-w-2xl font-light text-lg">
           Explore the visionaries shaping the future of fashion. From Tokyo streetwear to Parisian couture, discover the brands defining the MyFitStore aesthetic.
        </p>
      </div>

      {/* Designers Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
           {activeVendors.length === 0 ? (
             <div className="col-span-full py-20 text-center text-gray-400">
               <p className="text-xl font-serif italic">No ateliers currently available.</p>
             </div>
           ) : (
             activeVendors.map((vendor) => (
               <div key={vendor.id} className="group relative">
                 <div className="relative aspect-[4/3] overflow-hidden mb-6 bg-gray-100 grayscale group-hover:grayscale-0 transition-all duration-700">
                   <img src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   
                   {/* Hover Overlay */}
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <button 
                        onClick={() => onSelectDesigner(vendor.name)}
                        className="bg-white text-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-white transition-colors flex items-center gap-2"
                      >
                        Visit Boutique <ArrowRight size={14} />
                      </button>
                   </div>
                 </div>

                 <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold uppercase tracking-widest">{vendor.name}</h3>
                      {vendor.verificationStatus === 'VERIFIED' && <BadgeCheck size={18} className="text-blue-500" />}
                    </div>
                    <p className="text-gray-500 font-serif italic text-sm leading-relaxed max-w-xs">{vendor.bio}</p>
                 </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
};
