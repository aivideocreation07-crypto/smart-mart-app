
import { Shop, Product, BusinessType } from './types';

export const BUSINESS_TYPES = [
  { label: 'Mart', value: BusinessType.RETAIL },
];

export const SHOP_CATEGORIES = [
  "Grocery", 
  "Vegetables & Fruits", 
  "Fish & Meat", 
  "Pharmacy",
  "Fashion & Clothing", 
  "Electronics", 
  "Mobile Shop", 
  "Hardware & Sanitary",
  "Stationery & Books", 
  "Bakery & Snacks", 
  "Home Decor", 
  "Footwear", 
  "Jewelry", 
  "Toys & Gifts", 
  "Sports", 
  "Other"
];

export const PRODUCT_CATEGORIES = [
  "Vegetables", 
  "Fruits", 
  "Fish", 
  "Meat", 
  "Rice & Grains",
  "Spices", 
  "Oil", 
  "Snacks", 
  "Beverages", 
  "Dairy", 
  "Frozen Food",
  "Personal Care", 
  "Medicine", 
  "Cleaning", 
  "Electronics",
  "Mobile Accessories", 
  "Men's Fashion", 
  "Women's Fashion",
  "Kids", 
  "Footwear", 
  "Stationery", 
  "Books", 
  "Tools",
  "Kitchenware", 
  "Home Decor", 
  "Toys", 
  "Sports", 
  "Others"
];

export const MOCK_SHOPS: Shop[] = [
  {
    id: 's1',
    ownerId: 'u1',
    name: 'Rahim General Store',
    ownerName: 'Rahim Uddin',
    category: 'Grocery',
    businessType: BusinessType.RETAIL,
    location: { lat: 23.8103, lng: 90.4125, address: 'Sector 4, Uttara' },
    phone: '01700000001',
    rating: 4.8,
    ratingCount: 124,
    imageUrl: 'https://images.unsplash.com/photo-1604719312566-b7cb0274bc71?w=400',
    bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    socialLinks: {
      facebook: 'https://facebook.com/rahimstore',
      whatsapp: '01700000001'
    },
    isVerified: true,
    hasDeliveryPartner: true,
    isDeliveryAvailable: true
  },
  {
    id: 's2',
    ownerId: 'u2',
    name: 'Sultans Mart',
    ownerName: 'Sultan Ahmed',
    category: 'Grocery',
    businessType: BusinessType.RETAIL,
    location: { lat: 23.8120, lng: 90.4140, address: 'Road 7, Uttara' },
    phone: '01700000002',
    rating: 4.9,
    ratingCount: 512,
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400',
    bannerUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800&q=80',
    isVerified: true
  },
  {
    id: 's3',
    ownerId: 'u4',
    name: 'Fashion Point',
    ownerName: 'Kamal Hossain',
    category: 'Fashion & Clothing',
    businessType: BusinessType.RETAIL,
    location: { lat: 23.8150, lng: 90.4160, address: 'Sector 9, Uttara' },
    phone: '01700000003',
    rating: 4.2,
    ratingCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    bannerUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    socialLinks: {
      instagram: 'fashionpoint_bd',
      facebook: 'fashionpoint'
    }
  }
];
