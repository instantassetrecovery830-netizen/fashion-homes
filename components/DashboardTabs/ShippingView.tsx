import React, { useEffect, useState, useMemo } from 'react';
import { Truck, Search, Plus, Filter, MoreVertical, MapPin, Package, CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchVendorShipments, updateShipmentStatusInDb } from '../../services/dataService';
import { Shipment } from '../../types';

interface ShippingViewProps {
  setIsSidebarOpen: (open: boolean) => void;
  vendorId?: string;
}

export const ShippingView: React.FC<ShippingViewProps> = ({ setIsSidebarOpen, vendorId }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadShipments = async () => {
    if (!vendorId) return;
    setIsLoading(true);
    try {
      const data = await fetchVendorShipments(vendorId);
      setShipments(data);
    } catch (e) {
      console.error("Error loading shipments:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, [vendorId]);

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => 
      s.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.order_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [shipments, searchQuery]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateShipmentStatusInDb(id, newStatus);
      setShipments(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
    } catch (e) {
      console.error("Error updating shipment status:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    return {
      inTransit: shipments.filter(s => s.status === 'In Transit').length,
      pending: shipments.filter(s => s.status === 'Pending').length,
      delivered: shipments.filter(s => s.status === 'Delivered').length,
      exceptions: shipments.filter(s => s.status === 'Exception').length,
    };
  }, [shipments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-luxury-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif italic">Logistics & Shipping</h2>
          <p className="text-gray-500 text-sm mt-1">Manage global deliveries and tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search shipments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-sm text-sm focus:border-black outline-none w-64 transition-all"
            />
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
            <Truck size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">In Transit</p>
          <p className="text-2xl font-serif">{stats.inTransit}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Pending Pickup</p>
          <p className="text-2xl font-serif text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Delivered (Total)</p>
          <p className="text-2xl font-serif text-green-600">{stats.delivered}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Exceptions</p>
          <p className="text-2xl font-serif text-red-600">{stats.exceptions}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex gap-4">
            <button className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-black pb-1">Active Shipments</button>
            <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors pb-1">Completed</button>
            <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors pb-1">Returns</button>
          </div>
          <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
            <Filter size={14} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Shipment ID</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Customer & Destination</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Carrier & Tracking</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Est. Delivery</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredShipments.map((shipment) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={shipment.id} 
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold">{shipment.id}</span>
                      <span className="text-[10px] text-gray-400">Order: {shipment.order_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{shipment.customer_name}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} /> {shipment.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{shipment.carrier}</span>
                      <span className="text-[10px] font-mono text-gray-400">{shipment.tracking_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{shipment.estimated_delivery || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span className={`text-[9px] px-2 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1 w-fit ${
                        shipment.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-100' :
                        shipment.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        shipment.status === 'Exception' ? 'bg-red-50 text-red-700 border border-red-100' :
                        'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}>
                        {shipment.status === 'Delivered' ? <CheckCircle size={10} /> : 
                         shipment.status === 'In Transit' ? <Truck size={10} /> : 
                         shipment.status === 'Exception' ? <AlertCircle size={10} /> :
                         <Clock size={10} />}
                        {shipment.status}
                      </span>
                      
                      {shipment.status !== 'Delivered' && (
                        <div className="flex gap-1">
                          {shipment.status === 'Pending' && (
                            <button 
                              onClick={() => handleStatusUpdate(shipment.id, 'In Transit')}
                              disabled={updatingId === shipment.id}
                              className="text-[8px] uppercase font-bold text-blue-600 hover:underline disabled:opacity-50"
                            >
                              Mark In Transit
                            </button>
                          )}
                          {(shipment.status === 'In Transit' || shipment.status === 'Pending') && (
                            <button 
                              onClick={() => handleStatusUpdate(shipment.id, 'Delivered')}
                              disabled={updatingId === shipment.id}
                              className="text-[8px] uppercase font-bold text-green-600 hover:underline disabled:opacity-50"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
                        <Package size={16} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredShipments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                    <Truck size={48} className="mx-auto mb-4 opacity-10" />
                    <p>No shipments found.</p>
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
