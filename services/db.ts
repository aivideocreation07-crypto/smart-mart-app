
import { User, Shop, Product, UserRole, MarketingPost, Order, CartItem, BusinessType, Review } from '../types';
import { calculateDistance } from './utils';

const STORAGE_KEYS = {
  USERS: 'smart_mart_users',
  SHOPS: 'smart_mart_shops',
  PRODUCTS: 'smart_mart_products',
  POSTS: 'smart_mart_posts',
  ORDERS: 'smart_mart_orders',
  BOOKINGS: 'smart_mart_bookings',
  CART: 'smart_mart_cart',
  CURRENT_USER_ID: 'smart_mart_session',
  REVIEWS: 'smart_mart_reviews'
};

// --- MOCK SHOPS (Jhargram & Dhaka Mix) ---
const MOCK_SHOPS: Shop[] = [
  // 1. Restaurant (Jhargram)
  {
    id: 's_jh_1',
    ownerId: 'u_jh_1',
    name: 'FreshBite Restaurant',
    ownerName: 'Amit Roy',
    category: 'Restaurant',
    businessType: BusinessType.RETAIL,
    location: { lat: 22.4500, lng: 86.9900, address: 'Station Road, Jhargram' },
    phone: '01711111111',
    rating: 4.5,
    ratingCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    upiId: 'freshbite@upi',
    openingTime: '10:00',
    closingTime: '23:00',
    maxBookingDistance: 3,
    isPickupAvailable: true,
    isDeliveryAvailable: false,
    isCodAvailable: false, 
    refundPolicy: '50_PERCENT'
  },
  // 2. Barber (Jhargram)
  {
    id: 's_jh_2',
    ownerId: 'u_jh_2',
    name: 'Glow Barber Shop',
    ownerName: 'Samir Das',
    category: 'Barber',
    businessType: BusinessType.RETAIL,
    location: { lat: 22.4400, lng: 86.9800, address: 'Raghunathpur, Jhargram' },
    phone: '01722222222',
    rating: 4.8,
    ratingCount: 156,
    imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400',
    bannerUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800',
    upiId: 'glowbarber@upi',
    openingTime: '08:00',
    closingTime: '21:00',
    maxBookingDistance: 5,
    isPickupAvailable: true, 
    isDeliveryAvailable: false,
    isCodAvailable: false, 
    refundPolicy: 'NO_REFUND'
  },
  // 3. Grocery (Jhargram)
  {
    id: 's_jh_3',
    ownerId: 'u_jh_3',
    name: 'QuickDeliver Grocery',
    ownerName: 'Ratan Saha',
    category: 'Grocery',
    businessType: BusinessType.RETAIL,
    location: { lat: 22.4600, lng: 87.0000, address: 'Main Market, Jhargram' },
    phone: '01733333333',
    rating: 4.2,
    ratingCount: 340,
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400',
    bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    upiId: 'quickgrocer@upi',
    openingTime: '07:30',
    closingTime: '22:00',
    maxBookingDistance: 10,
    isPickupAvailable: true,
    isDeliveryAvailable: true,
    isCodAvailable: true,
    hasDeliveryPartner: true,
    deliveryPartnerName: 'Jhargram Express'
  },
  // 4. Pharmacy (Dhaka - Uttara)
  {
    id: 's_dh_1',
    ownerId: 'u_dh_1',
    name: 'MedLife Pharmacy',
    ownerName: 'Dr. Hasan',
    category: 'Pharmacy',
    businessType: BusinessType.RETAIL,
    location: { lat: 23.8105, lng: 90.4120, address: 'Sector 4, Uttara, Dhaka' },
    phone: '01811111111',
    rating: 4.9,
    ratingCount: 210,
    imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
    bannerUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800',
    upiId: 'medlife@upi',
    openingTime: '08:00',
    closingTime: '23:59',
    maxBookingDistance: 5,
    isPickupAvailable: true,
    isDeliveryAvailable: true,
    isCodAvailable: true,
    deliveryPartnerName: 'Self Delivery'
  },
  // 5. Electronics (Dhaka - Uttara)
  {
    id: 's_dh_2',
    ownerId: 'u_dh_2',
    name: 'Gadget Zone',
    ownerName: 'Fahim Ahmed',
    category: 'Electronics',
    businessType: BusinessType.RETAIL,
    location: { lat: 23.8130, lng: 90.4150, address: 'Sector 7, Uttara, Dhaka' },
    phone: '01822222222',
    rating: 4.3,
    ratingCount: 45,
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400',
    bannerUrl: 'https://images.unsplash.com/photo-1593344484962-796055d4a3a4?w=800',
    openingTime: '11:00',
    closingTime: '21:00',
    maxBookingDistance: 10,
    isPickupAvailable: true,
    isDeliveryAvailable: false, // In-store only for expensive items
    isCodAvailable: false,
    refundPolicy: 'NO_REFUND'
  },
  // 6. Sweets/Bakery (Jhargram)
  {
    id: 's_jh_4',
    ownerId: 'u_jh_4',
    name: 'Mondal Sweets',
    ownerName: 'Bipul Mondal',
    category: 'Bakery & Snacks',
    businessType: BusinessType.RETAIL,
    location: { lat: 22.4550, lng: 86.9950, address: 'Bazar Road, Jhargram' },
    phone: '01833333333',
    rating: 4.7,
    ratingCount: 500,
    imageUrl: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400',
    bannerUrl: 'https://images.unsplash.com/photo-1612203985729-70726954388c?w=800',
    upiId: 'mondalsweets@upi',
    openingTime: '07:00',
    closingTime: '22:00',
    maxBookingDistance: 2,
    isPickupAvailable: true,
    isDeliveryAvailable: true,
    isCodAvailable: true,
    refundPolicy: 'FULL_REFUND'
  }
];

const SEED_PRODUCTS: Product[] = [
  // Restaurant Items
  { id: 'p_res_1', shopId: 's_jh_1', name: 'Chicken Biryani', nameBn: 'চিকেন বিরিয়ানি', price: 220, category: 'Food', description: 'Kolkata style with potato.', stock: 50, enableBooking: true, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
  { id: 'p_res_2', shopId: 's_jh_1', name: 'Egg Roll', nameBn: 'ডিম রোল', price: 50, category: 'Snacks', description: 'Spicy and crunchy.', stock: 100, enableBooking: false, imageUrl: 'https://images.unsplash.com/photo-1606335191932-f245c6136a8d?w=400' },
  
  // Barber Services
  { id: 'p_bar_1', shopId: 's_jh_2', name: 'Haircut', nameBn: 'চুল কাটা', price: 80, category: 'Service', description: 'Professional styling.', stock: 999, enableBooking: true, imageUrl: 'https://images.unsplash.com/photo-1593702295094-aea8c5c93169?w=400' },
  { id: 'p_bar_2', shopId: 's_jh_2', name: 'Shaving', nameBn: 'শেভিং', price: 50, category: 'Service', description: 'Clean shave with foam.', stock: 999, enableBooking: true, imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400' },

  // Grocery Items
  { id: 'p_gro_1', shopId: 's_jh_3', name: 'Mustard Oil (1L)', nameBn: 'সরিষার তেল', price: 180, category: 'Grocery', description: 'Pure Ghani oil.', stock: 100, enableBooking: false, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
  { id: 'p_gro_2', shopId: 's_jh_3', name: 'Miniket Rice (5kg)', nameBn: 'মিনিকেট চাল', price: 350, category: 'Grocery', description: 'Premium quality rice.', stock: 20, enableBooking: true, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },

  // Pharmacy Items (MedLife)
  { id: 'p_phar_1', shopId: 's_dh_1', name: 'Napa Extra', nameBn: 'নাপা এক্সট্রা', price: 25, category: 'Medicine', description: 'For fever and pain.', stock: 500, enableBooking: false, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
  { id: 'p_phar_2', shopId: 's_dh_1', name: 'Digital Thermometer', nameBn: 'থার্মোমিটার', price: 150, category: 'Medical Device', description: 'Accurate reading.', stock: 15, enableBooking: true, imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400' },

  // Electronics (Gadget Zone)
  { id: 'p_elec_1', shopId: 's_dh_2', name: 'USB-C Cable', nameBn: 'চার্জিং কেবল', price: 300, category: 'Accessories', description: 'Fast charging supported.', stock: 50, enableBooking: false, imageUrl: 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?w=400' },
  { id: 'p_elec_2', shopId: 's_dh_2', name: 'Bluetooth Headset', nameBn: 'ব্লুটুথ হেডসেট', price: 1200, category: 'Audio', description: 'Bass boosted sound.', stock: 10, enableBooking: true, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },

  // Sweets (Mondal Sweets)
  { id: 'p_swt_1', shopId: 's_jh_4', name: 'Rosogolla (1kg)', nameBn: 'রসগোল্লা', price: 250, category: 'Sweets', description: 'Famous spongy sweets.', stock: 30, enableBooking: true, imageUrl: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400' },
  { id: 'p_swt_2', shopId: 's_jh_4', name: 'Chocolate Cake', nameBn: 'চকলেট কেক', price: 600, category: 'Bakery', description: '1 Pound birthday cake.', stock: 5, enableBooking: true, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' }
];

const SEED_USERS: User[] = [
  // Shopkeepers (Existing)
  { id: 'u_jh_1', name: 'Amit Roy', mobile: '01711111111', role: UserRole.SHOPKEEPER, shopId: 's_jh_1' },
  { id: 'u_jh_2', name: 'Samir Das', mobile: '01722222222', role: UserRole.SHOPKEEPER, shopId: 's_jh_2' }, 
  { id: 'u_jh_3', name: 'Ratan Saha', mobile: '01733333333', role: UserRole.SHOPKEEPER, shopId: 's_jh_3' },
  
  // Shopkeepers (New)
  { id: 'u_dh_1', name: 'Dr. Hasan', mobile: '01811111111', role: UserRole.SHOPKEEPER, shopId: 's_dh_1' }, // Pharmacy
  { id: 'u_dh_2', name: 'Fahim Ahmed', mobile: '01822222222', role: UserRole.SHOPKEEPER, shopId: 's_dh_2' }, // Electronics
  { id: 'u_jh_4', name: 'Bipul Mondal', mobile: '01833333333', role: UserRole.SHOPKEEPER, shopId: 's_jh_4' }, // Sweets
  
  // Customer
  { id: 'u_cust_1', name: 'Anirban', mobile: '9800000000', role: UserRole.CUSTOMER, location: { lat: 22.4450, lng: 86.9850, label: 'Jhargram Home' }, savedAddress: 'College Para, Jhargram' }
];

const SEED_ORDERS: Order[] = [
  // Anirban's Booking at Glow Barber Shop
  {
    id: 'ord_sample_1',
    shopId: 's_jh_2',
    customerId: 'u_cust_1',
    customerName: 'Anirban',
    customerMobile: '9800000000',
    items: [{ productId: 'p_bar_1', name: 'Haircut', price: 80, quantity: 1, shopId: 's_jh_2' }],
    totalAmount: 80,
    status: 'CONFIRMED',
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    advanceAmount: 80,
    isDelivery: false,
    createdAt: Date.now() - 3600000,
    bookingDetails: {
      visitDate: 'Today',
      visitTime: '18:30',
      notes: 'Please keep evening slot'
    }
  },
  // Spam Order Example
  {
    id: 'ord_spam_1',
    shopId: 's_jh_2',
    customerId: 'u_spam_1',
    customerName: 'Spam User',
    customerMobile: '9999999999',
    items: [],
    totalAmount: 0,
    status: 'PENDING',
    paymentMethod: 'CASH',
    paymentStatus: 'UNPAID',
    createdAt: Date.now(),
    isFakeFlagged: true
  },
  // Past Order at Sweet Shop
  {
    id: 'ord_sample_2',
    shopId: 's_jh_4',
    customerId: 'u_cust_1',
    customerName: 'Anirban',
    customerMobile: '9800000000',
    items: [{ productId: 'p_swt_1', name: 'Rosogolla (1kg)', price: 250, quantity: 2, shopId: 's_jh_4' }],
    totalAmount: 500,
    status: 'DELIVERED',
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    isDelivery: true,
    deliveryAddress: 'College Para, Jhargram',
    createdAt: Date.now() - 86400000 * 2 // 2 days ago
  }
];

const initDB = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(MOCK_SHOPS));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
  }
};

initDB();

export const db = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
  getShops: (): Shop[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOPS) || '[]'),
  getProducts: (): Product[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]'),
  getOrders: (): Order[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]'),
  getReviews: (): Review[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]'),
  getPosts: (): MarketingPost[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]'),
  
  saveUser: (user: User) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) users[index] = user; else users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  saveShop: (shop: Partial<Shop> & { id: string }) => {
    const shops = db.getShops();
    const index = shops.findIndex(s => s.id === shop.id);
    if (index >= 0) shops[index] = { ...shops[index], ...shop }; else shops.push(shop as Shop);
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
  },

  saveProduct: (product: Product) => {
    const products = db.getProducts();
    products.unshift(product);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  
  savePost: (post: MarketingPost) => {
    const posts = db.getPosts();
    posts.unshift(post);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  },

  createOrder: (order: Order) => {
    const orders = db.getOrders();
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  updateOrder: (order: Order) => {
    const orders = db.getOrders();
    const index = orders.findIndex(o => o.id === order.id);
    if (index >= 0) {
      orders[index] = order;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  getShopOrders: (shopId: string): Order[] => {
    return db.getOrders().filter(o => o.shopId === shopId);
  },
  
  checkSpam: (mobile: string): boolean => {
    const recentOrders = db.getOrders().filter(o => 
      o.customerMobile === mobile && 
      (Date.now() - o.createdAt) < 60000 
    );
    return recentOrders.length >= 2; 
  },
  
  addReview: (review: Review) => {
    const reviews = db.getReviews();
    reviews.push(review);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    
    // Update shop rating
    const shopReviews = reviews.filter(r => r.shopId === review.shopId);
    const avg = shopReviews.reduce((acc, curr) => acc + curr.rating, 0) / shopReviews.length;
    const shops = db.getShops();
    const sIndex = shops.findIndex(s => s.id === review.shopId);
    if (sIndex >= 0) {
      shops[sIndex].rating = Number(avg.toFixed(1));
      shops[sIndex].ratingCount = shopReviews.length;
      localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
    }
  },

  getCart: (): CartItem[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]'),
  addToCart: (item: CartItem) => {
    const cart = db.getCart();
    const existingIndex = cart.findIndex(c => c.productId === item.productId);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += item.quantity;
    } else {
      cart.push(item);
    }
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  },
  clearCart: () => localStorage.setItem(STORAGE_KEYS.CART, '[]'),

  login: (mobile: string): User | null => {
    const users = db.getUsers();
    return users.find(u => u.mobile === mobile) || null;
  },

  getSession: (): string | null => localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID),
  setSession: (id: string) => localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id),
  clearSession: () => localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID),
  
  getShopByOwnerId: (ownerId: string): Shop | undefined => db.getShops().find(s => s.ownerId === ownerId),
  getShopById: (id: string): Shop | undefined => db.getShops().find(s => s.id === id),

  getNearbyShops: (lat: number, lng: number): (Shop & { distance: number })[] => {
    const shops = db.getShops();
    const shopsWithDist = shops.map(shop => ({
      ...shop,
      distance: calculateDistance(lat, lng, shop.location.lat, shop.location.lng)
    }));
    return shopsWithDist.sort((a, b) => a.distance - b.distance);
  },
  
  getNearbyFeed: (lat: number, lng: number): (MarketingPost & { shop: Shop, distance: number })[] => {
    const posts = db.getPosts();
    const shops = db.getShops();
    const feed = posts.map(post => {
      const shop = shops.find(s => s.id === post.shopId);
      if (!shop) return null;
      const dist = calculateDistance(lat, lng, shop.location.lat, shop.location.lng);
      return { ...post, shop, distance: dist };
    }).filter(item => item !== null) as (MarketingPost & { shop: Shop, distance: number })[];
    return feed.sort((a, b) => a.distance - b.distance);
  }
};
