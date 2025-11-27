
export enum UserRole {
  SHOPKEEPER = 'SHOPKEEPER',
  CUSTOMER = 'CUSTOMER'
}

export enum BusinessType {
  RETAIL = 'RETAIL'
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  shopId?: string; // If shopkeeper
  location?: {
    lat: number;
    lng: number;
    label?: string;
  };
  following?: string[]; 
  savedAddress?: string; // New: Auto-fill
}

export interface Review {
  id: string;
  shopId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: number;
}

export interface Product {
  id: string;
  name: string;
  nameBn?: string;
  price: number;
  category: string;
  description: string;
  imageUrl?: string;
  stock: number;
  shopId: string;
  tags?: string[];
  enableBooking?: boolean;
}

export interface MarketingPost {
  id: string;
  shopId: string;
  type: 'POSTER' | 'TEXT_OFFER' | 'VIDEO_SCRIPT';
  content: string;
  summaryBn?: string;
  imageUrl?: string;
  offerDetails?: {
    discountPercent?: string;
    couponCode?: string;
  };
  createdAt: number;
  expiresAt?: number;
  channels?: string[];
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  ownerName: string;
  category: string;
  businessType: BusinessType;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  phone: string;
  rating: number;
  ratingCount: number;
  imageUrl?: string;
  bannerUrl?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    youtube?: string;
    website?: string;
  };
  upiId?: string;
  deliveryPartnerName?: string;
  deliveryTrackingTemplate?: string;
  maxBookingDistance?: number;
  isVerified?: boolean;
  hasDeliveryPartner?: boolean;
  
  // Feature Flags
  isDeliveryAvailable?: boolean;
  isPickupAvailable?: boolean;
  isCodAvailable?: boolean; // Cash on Delivery support
  
  // New Fields
  openingTime?: string; // e.g., "09:00"
  closingTime?: string; // e.g., "22:00"
  refundPolicy?: 'NO_REFUND' | '50_PERCENT' | 'FULL_REFUND';
  reviews?: Review[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  shopId: string;
  enableBooking?: boolean;
}

export interface Order {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  items: CartItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'READY' | 'PICKED_UP' | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED';
  paymentMethod: 'CASH' | 'UPI' | 'QR';
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  advanceAmount?: number;
  paymentScreenshot?: string;
  deliveryAddress?: string;
  deliveryLink?: string;
  bookingDetails?: {
    visitDate: string;
    visitTime: string;
    notes?: string;
  };
  createdAt: number;
  isDelivery?: boolean;
  isFakeFlagged?: boolean; // Spam detection flag
}

export interface AuthState {
  user: User | null;
  shop: Shop | null;
  isLoading: boolean;
}
