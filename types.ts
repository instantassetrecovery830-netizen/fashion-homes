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
}

export interface Vendor {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  verified: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  size: string;
  stock: number;
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
  | 'PRODUCT_DETAIL' 
  | 'VENDOR_DASHBOARD' 
  | 'ADMIN_PANEL'
  | 'BUYER_DASHBOARD'
  | 'AUTH';

export interface TrendAnalysis {
  title: string;
  description: string;
  colorPalette: string[];
}