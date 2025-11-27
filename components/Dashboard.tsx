
import React, { useEffect, useState } from 'react';
import { Plus, ShoppingBag, Megaphone, LogOut, Store, QrCode, TrendingUp, Package, Truck, CheckCircle, Star, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';
import { Product, BusinessType, Order } from '../types';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, shop, logout, updateShopProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Load shop data
    if (shop) {
        const allProducts = db.getProducts();
        setProducts(allProducts.filter(p => p.shopId === shop.id));
        setOrders(db.getShopOrders(shop.id));
    }
  }, [shop]);

  const toggleDelivery = () => {
      if (shop) {
          updateShopProfile({ isDeliveryAvailable: !shop.isDeliveryAvailable });
      }
  };

  if (!shop) return <div className="p-10 text-center text-gray-400">Loading Shop Data...</div>;
  
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="p-5 space-y-6 pb-24 h-full overflow-y-auto hide-scrollbar">
      
      {/* 1. HERO DIGITAL PASS */}
      <div className="glass-panel rounded-3xl p-1 relative overflow-hidden shadow-2xl animate-fade-in-up">
        {/* Banner Background */}
        <div className="absolute inset-0 z-0 opacity-60">
          {shop.bannerUrl ? (
            <img src={shop.bannerUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-900 to-gray-900"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-5">
           <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                 <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden">
                    {shop.imageUrl ? <img src={shop.imageUrl} className="w-full h-full object-cover"/> : <span className="font-bold text-xl text-orange-500">{shop.name[0]}</span>}
                 </div>
                 <div>
                    <h1 className="text-xl font-bold text-white font-bengali tracking-wide leading-tight flex items-center gap-1">
                        {shop.name}
                        {shop.isVerified && <CheckCircle size={14} className="text-blue-500 fill-current" />}
                    </h1>
                    <p className="text-xs text-gray-300 font-medium tracking-wider uppercase opacity-80">{shop.category}</p>
                 </div>
              </div>
              <button onClick={() => onNavigate('shop-profile')} className="bg-white/10 p-2 rounded-full hover:bg-white/20 backdrop-blur-md border border-white/10 transition-colors">
                  <Store size={18} className="text-white" />
              </button>
           </div>

           {/* Stats Row */}
           <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/5 flex flex-col items-center">
                 <Package size={16} className="text-cyan-400 mb-1" />
                 <span className="text-lg font-bold text-white">{products.length}</span>
                 <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                     Items
                 </span>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/5 flex flex-col items-center relative">
                 {pendingCount > 0 && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
                 <TrendingUp size={16} className="text-green-400 mb-1" />
                 <span className="text-lg font-bold text-white">
                     {orders.length}
                 </span>
                 <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                     Orders
                 </span>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center">
                 <div className="flex items-center text-yellow-400 gap-1">
                     <span className="font-bold text-lg">{shop.rating}</span>
                     <Star size={12} fill="currentColor"/>
                 </div>
                 <span className="text-[10px] text-gray-400 uppercase tracking-widest">({shop.ratingCount})</span>
              </div>
           </div>
        </div>
      </div>

      {/* 2. DELIVERY TOGGLE (If Tie-Up) */}
      {(shop.hasDeliveryPartner || shop.isDeliveryAvailable) && (
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-center sm:justify-between border border-white/5">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Truck size={20} />
                  </div>
                  <div>
                      <h3 className="text-white font-bold text-sm">Logistics Status</h3>
                      <p className="text-xs text-gray-400">{shop.isDeliveryAvailable ? 'Accepting deliveries' : 'Delivery paused'}</p>
                  </div>
              </div>
              <div 
                onClick={toggleDelivery}
                className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ml-4 ${shop.isDeliveryAvailable ? 'bg-green-500' : 'bg-gray-700'}`}
              >
                 <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${shop.isDeliveryAvailable ? 'translate-x-6' : ''}`}></div>
              </div>
          </div>
      )}

      {/* 3. NEON ACTION GRID */}
      <div>
        <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Control Center</h2>
            <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 flex items-center transition-colors">
              <LogOut size={12} className="mr-1"/> Sign Out
            </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onNavigate('add-product')}
            className="group relative h-32 glass-panel rounded-3xl overflow-hidden hover:neon-border-orange transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent group-hover:from-orange-500/20 transition-all"></div>
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-lg shadow-orange-500/10">
               <Plus size={24} />
            </div>
            <div className="absolute bottom-4 left-4 text-left">
               <span className="block text-white font-bold text-lg group-hover:translate-x-1 transition-transform">
                   Add Item
               </span>
               <span className="text-xs text-gray-400">Inventory</span>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('marketing')}
            className="group relative h-32 glass-panel rounded-3xl overflow-hidden hover:neon-border-cyan transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent group-hover:from-cyan-500/20 transition-all"></div>
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-lg shadow-cyan-500/10">
               <Megaphone size={24} />
            </div>
            <div className="absolute bottom-4 left-4 text-left">
               <span className="block text-white font-bold text-lg group-hover:translate-x-1 transition-transform">Marketing</span>
               <span className="text-xs text-gray-400">AI Boost</span>
            </div>
          </button>

          {/* Type Specific Action */}
          <button 
            onClick={() => onNavigate('orders')}
            className="col-span-2 group relative h-20 glass-panel rounded-3xl overflow-hidden opacity-90 hover:opacity-100 transition-opacity"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-transparent group-hover:from-purple-900/60 transition-all"></div>
            <div className="absolute inset-0 flex items-center justify-between px-6">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <ShoppingBag size={20} />
                    </div>
                    <div className="text-left">
                        <span className="block text-white font-bold">Manage Orders</span>
                        <span className="text-xs text-gray-400">{pendingCount} Pending • {orders.filter(o => o.bookingDetails).length} Bookings</span>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors relative">
                    <span className="text-white text-xs font-bold">{orders.length}</span>
                    {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-black"></span>}
                </div>
            </div>
          </button>

        </div>
      </div>

      {/* 4. INVENTORY GRID */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">
            Shop Showcase
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {products.length === 0 ? (
            <div className="col-span-2 p-8 border border-dashed border-gray-700 rounded-3xl text-center">
              <p className="text-gray-500 text-sm">Your showcase is empty.</p>
            </div>
          ) : (
            products.map(p => (
              <div key={p.id} className="cinematic-card rounded-2xl p-3 flex flex-col group hover:border-gray-500 transition-colors">
                 <div className="aspect-square rounded-xl bg-gray-800 overflow-hidden mb-3 relative">
                   {p.imageUrl && <img src={p.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />}
                   {p.stock >= 0 && (
                       <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-xs px-2 py-0.5 rounded text-white font-bold">
                          {p.stock}
                       </div>
                   )}
                 </div>
                 <div className="flex-1">
                   <h3 className="text-white font-bold text-sm truncate leading-tight">{p.nameBn || p.name}</h3>
                   <p className="text-xs text-gray-500 mb-2 truncate">{p.name}</p>
                   <div className="flex items-center justify-between">
                       <span className="text-orange-500 font-bold text-sm">৳{p.price}</span>
                       <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                   </div>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
