
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

// --- MOCK SHOPS & PROVIDERS ---
const MOCK_SHOPS: Shop[] = [
  // ... Existing Retail Shops ...
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

  // --- NEW SERVICE PROVIDERS ---
  {
    id: 'prov_1',
    ownerId: 'u_prov_1',
    name: 'Rahim Electric Works',
    ownerName: 'Rahim Mia',
    category: 'Electrician',
    businessType: BusinessType.SERVICE,
    location: { lat: 23.8150, lng: 90.4130, address: 'Uttara, Dhaka' },
    phone: '01999999999',
    rating: 4.8,
    ratingCount: 45,
    imageUrl: 'https://images.unsplash.com/photo-1621905476059-5f34604242fa?w=400',
    bannerUrl: 'https://images.unsplash.com/photo-1621905476059-5f34604242fa?w=800',
    upiId: 'rahim@upi',
    openingTime: '09:00',
    closingTime: '20:00',
    maxBookingDistance: 10,
    isPickupAvailable: false,
    isDeliveryAvailable: true, // Home Service
    isCodAvailable: true,
    isVerified: true,
    isKycVerified: true,
    experienceYears: 8,
    visitingCharge: 200,
    portfolioUrls: [
      'https://images.unsplash.com/photo-1558402529-d2638a7023e9?w=400',
      'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=400'
    ]
  },
  {
    id: 'prov_2',
    ownerId: 'u_prov_2',
    name: 'Glow Beauty Hub',
    ownerName: 'Sadia Islam',
    category: "Women's Beauty",
    businessType: BusinessType.SERVICE,
    location: { lat: 22.4550, lng: 86.9950, address: 'Jhargram' },
    phone: '01888888888',
    rating: 4.9,
    ratingCount: 120,
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    bannerUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800',
    upiId: 'sadia@upi',
    openingTime: '10:00',
    closingTime: '19:00',
    maxBookingDistance: 5,
    isPickupAvailable: true, // Visit Parlour
    isDeliveryAvailable: true, // Home Service
    isCodAvailable: true,
    isVerified: true,
    experienceYears: 5,
    visitingCharge: 100,
    portfolioUrls: [
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400',
      'https://images.unsplash.com/photo-1596178065573-efc716752f9b?w=400'
    ]
  }
];

const SEED_PRODUCTS: Product[] = [
  // Retail Products (Existing)
  { id: 'p_phar_1', shopId: 's_dh_1', name: 'Napa Extra', nameBn: 'নাপা এক্সট্রা', price: 25, category: 'Medicine', description: 'For fever and pain.', stock: 500, enableBooking: false, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },

  // Service Listings
  { 
    id: 'srv_1', 
    shopId: 'prov_1', 
    name: 'Fan Installation', 
    nameBn: 'ফ্যান লাগানো', 
    price: 300, 
    category: 'Service', 
    description: 'Ceiling or wall fan installation.', 
    stock: 999, 
    enableBooking: true, 
    durationMinutes: 45,
    imageUrl: 'https://images.unsplash.com/photo-1621905476059-5f34604242fa?w=400' 
  },
  { 
    id: 'srv_2', 
    shopId: 'prov_1', 
    name: 'Full House Wiring Check', 
    nameBn: 'ওয়ারিং চেক', 
    price: 1500, 
    category: 'Service', 
    description: 'Complete diagnosis and minor fixing.', 
    stock: 999, 
    enableBooking: true, 
    durationMinutes: 120,
    imageUrl: 'https://images.unsplash.com/photo-1558402529-d2638a7023e9?w=400' 
  },
  { 
    id: 'srv_3', 
    shopId: 'prov_2', 
    name: 'Party Makeup', 
    nameBn: 'পার্টি মেকআপ', 
    price: 2500, 
    category: 'Service', 
    description: 'Full face makeup with hair styling.', 
    stock: 999, 
    enableBooking: true, 
    durationMinutes: 90,
    imageUrl: 'https://images.unsplash.com/photo-1487412947132-232a8408a3dd?w=400' 
  },
  { 
    id: 'srv_4', 
    shopId: 'prov_2', 
    name: 'Facial', 
    nameBn: 'ফেসিয়াল', 
    price: 1200, 
    category: 'Service', 
    description: 'Gold facial for glowing skin.', 
    stock: 999, 
    enableBooking: true, 
    durationMinutes: 60,
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400' 
  }
];

const SEED_USERS: User[] = [
  // Shopkeepers
  { id: 'u_jh_1', name: 'Amit Roy', mobile: '01711111111', role: UserRole.SHOPKEEPER, shopId: 's_jh_1' },
  { id: 'u_dh_1', name: 'Dr. Hasan', mobile: '01811111111', role: UserRole.SHOPKEEPER, shopId: 's_dh_1' },
  
  // Providers
  { id: 'u_prov_1', name: 'Rahim Mia', mobile: '01999999999', role: UserRole.SERVICE_PROVIDER, shopId: 'prov_1' },
  { id: 'u_prov_2', name: 'Sadia Islam', mobile: '01888888888', role: UserRole.SERVICE_PROVIDER, shopId: 'prov_2' },

  // Customer
  { id: 'u_cust_1', name: 'Anirban', mobile: '9800000000', role: UserRole.CUSTOMER, location: { lat: 22.4450, lng: 86.9850, label: 'Jhargram Home' }, savedAddress: 'College Para, Jhargram' }
];

const SEED_ORDERS: Order[] = [
  // Retail Order
  {
    id: 'ord_ret_1',
    shopId: 's_dh_1',
    customerId: 'u_cust_1',
    customerName: 'Anirban',
    customerMobile: '9800000000',
    items: [{ productId: 'p_phar_1', name: 'Napa Extra', price: 25, quantity: 4, shopId: 's_dh_1' }],
    totalAmount: 100,
    status: 'COMPLETED',
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    isDelivery: true,
    deliveryAddress: 'Uttara, Dhaka',
    createdAt: Date.now() - 100000000
  },
  // Service Booking (Pending)
  {
    id: 'bk_1',
    shopId: 'prov_1',
    customerId: 'u_cust_1',
    customerName: 'Anirban',
    customerMobile: '9800000000',
    items: [{ productId: 'srv_1', name: 'Fan Installation', price: 300, quantity: 1, shopId: 'prov_1', durationMinutes: 45 }],
    totalAmount: 300,
    status: 'PENDING',
    paymentMethod: 'CASH',
    paymentStatus: 'UNPAID',
    isDelivery: true, // Home Visit
    deliveryAddress: 'College Para, Jhargram',
    createdAt: Date.now() - 100000,
    bookingDetails: {
      visitDate: '2023-11-01',
      visitTime: '15:00',
      notes: 'Please bring ladder',
      otp: '4592'
    }
  }
];

// Helper to initialize LocalStorage
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

// DB Interface
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
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) products[index] = product; else products.unshift(product);
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
