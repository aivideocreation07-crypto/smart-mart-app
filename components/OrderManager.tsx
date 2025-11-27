
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Calendar, Check, X, RefreshCw, Filter, Banknote, Truck, AlertTriangle, Bell, ChevronRight, MapPin } from 'lucide-react';
import { Order } from '../types';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';

interface OrderManagerProps {
  onBack: () => void;
  setVoiceContext: (ctx: string) => void;
}

export const OrderManager: React.FC<OrderManagerProps> = ({ onBack, setVoiceContext }) => {
  const { shop } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'BOOKING' | 'PENDING'>('ALL');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const refreshOrders = () => {
    if (shop) {
        const all = db.getShopOrders(shop.id);
        setOrders(all.sort((a,b) => b.createdAt - a.createdAt));
        
        // Simulate notifications based on recent pending orders
        const newOrders = all.filter(o => o.status === 'PENDING' && (Date.now() - o.createdAt) < 600000); // last 10 mins
        if (newOrders.length > 0) {
            setNotifications(newOrders.map(o => `New Order from ${o.customerName}`));
        }
    }
  };

  useEffect(() => {
    refreshOrders();
    setVoiceContext("Here are your recent orders. Check for new booking requests.");
    
    const interval = setInterval(refreshOrders, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, [shop]);

  const handleStatusUpdate = (order: Order, newStatus: Order['status']) => {
      const updated = { ...order, status: newStatus };
      db.updateOrder(updated);
      refreshOrders();
      setVoiceContext(`Order status updated to ${newStatus}`);
  };

  const filteredOrders = orders.filter(o => {
      if (activeTab === 'BOOKING') return !!o.bookingDetails;
      if (activeTab === 'PENDING') return o.status === 'PENDING';
      return true;
  });

  const getStatusColor = (status: string) => {
      if (status === 'PENDING') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      if (status === 'CONFIRMED') return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      if (status === 'READY' || status === 'OUT_FOR_DELIVERY') return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      if (status === 'COMPLETED' || status === 'DELIVERED') return 'text-green-500 bg-green-500/10 border-green-500/20';
      return 'text-gray-400';
  };

  return (
    <div className="h-full flex flex-col bg-[#020617] animate-fade-in relative">
        {/* Notification Panel Overlay */}
        {showNotifPanel && (
            <div className="absolute top-16 right-4 z-50 w-64 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-4 animate-fade-in-up">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-white font-bold text-xs uppercase">Notifications</h4>
                    <button onClick={() => setShowNotifPanel(false)}><X size={14} className="text-gray-400"/></button>
                </div>
                {notifications.length === 0 ? (
                    <p className="text-gray-500 text-xs">No new alerts.</p>
                ) : (
                    <ul className="space-y-2">
                        {notifications.map((n, i) => (
                            <li key={i} className="text-xs text-orange-400 bg-orange-900/10 p-2 rounded border border-orange-500/20 flex items-center gap-2">
                                <Bell size={10} fill="currentColor"/> {n}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )}

        {/* Header */}
        <div className="p-4 flex items-center justify-between bg-black/20 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10"><ArrowLeft size={20} className="text-white"/></button>
                <h2 className="font-bold text-lg text-white uppercase tracking-wider">Dashboard</h2>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setShowNotifPanel(!showNotifPanel)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white relative">
                    <Bell size={18}/>
                    {notifications.length > 0 && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                </button>
                <button onClick={refreshOrders} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"><RefreshCw size={18}/></button>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 overflow-x-auto hide-scrollbar border-b border-white/5">
            {['ALL', 'PENDING', 'BOOKING'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === tab ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{tab}</button>
            ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500"><Filter size={32} className="mb-2 opacity-50"/><p>No orders found.</p></div>
            ) : (
                filteredOrders.map(order => (
                    <div key={order.id} className="glass-panel p-5 rounded-2xl border-l-4 border-l-transparent hover:border-l-orange-500 transition-all relative overflow-hidden">
                        {/* Spam Warning */}
                        {order.isFakeFlagged && (
                            <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl flex items-center gap-1">
                                <AlertTriangle size={10}/> SPAM FLAG
                            </div>
                        )}

                        {/* Order Details Grid - Matching specific requirement */}
                        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                            <div className="col-span-2 flex justify-between">
                                <h3 className="text-white font-bold text-lg">{order.customerName}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border flex items-center ${getStatusColor(order.status)}`}>{order.status}</span>
                            </div>
                            
                            <div className="text-gray-400 text-xs">Phone:</div>
                            <div className="text-white text-xs font-mono flex items-center gap-2">
                                {order.customerMobile}
                                <a href={`tel:${order.customerMobile}`} className="bg-white/10 p-1 rounded-full hover:bg-green-500 transition-colors"><Phone size={10}/></a>
                            </div>

                            <div className="text-gray-400 text-xs">Product/Service:</div>
                            <div className="text-white text-xs truncate">{order.items.map(i => i.name).join(', ')}</div>

                            <div className="text-gray-400 text-xs">Price:</div>
                            <div className="text-orange-400 font-bold text-xs">৳{order.totalAmount}</div>

                            <div className="text-gray-400 text-xs">Booking:</div>
                            <div className="text-white text-xs">
                                {order.bookingDetails ? (
                                    <span className="text-purple-300 font-bold">Yes | {order.bookingDetails.visitTime} slot</span>
                                ) : (
                                    "No"
                                )}
                            </div>

                            <div className="text-gray-400 text-xs">Advance Paid:</div>
                            <div className="text-white text-xs">
                                {order.advanceAmount ? (
                                    <span className="text-green-400 font-bold flex items-center gap-1">Yes <Check size={10}/> (৳{order.advanceAmount})</span>
                                ) : (
                                    <span className="text-gray-500">No</span>
                                )}
                            </div>

                            <div className="text-gray-400 text-xs">Delivery:</div>
                            <div className="text-white text-xs">
                                {order.isDelivery ? (
                                    <span className="text-blue-400 font-bold flex items-center gap-1"><Truck size={10}/> Home Delivery</span>
                                ) : (
                                    <span className="text-gray-500">No (In-shop pickup)</span>
                                )}
                            </div>
                        </div>

                        {/* Delivery Address if Applicable */}
                        {order.isDelivery && order.deliveryAddress && (
                            <div className="mb-4 bg-black/20 p-2 rounded border border-white/5 flex items-start gap-2">
                                <MapPin size={12} className="text-blue-500 mt-0.5"/>
                                <p className="text-xs text-gray-300">{order.deliveryAddress}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
                             {order.status === 'PENDING' && (
                                 <button onClick={() => handleStatusUpdate(order, 'CONFIRMED')} className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold">Accept Order</button>
                             )}
                             
                             {/* Pickup Flow */}
                             {!order.isDelivery && order.status === 'CONFIRMED' && (
                                 <button onClick={() => handleStatusUpdate(order, 'READY')} className="col-span-2 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-xs font-bold">Mark Ready for Pickup</button>
                             )}
                             {!order.isDelivery && order.status === 'READY' && (
                                 <button onClick={() => handleStatusUpdate(order, 'COMPLETED')} className="col-span-2 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-xs font-bold">Mark Completed</button>
                             )}

                             {/* Delivery Flow */}
                             {order.isDelivery && order.status === 'CONFIRMED' && (
                                 <button onClick={() => handleStatusUpdate(order, 'DISPATCHED')} className="col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-bold">Dispatch Order</button>
                             )}
                             {order.isDelivery && order.status === 'DISPATCHED' && (
                                 <button onClick={() => handleStatusUpdate(order, 'OUT_FOR_DELIVERY')} className="col-span-2 bg-pink-600 hover:bg-pink-500 text-white py-2 rounded-lg text-xs font-bold">Start Delivery</button>
                             )}
                             {order.isDelivery && order.status === 'OUT_FOR_DELIVERY' && (
                                 <button onClick={() => handleStatusUpdate(order, 'DELIVERED')} className="col-span-2 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-xs font-bold">Mark Delivered</button>
                             )}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};
