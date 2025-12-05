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
      if (status === 'PENDING') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      if (status === 'CONFIRMED') return 'text-blue-600 bg-blue-50 border-blue-200';
      if (status === 'READY' || status === 'OUT_FOR_DELIVERY') return 'text-purple-600 bg-purple-50 border-purple-200';
      if (status === 'COMPLETED' || status === 'DELIVERED') return 'text-green-600 bg-green-50 border-green-200';
      return 'text-gray-500 bg-gray-50';
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in relative">
        {/* Notification Panel Overlay */}
        {showNotifPanel && (
            <div className="absolute top-16 right-4 z-50 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 animate-fade-in-up">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-slate-900 font-bold text-xs uppercase">Notifications</h4>
                    <button onClick={() => setShowNotifPanel(false)}><X size={14} className="text-gray-400"/></button>
                </div>
                {notifications.length === 0 ? (
                    <p className="text-gray-400 text-xs">No new alerts.</p>
                ) : (
                    <ul className="space-y-2">
                        {notifications.map((n, i) => (
                            <li key={i} className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100 flex items-center gap-2">
                                <Bell size={10} fill="currentColor"/> {n}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )}

        {/* Header */}
        <div className="p-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100"><ArrowLeft size={20} className="text-slate-700"/></button>
                <h2 className="font-bold text-lg text-slate-900 uppercase tracking-wider">Dashboard</h2>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setShowNotifPanel(!showNotifPanel)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 relative">
                    <Bell size={18}/>
                    {notifications.length > 0 && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                </button>
                <button onClick={refreshOrders} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"><RefreshCw size={18}/></button>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 overflow-x-auto hide-scrollbar border-b border-gray-200 bg-white">
            {['ALL', 'PENDING', 'BOOKING'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === tab ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-100 text-gray-500 hover:bg-slate-200'}`}>{tab}</button>
            ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400"><Filter size={32} className="mb-2 opacity-50"/><p>No orders found.</p></div>
            ) : (
                filteredOrders.map(order => (
                    <div key={order.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                        {/* Spam Warning */}
                        {order.isFakeFlagged && (
                            <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-bl-xl flex items-center gap-1 border-l border-b border-red-200">
                                <AlertTriangle size={10}/> SPAM FLAG
                            </div>
                        )}

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                            <div className="col-span-2 flex justify-between">
                                <h3 className="text-slate-900 font-bold text-lg">{order.customerName}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border flex items-center ${getStatusColor(order.status)}`}>{order.status}</span>
                            </div>
                            
                            <div className="text-gray-500 text-xs">Phone:</div>
                            <div className="text-slate-900 text-xs font-mono flex items-center gap-2">
                                {order.customerMobile}
                                <a href={`tel:${order.customerMobile}`} className="bg-green-100 p-1 rounded-full text-green-600 hover:bg-green-200 transition-colors"><Phone size={10}/></a>
                            </div>

                            <div className="text-gray-500 text-xs">Product/Service:</div>
                            <div className="text-slate-900 text-xs truncate">{order.items.map(i => i.name).join(', ')}</div>

                            <div className="text-gray-500 text-xs">Price:</div>
                            <div className="text-orange-600 font-bold text-xs">৳{order.totalAmount}</div>

                            <div className="text-gray-500 text-xs">Booking:</div>
                            <div className="text-slate-900 text-xs">
                                {order.bookingDetails ? (
                                    <span className="text-purple-600 font-bold">Yes | {order.bookingDetails.visitTime} slot</span>
                                ) : (
                                    "No"
                                )}
                            </div>

                            <div className="text-gray-500 text-xs">Advance Paid:</div>
                            <div className="text-slate-900 text-xs">
                                {order.advanceAmount ? (
                                    <span className="text-green-600 font-bold flex items-center gap-1">Yes <Check size={10}/> (৳{order.advanceAmount})</span>
                                ) : (
                                    <span className="text-gray-400">No</span>
                                )}
                            </div>

                            <div className="text-gray-500 text-xs">Delivery:</div>
                            <div className="text-slate-900 text-xs">
                                {order.isDelivery ? (
                                    <span className="text-blue-600 font-bold flex items-center gap-1"><Truck size={10}/> Home Delivery</span>
                                ) : (
                                    <span className="text-gray-400">No (In-shop pickup)</span>
                                )}
                            </div>
                        </div>

                        {/* Delivery Address if Applicable */}
                        {order.isDelivery && order.deliveryAddress && (
                            <div className="mb-4 bg-slate-50 p-2 rounded border border-gray-200 flex items-start gap-2">
                                <MapPin size={12} className="text-blue-500 mt-0.5"/>
                                <p className="text-xs text-gray-600">{order.deliveryAddress}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
                             {order.status === 'PENDING' && (
                                 <button onClick={() => handleStatusUpdate(order, 'CONFIRMED')} className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold shadow-sm">Accept Order</button>
                             )}
                             
                             {/* Pickup Flow */}
                             {!order.isDelivery && order.status === 'CONFIRMED' && (
                                 <button onClick={() => handleStatusUpdate(order, 'READY')} className="col-span-2 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-xs font-bold shadow-sm">Mark Ready for Pickup</button>
                             )}
                             {!order.isDelivery && order.status === 'READY' && (
                                 <button onClick={() => handleStatusUpdate(order, 'COMPLETED')} className="col-span-2 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-xs font-bold shadow-sm">Mark Completed</button>
                             )}

                             {/* Delivery Flow */}
                             {order.isDelivery && order.status === 'CONFIRMED' && (
                                 <button onClick={() => handleStatusUpdate(order, 'DISPATCHED')} className="col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-bold shadow-sm">Dispatch Order</button>
                             )}
                             {order.isDelivery && order.status === 'DISPATCHED' && (
                                 <button onClick={() => handleStatusUpdate(order, 'OUT_FOR_DELIVERY')} className="col-span-2 bg-pink-600 hover:bg-pink-500 text-white py-2 rounded-lg text-xs font-bold shadow-sm">Start Delivery</button>
                             )}
                             {order.isDelivery && order.status === 'OUT_FOR_DELIVERY' && (
                                 <button onClick={() => handleStatusUpdate(order, 'DELIVERED')} className="col-span-2 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-xs font-bold shadow-sm">Mark Delivered</button>
                             )}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};