
import { Shop, Product, BusinessType } from './types';

export const BUSINESS_TYPES = [
  { label: 'Mart (Retail)', value: BusinessType.RETAIL },
  { label: 'Service Provider', value: BusinessType.SERVICE },
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

export const SERVICE_CATEGORIES = [
  "AC Repair",
  "Plumber",
  "Electrician",
  "Carpenter",
  "Home Painting",
  "Cleaning",
  "Men's Salon",
  "Women's Beauty",
  "Appliance Repair",
  "Pest Control",
  "Driver",
  "Tutor",
  "Photographer",
  "Event Planner"
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
  "Service", // New category
  "Others"
];

// Mock data remains in db.ts, constants usually just for static lists in this architecture
export const MOCK_SHOPS: Shop[] = []; 
