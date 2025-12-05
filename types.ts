
export enum UserRole {
  SHOPKEEPER = 'SHOPKEEPER',
  CUSTOMER = 'CUSTOMER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER'
}

export enum BusinessType {
  RETAIL = 'RETAIL',
  SERVICE = 'SERVICE'
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  shopId?: string; // Used for both Shop and Service Profile ID
  location?: {
    lat: number;
    lng: number;
    label?: string;
  };
  following?: string[]; 
  savedAddress?: string;
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
  stock: number; // For services, this can be 999 or treated as daily capacity
  shopId: string;
  tags?: string[];
  enableBooking?: boolean;
  // Service Specific
  durationMinutes?: number;
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
  imageUrl?: string; // Logo or Profile Pic
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
  isPickupAvailable?: boolean; // For services: "Visit Shop/Center"
  isCodAvailable?: boolean;
  
  // Retail Fields
  openingTime?: string;
  closingTime?: string;
  refundPolicy?: 'NO_REFUND' | '50_PERCENT' | 'FULL_REFUND';
  
  // Service Provider Specific
  experienceYears?: number;
  visitingCharge?: number;
  portfolioUrls?: string[];
  isKycVerified?: boolean;
  
  reviews?: Review[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  shopId: string;
  enableBooking?: boolean;
  durationMinutes?: number;
}

export interface Order {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  items: CartItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'READY' | 'PICKED_UP' | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED' | 'ACCEPTED' | 'REJECTED';
  paymentMethod: 'CASH' | 'UPI' | 'QR';
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  advanceAmount?: number;
  paymentScreenshot?: string;
  deliveryAddress?: string; // For services: Service Address
  deliveryLink?: string;
  bookingDetails?: {
    visitDate: string;
    visitTime: string;
    notes?: string;
    otp?: string; // Service Start OTP
  };
  createdAt: number;
  isDelivery?: boolean; // For services: "Home Service"
  isFakeFlagged?: boolean;
}

export interface AuthState {
  user: User | null;
  shop: Shop | null;
  isLoading: boolean;
}
