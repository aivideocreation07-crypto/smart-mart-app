import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { triggerHaptic, isOpenNow, formatTimeLeft } from '../services/utils';
import { Search, MapPin, Star, ShoppingCart, User as UserIcon, LogOut, Store, ArrowLeft, CheckCircle, X, Calendar, Banknote, ClipboardList, Clock, Navigation, Phone, MessageCircle, RefreshCw, Info, Truck, Wrench, Briefcase, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Shop, Product, MarketingPost, CartItem, Order, Review, BusinessType } from '../types';
import { SHOP_CATEGORIES, SERVICE_CATEGORIES } from '../constants';

type FeedItem = MarketingPost & { shop: Shop, distance: number };
type ShopItem = Shop & { distance: number, products: Product[] };

export const CustomerView: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  
  // Modes: SHOPPING vs SERVICES
  const [appMode, setAppMode] = useState<'SHOPPING' | 'SERVICES'>('SHOPPING');
  
  // States
  const [viewMode, setViewMode] = useState<'feed' | 'shops'>('shops'); // Default to list
  const [mainView, setMainView] = useState<'HOME' | 'ORDERS'>('HOME');
  const [searchTerm, setSearchTerm] = useState('');
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number, label?: string} | null>(user?.location || null);
  const [selectedShop, setSelectedShop] = useState<ShopItem | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');

  // Checkout States
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Checkout Configuration
  const [deliveryMode, setDeliveryMode] = useState<'PICKUP' | 'DELIVERY'>('PICKUP'); // PICKUP = Visit Shop/Parlour, DELIVERY = Home Delivery/Service

  // Booking & Address Details
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.mobile || '');
  const [customerAddress, setCustomerAddress] = useState(user?.savedAddress || '');
  const [bookingNotes, setBookingNotes] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState(0);
  
  // Rating State
  const [ratingModal, setRatingModal] = useState<string | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (user) {
        if(user.location) setUserLoc(user.location);
        setCustomerName(user.name || '');
        setCustomerPhone(user.mobile || '');
        setCustomerAddress(user.savedAddress || '');
    }
    setCart(db.getCart());
  }, [user]);

  useEffect(() => {
    if (!userLoc) return;
    const feed = db.getNearbyFeed(userLoc.lat, userLoc.lng);
    setFeedItems(feed);
    
    // Fetch and filter by mode
    const allShops = db.getNearbyShops(userLoc.lat, userLoc.lng);
    const allProducts = db.getProducts();
    
    // Filter based on App Mode
    const targetType = appMode === 'SHOPPING' ? BusinessType.RETAIL : BusinessType.SERVICE;
    
    const filteredShops = allShops
        .filter(s => s.businessType === targetType)
        .map(s => ({
            ...s,
            products: allProducts.filter(p => p.shopId === s.id)
        }));
        
    setShopItems(filteredShops);
  }, [userLoc, appMode]);

  const addToCart = (product: Product, qty: number = 1) => {
      triggerHaptic();
      const currentShopId = selectedShop?.id || product.shopId;
      // If cart has items from another shop, clear it
      const currentCart = db.getCart();
      if (currentCart.length > 0 && currentCart[0].shopId !== currentShopId) {
          if(!window.confirm("Start a new order? This will clear your current cart.")) return;
          db.clearCart();
      }

      db.addToCart({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          shopId: currentShopId,
          enableBooking: product.enableBooking,
          durationMinutes: product.durationMinutes
      });
      setCart(db.getCart());
      setShowCart(true); // Auto open for services usually one at a time
  };
  
  const handleCheckoutInit = () => {
      if (!selectedShop) return;
      triggerHaptic();
      
      // Default logic for services vs retail
      if (selectedShop.businessType === BusinessType.SERVICE) {
          // Most services are Home Delivery (Visit Home)
          if (selectedShop.isDeliveryAvailable) setDeliveryMode('DELIVERY');
          else setDeliveryMode('PICKUP'); // Visit Center
      } else {
          if (selectedShop.isPickupAvailable) setDeliveryMode('PICKUP');
          else if (selectedShop.isDeliveryAvailable) setDeliveryMode('DELIVERY');
      }
      
      setShowCart(false);
      setShowPaymentModal(true);
  };

  const handlePayment = (method: 'CASH' | 'UPI') => {
      setIsVerifying(true);
      setTimeout(() => {
          setIsVerifying(false);
          processOrder(method);
      }, 1500); 
  };

  const processOrder = (method: 'CASH' | 'UPI') => {
      if (!selectedShop) return;
      const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
      const isFake = db.checkSpam(customerPhone);
      
      const newOrder: Order = {
          id: 'ord_' + Date.now(),
          shopId: selectedShop.id,
          customerId: user?.id || 'guest',
          customerName: customerName,
          customerMobile: customerPhone,
          deliveryAddress: deliveryMode === 'DELIVERY' ? customerAddress : undefined,
          items: cart,
          totalAmount: total,
          status: 'PENDING',
          paymentMethod: method,
          paymentStatus: method === 'UPI' ? 'PAID' : 'UNPAID',
          advanceAmount: method === 'UPI' ? (advanceAmount || total) : 0,
          isDelivery: deliveryMode === 'DELIVERY',
          createdAt: Date.now(),
          isFakeFlagged: isFake,
          bookingDetails: {
              visitDate: bookingDate || 'Today',
              visitTime: bookingTime || 'ASAP',
              notes: bookingNotes,
              otp: Math.floor(1000 + Math.random() * 9000).toString()
          }
      };

      db.createOrder(newOrder);

      if (user) {
          const hasChanges = user.name !== customerName || user.mobile !== customerPhone || user.savedAddress !== customerAddress;
          if (hasChanges) updateUser({ name: customerName, mobile: customerPhone, savedAddress: customerAddress });
      }

      setShowPaymentModal(false);
      setPaymentSuccess(true);
      db.clearCart();
      setCart([]);
      setTimeout(() => {
          setPaymentSuccess(false);
          setSelectedShop(null); 
          setMainView('ORDERS');
      }, 2500);
  };
  
  const submitReview = () => {
      if (!ratingModal || !user) return;
      const order = db.getOrders().find(o => o.id === ratingModal);
      if (order) {
          const review: Review = {
              id: 'rev_'+Date.now(),
              shopId: order.shopId,
              userId: user.id,
              userName: user.name,
              rating: newRating,
              comment: newComment,
              date: Date.now()
          };
          db.addReview(review);
          setRatingModal(null);
          triggerHaptic();
      }
  };

  const filteredShops = shopItems.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          shop.products.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = activeCategory === 'All' || shop.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const cartTotal = cart.reduce((a, b) => a + (b.price * b.quantity), 0);

  // --- SUB-COMPONENT: PROVIDER/SHOP PROFILE ---
  if (selectedShop) {
      const isOpen = isOpenNow(selectedShop.openingTime, selectedShop.closingTime);
      const isService = selectedShop.businessType === BusinessType.SERVICE;
      
      return (
          <div className="h-full bg-slate-50 flex flex-col animate-fade-in z-50 overflow-hidden">
              {/* Payment Success Modal */}
              {paymentSuccess && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
                      <div className="bg-white border border-green-200 rounded-3xl p-8 text-center animate-fade-in-up shadow-2xl">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={40} className="text-green-600" /></div>
                          <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
                          <p className="text-gray-500">Provider will contact you shortly.</p>
                      </div>
                  </div>
              )}

              {/* Checkout Modal */}
              {(showCart || showPaymentModal) && (
                  <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-end justify-center">
                      <div className="bg-white w-full rounded-t-3xl p-6 h-[90vh] flex flex-col animate-fade-in-up shadow-2xl">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="text-xl font-bold text-slate-900">{showPaymentModal ? 'Secure Checkout' : 'Cart'}</h3>
                              <button onClick={() => { setShowCart(false); setShowPaymentModal(false); }}><X className="text-gray-400"/></button>
                          </div>
                          
                          {showPaymentModal ? (
                             <div className="space-y-4 flex-1 overflow-y-auto pb-10">
                                 {/* Service Type Toggle */}
                                 <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                                     {selectedShop.isPickupAvailable && (
                                         <button onClick={() => setDeliveryMode('PICKUP')} className={`flex-1 py-3 rounded-lg text-xs font-bold ${deliveryMode === 'PICKUP' ? 'bg-orange-600 text-white shadow' : 'text-gray-500'}`}>
                                             {isService ? 'Visit Center' : 'Pickup at Shop'}
                                         </button>
                                     )}
                                     {selectedShop.isDeliveryAvailable && (
                                         <button onClick={() => setDeliveryMode('DELIVERY')} className={`flex-1 py-3 rounded-lg text-xs font-bold ${deliveryMode === 'DELIVERY' ? 'bg-orange-600 text-white shadow' : 'text-gray-500'}`}>
                                             {isService ? 'Home Service' : 'Home Delivery'}
                                         </button>
                                     )}
                                 </div>

                                 <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-gray-100">
                                     <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-3 text-slate-900 text-sm" placeholder="Your Name"/>
                                     <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-3 text-slate-900 text-sm" placeholder="Mobile"/>
                                     {deliveryMode === 'DELIVERY' && <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-3 text-slate-900 text-sm" placeholder="Full Address"/>}
                                     
                                     <div className="grid grid-cols-2 gap-3">
                                         <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-3 text-slate-900 text-sm"/>
                                         <input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-3 text-slate-900 text-sm"/>
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-2 mb-4">
                                     <button onClick={() => handlePayment('CASH')} className="bg-gray-200 p-3 rounded-xl text-slate-700 font-bold text-sm hover:bg-gray-300">Pay After Service</button>
                                     <button onClick={() => handlePayment('UPI')} className="bg-blue-600 p-3 rounded-xl text-white font-bold text-sm hover:bg-blue-500">Pay Online (UPI)</button>
                                 </div>
                             </div>
                          ) : (
                             <>
                                <div className="flex-1 overflow-y-auto space-y-4">
                                    {cart.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-gray-100">
                                            <div><p className="text-slate-900 font-medium">{item.name}</p>{item.durationMinutes && <p className="text-xs text-gray-500">{item.durationMinutes} mins</p>}</div>
                                            <p className="text-orange-600 font-bold">৳{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <button onClick={handleCheckoutInit} className="w-full bg-orange-600 py-3 rounded-xl font-bold text-white shadow-lg">Proceed to Booking</button>
                                </div>
                             </>
                          )}
                      </div>
                  </div>
              )}

              {/* Header */}
              <div className="h-72 relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-slate-200">
                      {selectedShop.bannerUrl ? <img src={selectedShop.bannerUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-300"/>}
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                  </div>
                  <button onClick={() => setSelectedShop(null)} className="absolute top-4 left-4 z-10 p-2 bg-white/60 backdrop-blur-md rounded-full text-slate-900 shadow-sm"><ArrowLeft size={20}/></button>
                  
                  <div className="absolute bottom-0 left-0 w-full p-6 pt-20">
                      <div className="flex items-center gap-4 mb-3">
                        {selectedShop.imageUrl && <img src={selectedShop.imageUrl} className="w-16 h-16 rounded-2xl border-4 border-white object-cover shadow-lg"/>}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 leading-none">{selectedShop.name}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600 border border-slate-300">{selectedShop.category}</span>
                                <div className="flex items-center gap-1 text-xs text-orange-500 font-bold"><Star size={10} fill="currentColor"/> {selectedShop.rating}</div>
                            </div>
                        </div>
                      </div>
                      
                      {isService && (
                          <div className="flex gap-4 text-xs text-slate-600 mt-2">
                              {selectedShop.experienceYears && <div className="flex items-center gap-1"><Briefcase size={12} className="text-cyan-600"/> {selectedShop.experienceYears} Yrs Exp</div>}
                              {selectedShop.isVerified && <div className="flex items-center gap-1 text-green-600"><CheckCircle size={12}/> Verified Provider</div>}
                          </div>
                      )}
                  </div>
              </div>

              {/* Service/Product List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedShop.products.map(product => (
                      <div key={product.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
                          <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                              {product.imageUrl && <img src={product.imageUrl} className="w-full h-full object-cover"/>}
                          </div>
                          <div className="flex-1">
                              <h3 className="text-slate-900 font-bold">{product.name}</h3>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                              {product.durationMinutes && <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2"><Clock size={10}/> {product.durationMinutes} mins</div>}
                              <div className="flex justify-between items-center mt-3">
                                  <span className="text-orange-600 font-bold">৳{product.price}</span>
                                  <button onClick={() => addToCart(product)} className="px-4 py-2 bg-orange-50 rounded-lg hover:bg-orange-600 hover:text-white text-orange-600 text-xs font-bold transition-colors">
                                      {isService ? 'Book' : 'Add'}
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
                  
                  {isService && selectedShop.portfolioUrls && (
                      <div className="mt-8">
                          <h3 className="text-slate-400 font-bold mb-4 uppercase text-xs tracking-widest">Work Gallery</h3>
                          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                              {selectedShop.portfolioUrls.map((url, i) => (
                                  <img key={i} src={url} className="w-32 h-32 rounded-xl object-cover border border-gray-200"/>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // --- MAIN VIEW ---
  return (
      <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
          {/* Top Header */}
          <div className="p-4 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 border-b border-gray-200">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold"><UserIcon size={20}/></div>
                  <div><p className="text-xs text-gray-400 uppercase">Hello</p><p className="text-slate-900 font-bold leading-none">{user?.name || 'Guest'}</p></div>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setMainView('ORDERS')} className="p-2 bg-white rounded-full text-gray-500 hover:text-orange-600 shadow-sm border border-gray-100"><ClipboardList/></button>
                 <button onClick={logout} className="p-2 bg-white rounded-full text-gray-500 hover:text-red-500 shadow-sm border border-gray-100"><LogOut/></button>
              </div>
          </div>

          {/* Mode Switcher */}
          <div className="px-4 mt-4">
              <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                  <button onClick={() => setAppMode('SHOPPING')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${appMode === 'SHOPPING' ? 'bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-200' : 'text-gray-400'}`}>
                      <Store size={16}/> Products
                  </button>
                  <button onClick={() => setAppMode('SERVICES')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${appMode === 'SERVICES' ? 'bg-cyan-50 text-cyan-600 shadow-sm ring-1 ring-cyan-200' : 'text-gray-400'}`}>
                      <Wrench size={16}/> Services
                  </button>
              </div>
          </div>

          {/* Search & Location */}
          <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                  <Search size={20} className="text-gray-400"/>
                  <input type="text" placeholder={appMode === 'SHOPPING' ? "Search products..." : "Search services (e.g. Electrician)"} className="bg-transparent w-full text-slate-900 outline-none placeholder-gray-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              
              {/* Category Chips */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  <button onClick={() => setActiveCategory('All')} className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${activeCategory === 'All' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-500 border-gray-200'}`}>All</button>
                  {(appMode === 'SHOPPING' ? SHOP_CATEGORIES : SERVICE_CATEGORIES).map(cat => (
                      <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${activeCategory === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-500 border-gray-200'}`}>{cat}</button>
                  ))}
              </div>
          </div>

          {/* Content Feed */}
          <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4">
              {filteredShops.length === 0 ? <div className="text-center text-gray-400 mt-10">No results found.</div> : filteredShops.map(shop => (
                  <div key={shop.id} onClick={() => setSelectedShop(shop)} className="bg-white p-4 rounded-3xl border border-gray-100 cursor-pointer hover:shadow-lg transition-all group">
                      <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0 relative">
                              {shop.imageUrl ? <img src={shop.imageUrl} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-gray-300"><Store/></div>}
                              {shop.isVerified && <div className="absolute top-1 left-1 bg-green-500 text-white p-0.5 rounded-full"><CheckCircle size={8}/></div>}
                              <div className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold text-white ${isOpenNow(shop.openingTime, shop.closingTime) ? 'bg-green-500' : 'bg-red-500'}`}>
                                  {isOpenNow(shop.openingTime, shop.closingTime) ? 'Open' : 'Closed'}
                              </div>
                          </div>
                          <div className="flex-1">
                              <h3 className="text-slate-900 font-bold text-lg">{shop.name}</h3>
                              <p className="text-gray-500 text-xs mb-2">{shop.category}</p>
                              <div className="flex items-center gap-3 text-xs">
                                  <div className="flex items-center gap-1 text-orange-500 font-bold"><Star size={12} fill="currentColor"/> {shop.rating}</div>
                                  <div className="text-gray-400">{shop.distance} km</div>
                              </div>
                          </div>
                      </div>
                      
                      {/* Quick Service/Product Preview */}
                      <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                          {shop.products.slice(0, 3).map(p => (
                              <div key={p.id} className="bg-slate-50 px-3 py-2 rounded-xl border border-gray-100 whitespace-nowrap">
                                  <p className="text-slate-700 text-xs">{p.name}</p>
                                  <p className="text-orange-600 text-xs font-bold">৳{p.price}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );
};