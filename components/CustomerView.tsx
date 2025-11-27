
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { triggerHaptic, isOpenNow, formatTimeLeft } from '../services/utils';
import { Search, MapPin, Star, ShoppingCart, User as UserIcon, LogOut, Store, ArrowLeft, CheckCircle, X, Calendar, Banknote, ClipboardList, Clock, Navigation, Phone, MessageCircle, RefreshCw, Info, Truck, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Shop, Product, MarketingPost, CartItem, Order, Review } from '../types';
import { SHOP_CATEGORIES } from '../constants';

type FeedItem = MarketingPost & { shop: Shop, distance: number };
type ShopItem = Shop & { distance: number, products: Product[] };

export const CustomerView: React.FC = () => {
  const { user, logout } = useAuth();
  
  // States
  const [viewMode, setViewMode] = useState<'feed' | 'shops'>('feed');
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
  
  // Checkout Configuration (Delivery vs Pickup)
  const [deliveryMode, setDeliveryMode] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');

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

  // Initial Load - Check Location
  useEffect(() => {
    if (user?.location) {
        setUserLoc(user.location);
    }
    setCart(db.getCart());
  }, [user]);

  // Fetch Data based on Location
  useEffect(() => {
    if (!userLoc) return;
    const feed = db.getNearbyFeed(userLoc.lat, userLoc.lng);
    setFeedItems(feed);
    const shops = db.getNearbyShops(userLoc.lat, userLoc.lng);
    const allProducts = db.getProducts();
    const enrichedShops = shops.map(s => ({
        ...s,
        products: allProducts.filter(p => p.shopId === s.id)
    }));
    setShopItems(enrichedShops);
  }, [userLoc]);

  const addToCart = (product: Product, qty: number = 1) => {
      triggerHaptic();
      const currentShopId = selectedShop?.id || product.shopId;
      db.addToCart({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          shopId: currentShopId,
          enableBooking: product.enableBooking
      });
      setCart(db.getCart());
  };
  
  const handleReorder = (orderItems: CartItem[], shopId: string) => {
      triggerHaptic();
      const shop = shopItems.find(s => s.id === shopId);
      if(shop) {
          setSelectedShop(shop);
          db.clearCart();
          orderItems.forEach(item => db.addToCart(item));
          setCart(db.getCart());
          setShowCart(true);
      }
  };

  const handleCheckoutInit = () => {
      if (!selectedShop) return;
      triggerHaptic();
      
      // Default to what the shop supports
      if (selectedShop.isPickupAvailable) setDeliveryMode('PICKUP');
      else if (selectedShop.isDeliveryAvailable) setDeliveryMode('DELIVERY');
      
      setShowCart(false);
      setShowPaymentModal(true);
  };

  const handlePayment = (method: 'CASH' | 'UPI') => {
      if (!selectedShop) return;
      triggerHaptic();
      
      if (method === 'UPI') {
          setIsVerifying(true);
          setTimeout(() => {
              setIsVerifying(false);
              processOrder(method);
          }, 2000); 
      } else {
          processOrder(method);
      }
  };

  const processOrder = (method: 'CASH' | 'UPI') => {
      const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
      const isFake = db.checkSpam(customerPhone);
      
      const newOrder: Order = {
          id: 'ord_' + Date.now(),
          shopId: selectedShop!.id,
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
          bookingDetails: deliveryMode === 'PICKUP' ? {
              visitDate: bookingDate || 'Today',
              visitTime: bookingTime || 'ASAP',
              notes: bookingNotes
          } : undefined
      };

      db.createOrder(newOrder);
      if (user && customerAddress && user.savedAddress !== customerAddress) {
          db.saveUser({...user, savedAddress: customerAddress});
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

  const filteredFeed = feedItems.filter(item => {
      const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.shop.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
  });

  const cartTotal = cart.reduce((a, b) => a + (b.price * b.quantity), 0);

  const getStatusColor = (status: string) => {
      if (status === 'OUT_FOR_DELIVERY') return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      if (status === 'DISPATCHED') return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      if (status === 'COMPLETED' || status === 'DELIVERED') return 'text-green-400 bg-green-400/10 border-green-400/20';
      if (status === 'PENDING') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      if (status === 'CANCELLED') return 'text-red-400 bg-red-400/10 border-red-400/20';
      return 'text-gray-400';
  };

  // --- VIEW: ORDERS ---
  if (mainView === 'ORDERS') {
      const myOrders = db.getOrders().filter(o => o.customerId === user?.id).sort((a,b) => b.createdAt - a.createdAt);
      return (
          <div className="h-full flex flex-col bg-[#020617] animate-fade-in">
              {ratingModal && (
                  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
                      <div className="bg-gray-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm animate-fade-in-up">
                          <h3 className="text-white font-bold text-lg mb-4 text-center">Rate your experience</h3>
                          <div className="flex justify-center gap-2 mb-4">
                              {[1,2,3,4,5].map(star => (
                                  <Star key={star} size={32} fill={star <= newRating ? "#f59e0b" : "none"} className={star <= newRating ? "text-yellow-500" : "text-gray-600"} onClick={() => setNewRating(star)} />
                              ))}
                          </div>
                          <textarea className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm mb-4 outline-none focus:border-orange-500" rows={3} placeholder="Write a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                          <div className="flex gap-2">
                              <button onClick={() => setRatingModal(null)} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-400 font-bold">Cancel</button>
                              <button onClick={submitReview} className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-bold">Submit</button>
                          </div>
                      </div>
                  </div>
              )}
              <div className="p-4 flex items-center gap-3 bg-black/20 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
                  <button onClick={() => setMainView('HOME')} className="p-2 rounded-full hover:bg-white/10"><ArrowLeft size={20} className="text-white"/></button>
                  <h2 className="font-bold text-lg text-white">আমার অর্ডার (My Orders)</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                  {myOrders.length === 0 ? <div className="text-center text-gray-500 py-10"><ClipboardList size={48} className="mx-auto mb-4 opacity-50"/><p>You haven't placed any orders yet.</p></div> : myOrders.map(order => {
                      const shop = db.getShopById(order.shopId);
                      const isBooked = !!order.bookingDetails;
                      const timeLeft = isBooked ? formatTimeLeft(order.bookingDetails!.visitDate, order.bookingDetails!.visitTime) : null;
                      return (
                          <div key={order.id} className="glass-panel p-4 rounded-2xl border-l-4 border-l-transparent hover:border-l-orange-500 transition-all">
                              <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-gray-800 border border-white/10 overflow-hidden">
                                          {shop?.imageUrl ? <img src={shop.imageUrl} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full"><Store size={16} className="text-gray-500"/></div>}
                                      </div>
                                      <div>
                                          <h3 className="text-white font-bold text-sm">{shop?.name || 'Unknown Shop'}</h3>
                                          <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                      </div>
                                  </div>
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getStatusColor(order.status)}`}>{order.status}</span>
                              </div>
                              <div className="bg-black/20 rounded-lg p-2 mb-3 space-y-1">
                                  {order.items.map((item, idx) => (<div key={idx} className="flex justify-between text-xs text-gray-400"><span>{item.quantity}x {item.name}</span><span>৳{item.price * item.quantity}</span></div>))}
                                  <div className="border-t border-white/5 pt-1 mt-1 flex justify-between text-sm text-white font-bold"><span>Total</span><span>৳{order.totalAmount}</span></div>
                              </div>
                              {isBooked && (
                                  <div className="mb-3 space-y-2">
                                      <div className="flex items-center gap-2 text-xs text-orange-300 bg-orange-900/20 px-2 py-1.5 rounded border border-orange-500/20">
                                          <Calendar size={12}/><span>Visit: {order.bookingDetails!.visitDate} @ {order.bookingDetails!.visitTime}</span>
                                      </div>
                                      {timeLeft && order.status !== 'COMPLETED' && (<div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 px-2 py-1.5 rounded border border-green-500/20 animate-pulse"><Clock size={12}/><span>Time to visit: {timeLeft}</span></div>)}
                                  </div>
                              )}
                              <div className="flex gap-2">
                                  <button onClick={() => handleReorder(order.items, order.shopId)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><RefreshCw size={12}/> Reorder</button>
                                  {(order.status === 'COMPLETED' || order.status === 'DELIVERED') && (<button onClick={() => { setRatingModal(order.id); triggerHaptic(); }} className="flex-1 bg-white/5 hover:bg-white/10 text-yellow-400 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Star size={12}/> Rate Shop</button>)}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  }

  // --- SUB-COMPONENT: BRANDED STORE PAGE ---
  if (selectedShop) {
      const isOpen = isOpenNow(selectedShop.openingTime, selectedShop.closingTime);
      return (
          <div className="h-full bg-[#020617] flex flex-col animate-fade-in z-50 overflow-hidden">
              {paymentSuccess && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
                      <div className="bg-gray-900 border border-green-500 rounded-3xl p-8 text-center animate-fade-in-up">
                          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={40} className="text-green-500" /></div>
                          <h2 className="text-2xl font-bold text-white mb-2">সফল হয়েছে! (Success)</h2>
                          <p className="text-gray-400">Order placed successfully.</p>
                      </div>
                  </div>
              )}

              {(showCart || showPaymentModal) && (
                  <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-end justify-center">
                      <div className="bg-gray-900 w-full rounded-t-3xl p-6 h-[90vh] flex flex-col animate-fade-in-up border-t border-white/10 shadow-2xl">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="text-xl font-bold text-white">{showPaymentModal ? 'Secure Checkout' : 'আপনার ঝুড়ি (Cart)'}</h3>
                              <button onClick={() => { setShowCart(false); setShowPaymentModal(false); triggerHaptic(); }}><X className="text-gray-400"/></button>
                          </div>
                          
                          {showPaymentModal ? (
                             <div className="space-y-4 flex-1 overflow-y-auto pb-10">
                                 {/* Mode Selection Toggle */}
                                 <div className="flex bg-gray-800 p-1 rounded-xl mb-4">
                                     {selectedShop.isPickupAvailable && (
                                         <button 
                                            onClick={() => setDeliveryMode('PICKUP')}
                                            className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${deliveryMode === 'PICKUP' ? 'bg-orange-600 text-white' : 'text-gray-400'}`}
                                         >
                                             <Store size={16}/> Pickup / Visit
                                         </button>
                                     )}
                                     {selectedShop.isDeliveryAvailable && (
                                         <button 
                                            onClick={() => setDeliveryMode('DELIVERY')}
                                            className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${deliveryMode === 'DELIVERY' ? 'bg-orange-600 text-white' : 'text-gray-400'}`}
                                         >
                                             <Truck size={16}/> Home Delivery
                                         </button>
                                     )}
                                 </div>

                                 {/* Dynamic Form based on Mode */}
                                 <div className="bg-white/5 p-4 rounded-xl space-y-3">
                                     <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase mb-2">
                                         <UserIcon size={12}/> Your Details
                                     </div>
                                     <input type="text" placeholder="Your Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm outline-none"/>
                                     <input type="tel" placeholder="Mobile Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm outline-none"/>
                                     
                                     {deliveryMode === 'DELIVERY' && (
                                         <input type="text" placeholder="Full Delivery Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm outline-none"/>
                                     )}

                                     {deliveryMode === 'PICKUP' && (
                                         <div className="grid grid-cols-2 gap-3">
                                             <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm outline-none"/>
                                             <input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm outline-none"/>
                                         </div>
                                     )}
                                 </div>

                                 {/* Order Summary */}
                                 <div className="bg-white/5 p-4 rounded-xl">
                                     <div className="flex justify-between text-gray-300 text-sm mb-2">
                                         <span>Total Bill</span>
                                         <span>৳{cartTotal}</span>
                                     </div>
                                     {deliveryMode === 'PICKUP' && selectedShop.refundPolicy && (
                                         <div className="mt-2 text-[10px] text-gray-500 bg-black/20 p-2 rounded flex items-start gap-1">
                                             <Info size={12} className="shrink-0 mt-0.5"/>
                                             <span>Policy: {selectedShop.refundPolicy.replace('_', ' ')}</span>
                                         </div>
                                     )}
                                 </div>

                                 {/* Payments */}
                                 {selectedShop.upiId && (
                                     <div className="p-5 bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl border border-blue-500/30 text-center relative overflow-hidden">
                                         {isVerifying && (
                                             <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                                                 <RefreshCw className="animate-spin text-blue-400 mb-2" size={32}/>
                                                 <p className="text-blue-400 font-bold text-sm">Verifying...</p>
                                             </div>
                                         )}
                                         <h4 className="text-blue-300 font-bold mb-4">Pay Advance via UPI</h4>
                                         <div className="bg-white p-2 w-48 h-48 mx-auto rounded-xl mb-4">
                                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${selectedShop.upiId}&pn=${encodeURIComponent(selectedShop.name)}&am=${deliveryMode === 'PICKUP' ? (advanceAmount || 80) : cartTotal}&cu=BDT`} className="w-full h-full" alt="UPI QR"/>
                                         </div>
                                         <div className="grid grid-cols-2 gap-2 mb-4">
                                             <a href={`upi://pay?pa=${selectedShop.upiId}&pn=${selectedShop.name}&am=${cartTotal}`} className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-bold block">App Pay</a>
                                             <label className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-bold block cursor-pointer">
                                                 Upload Proof <input type="file" className="hidden" onChange={() => handlePayment('UPI')}/>
                                             </label>
                                         </div>
                                     </div>
                                 )}

                                 {/* COD Option - Only if Shop enables it AND not in Booking mode if shop enforces advance */}
                                 {selectedShop.isCodAvailable && (
                                     <div className="p-4 bg-gray-800 rounded-xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-orange-500" onClick={() => handlePayment('CASH')}>
                                         <div className="flex items-center gap-3">
                                             <span className="text-green-500 font-bold text-xl">৳</span>
                                             <span className="text-white font-bold">{deliveryMode === 'DELIVERY' ? 'Cash on Delivery' : 'Pay at Shop'}</span>
                                         </div>
                                     </div>
                                 )}
                             </div>
                          ) : (
                             <>
                                <div className="flex-1 overflow-y-auto space-y-4">
                                    {cart.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center bg-gray-800 p-3 rounded-xl">
                                            <div><p className="text-white font-medium">{item.name}</p><p className="text-xs text-gray-500">Qty: {item.quantity}</p></div>
                                            <p className="text-orange-500 font-bold">৳{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-800">
                                    <div className="flex justify-between text-white font-bold text-lg mb-4"><span>Total</span><span>৳{cartTotal}</span></div>
                                    <button onClick={handleCheckoutInit} disabled={cart.length === 0} className="w-full bg-orange-600 py-3 rounded-xl font-bold text-white disabled:opacity-50">Proceed to Checkout</button>
                                </div>
                             </>
                          )}
                      </div>
                  </div>
              )}
              {/* Cinematic Header */}
              <div className="h-64 relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gray-800">{selectedShop.bannerUrl ? <img src={selectedShop.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-60" /> : <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"/>}</div>
                  <button onClick={() => setSelectedShop(null)} className="absolute top-4 left-4 z-10 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 border border-white/10"><ArrowLeft size={20}/></button>
                  <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md flex items-center gap-1 ${isOpen ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'}`}>
                      {isOpen ? <><CheckCircle size={12}/> Open Now</> : <><X size={12}/> Closed</>}
                  </div>
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent p-6 pt-20">
                      <div className="flex items-center gap-3 mb-2">
                        {selectedShop.imageUrl && <img src={selectedShop.imageUrl} className="w-12 h-12 rounded-full border-2 border-orange-500 object-cover"/>}
                        <div><h1 className="text-2xl font-bold text-white font-bengali leading-none">{selectedShop.name}</h1><div className="flex items-center gap-2 mt-1"><div className="flex items-center gap-1 bg-yellow-500/20 px-1.5 py-0.5 rounded text-yellow-500 text-[10px] font-bold border border-yellow-500/30">{selectedShop.rating} <Star size={8} fill="currentColor"/></div><span className="text-xs text-gray-400">{selectedShop.category}</span></div></div>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-gray-300 text-xs flex items-center gap-1 opacity-80"><MapPin size={12} className="text-orange-500"/> {selectedShop.location.address}</p>
                        <div className="flex gap-2">
                             {selectedShop.socialLinks?.whatsapp && (<a href={`https://wa.me/${selectedShop.socialLinks.whatsapp}`} className="p-2 bg-green-600 rounded-full text-white"><MessageCircle size={16}/></a>)}
                             <a href={`tel:${selectedShop.phone}`} className="p-2 bg-blue-600 rounded-full text-white"><Phone size={16}/></a>
                             <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedShop.location.lat},${selectedShop.location.lng}`} target="_blank" className="p-2 bg-gray-700 rounded-full text-white flex items-center gap-1 px-3 text-xs font-bold"><Navigation size={14}/> <span>Map</span></a>
                        </div>
                      </div>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedShop.products.length === 0 ? <div className="text-center text-gray-500 py-10">No products listed yet.</div> : (
                      <div className="grid grid-cols-2 gap-4 pb-24">
                          {selectedShop.products.map(product => (
                              <div key={product.id} className="bg-gray-900 rounded-2xl p-3 border border-white/5 flex flex-col hover:border-gray-700 transition-colors">
                                  <div className="aspect-square bg-gray-800 rounded-xl mb-3 overflow-hidden relative">
                                      {product.imageUrl && <img src={product.imageUrl} className="w-full h-full object-cover"/>}
                                      {product.enableBooking && <div className="absolute top-2 left-2 bg-orange-600 text-[8px] text-white font-bold px-1.5 py-0.5 rounded shadow">BOOKABLE</div>}
                                  </div>
                                  <h3 className="text-white font-bold text-sm truncate">{product.nameBn || product.name}</h3>
                                  <p className="text-[10px] text-gray-500 line-clamp-1 mb-2">{product.name}</p>
                                  <div className="flex justify-between items-center mt-auto">
                                      <span className="text-orange-500 font-bold text-sm">৳{product.price}</span>
                                      <button onClick={() => addToCart(product)} className="bg-white/10 p-2 rounded-lg hover:bg-orange-600 hover:text-white text-gray-300 transition-colors"><ShoppingCart size={16}/></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
              {cart.length > 0 && (
                  <div className="fixed bottom-6 left-0 w-full px-4 z-40">
                      <button onClick={() => { setShowCart(true); triggerHaptic(); }} className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-2xl shadow-[0_10px_30px_rgba(249,115,22,0.4)] flex justify-between px-6 text-white font-bold items-center transition-all">
                          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold border border-white/20">{cart.reduce((a,b)=>a+b.quantity,0)}</div><span className="text-sm">Items in Cart</span></div><span className="text-lg">৳{cartTotal}</span>
                      </button>
                  </div>
              )}
          </div>
      );
  }

  return (
      <div className="h-full flex flex-col bg-[#020617] animate-fade-in">
          <div className="p-4 flex items-center justify-between sticky top-0 bg-[#020617]/80 backdrop-blur-md z-10 border-b border-white/5">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20"><UserIcon size={20}/></div>
                  <div><h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">স্বাগতম (Welcome)</h2><p className="text-white font-bold leading-none">{user?.name || 'Guest'}</p></div>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={() => setMainView('ORDERS')} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-orange-400 transition-colors"><ClipboardList size={18}/></button>
                  <button onClick={logout} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"><LogOut size={18}/></button>
              </div>
          </div>
          <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-3 focus-within:border-orange-500/50 transition-colors">
                  <Search size={20} className="text-gray-500"/><input type="text" placeholder="Search Shops or Products..." className="bg-transparent w-full text-white outline-none placeholder-gray-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {userLoc && (<div className="flex items-center justify-between text-xs text-gray-400"><div className="flex items-center gap-2"><MapPin size={12} className="text-orange-500"/><span>Near {userLoc.label || 'You'}</span></div><span className="text-orange-500 font-bold opacity-80 animate-pulse">Live</span></div>)}
          </div>
          <div className="px-4 mb-4">
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                  <button onClick={() => { setViewMode('feed'); triggerHaptic(); }} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'feed' ? 'bg-gray-700 text-white shadow' : 'text-gray-500'}`}>Offers</button>
                  <button onClick={() => { setViewMode('shops'); triggerHaptic(); }} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'shops' ? 'bg-gray-700 text-white shadow' : 'text-gray-500'}`}>Shops</button>
              </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4">
              {viewMode === 'feed' ? (
                  filteredFeed.length === 0 ? <div className="text-center text-gray-500 mt-10">No active offers.</div> : filteredFeed.map(item => (
                      <div key={item.id} onClick={() => setSelectedShop({...item.shop, distance: item.distance, products: []})} className="glass-panel p-4 rounded-3xl cursor-pointer hover:border-orange-500/30 transition-colors group">
                          <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/10">{item.shop.imageUrl ? <img src={item.shop.imageUrl} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-xs font-bold text-gray-500">{item.shop.name[0]}</div>}</div>
                              <div><h3 className="text-white font-bold text-sm">{item.shop.name}</h3><p className="text-[10px] text-gray-500">{item.distance} km away • {item.shop.category}</p></div>
                          </div>
                          {item.imageUrl && <div className="aspect-video rounded-xl bg-black overflow-hidden mb-3 border border-white/5"><img src={item.imageUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"/></div>}
                          <p className="text-gray-300 text-sm font-bengali leading-relaxed">{item.content}</p>
                          <div className="mt-3 flex justify-between items-center"><span className="text-[10px] text-gray-500 uppercase tracking-widest">Limited Offer</span><button className="text-orange-500 text-xs font-bold hover:underline">VISIT SHOP</button></div>
                      </div>
                  ))
              ) : (
                  filteredShops.length === 0 ? <div className="text-center text-gray-500 mt-10">No shops found.</div> : filteredShops.map(shop => {
                      const open = isOpenNow(shop.openingTime, shop.closingTime);
                      return (
                          <div key={shop.id} onClick={() => setSelectedShop(shop)} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 cursor-pointer transition-colors relative">
                              <div className="w-16 h-16 rounded-xl bg-gray-800 overflow-hidden shrink-0 border border-white/10">{shop.imageUrl ? <img src={shop.imageUrl} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-gray-500"><Store/></div>}</div>
                              <div className="flex-1 min-w-0"><h3 className="text-white font-bold text-sm truncate">{shop.name}</h3><p className="text-xs text-gray-500 truncate">{shop.category} • {shop.location.address}</p><div className="flex items-center gap-2 mt-1"><div className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold bg-yellow-900/20 px-1.5 py-0.5 rounded border border-yellow-500/20">{shop.rating} <Star size={8} fill="currentColor"/></div><span className="text-[10px] text-gray-600">{shop.distance} km</span></div></div>
                              <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${open ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          </div>
                      );
                  })
              )}
          </div>
      </div>
  );
};
