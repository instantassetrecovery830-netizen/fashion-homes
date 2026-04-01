import React, { useState } from 'react';
import { Tag, Layers, Trash2, Menu } from 'lucide-react';

interface MarketingViewProps {
  setIsSidebarOpen: (open: boolean) => void;
}

export const MarketingView: React.FC<MarketingViewProps> = ({ setIsSidebarOpen }) => {
  const [promotions, setPromotions] = useState([
    { id: 1, code: 'WELCOME10', discount: '10%', status: 'ACTIVE', uses: 45 },
    { id: 2, code: 'SUMMER24', discount: '20%', status: 'SCHEDULED', uses: 0 },
    { id: 3, code: 'VIPACCESS', discount: '15%', status: 'EXPIRED', uses: 128 }
  ]);

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif italic">Marketing Tools</h2>
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
          <Menu size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Promo */}
        <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm h-fit">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
            <Tag size={14} /> Create Promotion
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Discount Code</label>
              <input className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent uppercase" placeholder="e.g. WINTERSALE" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Discount %</label>
                <input type="number" className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent" placeholder="20" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Limit (Uses)</label>
                <input type="number" className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent" placeholder="100" />
              </div>
            </div>
            <button className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors mt-4">
              Launch Campaign
            </button>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-gray-400">
              <Layers size={14} /> Active Campaigns
            </h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500 font-bold">
              <tr>
                <th className="p-6">Code</th>
                <th className="p-6">Discount</th>
                <th className="p-6">Usage</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 font-mono font-bold">{promo.code}</td>
                  <td className="p-6">{promo.discount} Off</td>
                  <td className="p-6 text-gray-500">{promo.uses} redemptions</td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded-sm text-[10px] uppercase font-bold ${
                      promo.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 
                      promo.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {promo.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
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
    </div>
  );
};
