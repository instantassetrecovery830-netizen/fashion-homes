import React from 'react';
import { ShoppingBag, Search, Filter, MoreVertical, ExternalLink, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Order, UserRole } from '../../types';

interface OrdersViewProps {
  myOrders: Order[];
  setIsSidebarOpen: (open: boolean) => void;
  onUpdateStatus?: (orderId: string, status: Order['status']) => Promise<void>;
  role?: UserRole;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ myOrders, setIsSidebarOpen, onUpdateStatus, role }) => {
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [showTrackingInput, setShowTrackingInput] = React.useState<string | null>(null);
  const [trackingInfo, setTrackingInfo] = React.useState({ carrier: 'DHL Express', trackingNumber: '' });

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    if (!onUpdateStatus) return;
    
    if (newStatus === 'Shipped' && !showTrackingInput) {
      setShowTrackingInput(orderId);
      return;
    }

    setUpdatingId(orderId);
    try {
      // If we have tracking info, we might want to pass it along
      // For now, we'll use a custom event or just call the status update
      // and then handle shipment creation in the parent or here if we had the service
      await onUpdateStatus(orderId, newStatus);
      
      if (newStatus === 'Shipped' && trackingInfo.trackingNumber) {
        // We'll call createShipmentInDb directly if we can, or pass it to onUpdateStatus
        // Let's assume we can import it here
        const order = myOrders.find(o => o.id === orderId);
        if (order) {
          const { createShipmentInDb } = await import('../../services/dataService');
          await createShipmentInDb({
            order_id: orderId,
            vendor_id: (order as any).vendor_id || '', 
            customer_name: order.customerName,
            destination: `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.country || ''}`,
            carrier: trackingInfo.carrier,
            tracking_number: trackingInfo.trackingNumber,
            status: 'In Transit',
            estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
        }
      }
      
      setShowTrackingInput(null);
      setTrackingInfo({ carrier: 'DHL Express', trackingNumber: '' });
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif italic">
            {role === UserRole.BUYER ? 'Order History' : 'Order Management'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {role === UserRole.BUYER ? 'Track and manage your purchases' : 'Manage customer orders and fulfillment'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-sm text-sm focus:border-black outline-none w-64 transition-all"
            />
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex gap-4">
            <button className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-black pb-1">All Orders</button>
            <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors pb-1">Processing</button>
            <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors pb-1">Shipped</button>
            <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors pb-1">Delivered</button>
          </div>
          <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
            <Filter size={14} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Order ID</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Date</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Items</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Total</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myOrders.map((order) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={order.id} 
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-medium">#{order.id.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-black text-white text-[8px] font-bold flex items-center justify-center shadow-sm">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-sm">${order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span className={`text-[9px] px-2 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1 w-fit ${
                        order.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-100' :
                        order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}>
                        {order.status === 'Delivered' ? <CheckCircle size={10} /> : 
                         order.status === 'Shipped' ? <Truck size={10} /> : 
                         <Clock size={10} />}
                        {order.status}
                      </span>
                      
                      {role !== UserRole.BUYER && order.status !== 'Delivered' && (
                        <div className="flex flex-col gap-2">
                          {showTrackingInput === order.id ? (
                            <div className="flex flex-col gap-2 p-2 bg-gray-50 border border-gray-200 rounded-sm">
                              <select 
                                value={trackingInfo.carrier}
                                onChange={(e) => setTrackingInfo(prev => ({ ...prev, carrier: e.target.value }))}
                                className="text-[10px] p-1 border border-gray-300 rounded-sm outline-none"
                              >
                                <option value="DHL Express">DHL Express</option>
                                <option value="FedEx Luxury">FedEx Luxury</option>
                                <option value="UPS Worldwide">UPS Worldwide</option>
                              </select>
                              <input 
                                type="text"
                                placeholder="Tracking Number"
                                value={trackingInfo.trackingNumber}
                                onChange={(e) => setTrackingInfo(prev => ({ ...prev, trackingNumber: e.target.value }))}
                                className="text-[10px] p-1 border border-gray-300 rounded-sm outline-none"
                              />
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleStatusChange(order.id, 'Shipped')}
                                  disabled={updatingId === order.id || !trackingInfo.trackingNumber}
                                  className="text-[8px] uppercase font-bold bg-black text-white px-2 py-1 rounded-sm hover:bg-luxury-gold disabled:opacity-50"
                                >
                                  Confirm Shipment
                                </button>
                                <button 
                                  onClick={() => setShowTrackingInput(null)}
                                  className="text-[8px] uppercase font-bold text-gray-500 hover:underline"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              {order.status === 'Processing' && (
                                <button 
                                  onClick={() => handleStatusChange(order.id, 'Shipped')}
                                  disabled={updatingId === order.id}
                                  className="text-[8px] uppercase font-bold text-blue-600 hover:underline disabled:opacity-50"
                                >
                                  Mark Shipped
                                </button>
                              )}
                              {(order.status === 'Shipped' || order.status === 'Processing') && (
                                <button 
                                  onClick={() => handleStatusChange(order.id, 'Delivered')}
                                  disabled={updatingId === order.id}
                                  className="text-[8px] uppercase font-bold text-green-600 hover:underline disabled:opacity-50"
                                >
                                  Mark Delivered
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
                        <ExternalLink size={16} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {myOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-10" />
                    <p>No orders found in your history.</p>
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
