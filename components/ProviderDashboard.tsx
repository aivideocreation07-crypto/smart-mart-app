import React, { useEffect, useState } from 'react';
import { Plus, CheckCircle, Clock, MapPin, Phone, User, LogOut, Star, Calendar, X, AlertTriangle, ChevronRight, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';
import { Product, Order } from '../types';

interface ProviderDashboardProps {
  onNavigate: (view: string) => void;
  setVoiceContext: (ctx: string) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ onNavigate, setVoiceContext }) => {
  const { user, shop, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'SCHEDULE' | 'SERVICES'>('REQUESTS');
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Product[]>([]);

  useEffect(() => {
    if (shop) {
        setServices(db.getProducts().filter(p => p.shopId === shop.id));
        refreshOrders();
    }
  }, [shop]);

  const refreshOrders = () => {
    if (shop) {
      const all = db.getShopOrders(shop.id);
      setOrders(all.sort((a, b) => b.createdAt - a.createdAt));
    }
  };

  // Auto refresh
  useEffect(() => {
    const interval = setInterval(refreshOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStatus = (order: Order, status: Order['status'], otp?: string) => {
    // In a real app, verify OTP here if status is 'IN_PROGRESS' or similar
    db.updateOrder({ ...order, status });
    refreshOrders();
    setVoiceContext(`Booking marked as ${status}`);
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const activeBookings = orders.filter(o => ['CONFIRMED', 'ACCEPTED', 'READY', 'DISPATCHED'].includes(o.status));

  if (!shop) return <div>Loading...</div>;

  return (
    <div className="h-full flex flex-col bg-slate-50 relative pb-20 overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-white border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 overflow-hidden">
                {shop.imageUrl ? <img src={shop.imageUrl} className="w-full h-full object-cover"/> : <Briefcase className="m-3 text-cyan-500"/>}
             </div>
             <div>
                <h1 className="text-xl font-bold text-slate-900">{shop.name}</h1>
                <div className="flex items-center gap-2 text-xs text-cyan-600">
                    <span>{shop.category}</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span className="flex items-center"><Star size={10} fill="currentColor" className="mr-0.5"/> {shop.rating}</span>
                </div>
             </div>
          </div>
          <button onClick={logout} className="p-2 bg-slate-100 rounded-full text-red-500 hover:bg-red-50"><LogOut size={18}/></button>
        </div>
        
        {/* Earnings Summary */}
        <div className="grid grid-cols-3 gap-2 mt-4">
             <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 text-center shadow-sm">
                 <p className="text-[10px] text-gray-500 uppercase">Today's Jobs</p>
                 <p className="text-lg font-bold text-slate-900">{activeBookings.length}</p>
             </div>
             <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 text-center shadow-sm">
                 <p className="text-[10px] text-gray-500 uppercase">Pending</p>
                 <p className="text-lg font-bold text-orange-500">{pendingOrders.length}</p>
             </div>
             <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 text-center shadow-sm">
                 <p className="text-[10px] text-gray-500 uppercase">Rating</p>
                 <p className="text-lg font-bold text-yellow-500">{shop.rating}</p>
             </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-2 bg-slate-50 gap-2 overflow-x-auto hide-scrollbar border-b border-gray-200">
         {['REQUESTS', 'SCHEDULE', 'SERVICES'].map(tab => (
             <button 
                key={tab} 
                onClick={() => setActiveTab(tab as any)} 
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-cyan-600 text-white shadow' : 'text-gray-500 hover:text-slate-900'}`}
             >
                 {tab}
             </button>
         ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {activeTab === 'SERVICES' && (
            <div className="space-y-4 animate-fade-in">
                <button onClick={() => onNavigate('add-service')} className="w-full py-4 border border-dashed border-cyan-300 rounded-xl flex flex-col items-center justify-center text-cyan-600 hover:bg-cyan-50 transition-colors bg-white">
                    <Plus size={24} className="mb-1"/>
                    <span className="text-sm font-bold">Add New Service</span>
                </button>
                {services.map(srv => (
                    <div key={srv.id} className="bg-white p-3 rounded-xl flex gap-3 border border-gray-200 shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                            {srv.imageUrl && <img src={srv.imageUrl} className="w-full h-full object-cover"/>}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-slate-900 font-bold">{srv.name}</h3>
                            <p className="text-xs text-gray-500">{srv.durationMinutes} mins • ৳{srv.price}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100">Active</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'REQUESTS' && (
            <div className="space-y-4 animate-fade-in">
                {pendingOrders.length === 0 ? <p className="text-center text-gray-400 py-10">No new requests.</p> : pendingOrders.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-200 border-l-4 border-l-orange-500 relative shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-slate-900 font-bold text-lg">{order.customerName}</h3>
                                <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                                    <MapPin size={10}/> {order.deliveryAddress || 'No Address Provided'}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-orange-600 font-bold text-lg">৳{order.totalAmount}</p>
                                <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                            </div>
                        </div>
                        
                        <div className="bg-slate-50 p-2 rounded mb-3 border border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-slate-800 font-bold mb-1">
                                <Calendar size={14} className="text-cyan-600"/>
                                {order.bookingDetails?.visitDate} <span className="text-gray-400">at</span> {order.bookingDetails?.visitTime}
                            </div>
                            <div className="text-xs text-gray-500 pl-6">
                                {order.items.map(i => i.name).join(', ')}
                            </div>
                        </div>

                        <div className="flex gap-2">
                             <button onClick={() => handleStatus(order, 'REJECTED')} className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-xs transition-colors">Decline</button>
                             <button onClick={() => handleStatus(order, 'CONFIRMED')} className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs transition-colors shadow-sm">Accept Job</button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'SCHEDULE' && (
            <div className="space-y-4 animate-fade-in">
                {activeBookings.length === 0 ? <p className="text-center text-gray-400 py-10">No active schedule.</p> : activeBookings.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                         <div className="flex justify-between mb-2">
                             <span className="text-cyan-600 text-xs font-bold px-2 py-0.5 bg-cyan-50 rounded border border-cyan-100">{order.status}</span>
                             {order.bookingDetails?.otp && <span className="text-xs text-slate-700 bg-gray-100 px-2 rounded border border-gray-200">OTP: {order.bookingDetails.otp}</span>}
                         </div>
                         <h3 className="text-slate-900 font-bold">{order.customerName}</h3>
                         <div className="text-sm text-gray-500 mb-2 flex items-center gap-1"><Phone size={12}/> {order.customerMobile}</div>
                         <div className="text-sm text-gray-500 mb-4 flex items-center gap-1"><MapPin size={12}/> {order.deliveryAddress}</div>
                         
                         {order.status === 'CONFIRMED' && (
                             <button onClick={() => handleStatus(order, 'ACCEPTED')} className="w-full py-2 bg-blue-600 rounded-lg text-white text-xs font-bold hover:bg-blue-500 shadow-sm">Start Travel</button>
                         )}
                         {order.status === 'ACCEPTED' && (
                             <button onClick={() => handleStatus(order, 'COMPLETED')} className="w-full py-2 bg-green-600 rounded-lg text-white text-xs font-bold hover:bg-green-500 shadow-sm">Complete Job</button>
                         )}
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Bottom Nav for Provider */}
      <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 flex justify-around text-gray-400 shadow-lg">
           <button onClick={() => onNavigate('dashboard')} className="flex flex-col items-center text-cyan-600"><Briefcase size={20}/><span className="text-[10px] mt-1">Jobs</span></button>
           <button onClick={() => onNavigate('shop-profile')} className="flex flex-col items-center hover:text-slate-900"><User size={20}/><span className="text-[10px] mt-1">Profile</span></button>
      </div>
    </div>
  );
};