export enum UserRole {
  BUYER = 'BUYER',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN'
}

export interface Product {
  id: string;
  name: string;
  designer: string;
  price: number;
  category: string;
  image: string;
  description: string;
  rating: number;
  isNewSeason?: boolean;
  stock: number;
  sizes: string[];
  isPreOrder?: boolean;
}

export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface Vendor {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  verificationStatus: VerificationStatus;
  subscriptionStatus: SubscriptionStatus;
  location?: string;
  coverImage?: string;
  email?: string;
  subscriptionPlan?: 'Atelier' | 'Maison' | 'Couture';
  website?: string;
  instagram?: string;
  twitter?: string;
}

export interface CartItem extends Product {
  quantity: number;
  size: string;
  stock: number;
  measurements?: string;
}

export interface Order {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  items: CartItem[];
}

export interface FeatureFlags {
  enableMarketplace: boolean;
  enableReviews: boolean;
  enableAiStyleMatch: boolean;
  maintenanceMode: boolean;
}

export type ViewState = 
  | 'LANDING' 
  | 'MARKETPLACE' 
  | 'NEW_ARRIVALS'
  | 'DESIGNERS'
  | 'VENDOR_PROFILE'
  | 'PRODUCT_DETAIL' 
  | 'VENDOR_DASHBOARD' 
  | 'ADMIN_PANEL'
  | 'BUYER_DASHBOARD'
  | 'AUTH'
  | 'PROFILE_SETTINGS'
  | 'PRICING';

export interface TrendAnalysis {
  title: string;
  description: string;
  colorPalette: string[];
}