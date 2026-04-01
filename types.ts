
export enum UserRole {
  BUYER = 'BUYER',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  joined: string;
  status: 'ACTIVE' | 'SUSPENDED';
  spend?: string;
  location?: string;
  verificationStatus?: VerificationStatus;
  phone?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  measurements?: {
    bust: string;
    waist: string;
    hips: string;
    height: string;
    shoeSize: string;
  };
}

export interface AppNotification {
  id: string;
  userId?: string; // 'all' or specific user ID
  title: string;
  message: string;
  read: boolean;
  date: string; // ISO string
  type: 'ORDER' | 'SYSTEM' | 'PROMO' | 'ALERT';
  link?: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  color?: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  designer: string;
  price: number;
  vendorId?: string;
  category: string;
  image: string;
  images?: string[];
  video?: string;
  description: string;
  rating: number;
  isNewSeason?: boolean;
  stock: number; // Total stock
  sizes: string[];
  variants?: ProductVariant[];
  isPreOrder?: boolean;
  isApproved?: boolean; // For admin approval
  releaseDate?: string; // ISO string for The Drop
  createdAt?: string; // ISO string for upload tracking
  votes?: number;
  dropDate?: string; // ISO string for New Arrivals countdown
  status?: 'approved' | 'rejected' | 'pending';
}

export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface PaymentMethod {
  id: string;
  type: 'BANK' | 'CRYPTO' | 'PAYPAL';
  isDefault?: boolean;
  details: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    routingNumber?: string;
    walletAddress?: string;
    network?: string; // e.g. BTC, ETH, SOL
    email?: string;
  };
}

export interface KycDocuments {
  idFront?: string;
  idBack?: string;
  proofOfAddress?: string;
  submittedAt?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

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
  facebook?: string;
  tiktok?: string;
  paymentMethods?: PaymentMethod[];
  kycDocuments?: KycDocuments;
  visualTheme?: 'MINIMALIST' | 'DARK' | 'GOLD';
  gallery?: string[];
  videoUrl?: string;
  brandName?: string;
  shipping_address?: ShippingAddress;
}

export interface Follower {
  id: string;
  name: string;
  avatar: string;
  location: string;
  joined: string;
  purchases: number;
  style: string;
  vendorId: string;
  followerId?: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  productId: string;
  date: string;
}

export interface CartItem extends Product {
  cartItemId?: string;
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
  buyerId?: string;
  shippingCost?: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'NEW' | 'READ' | 'ARCHIVED';
}

export interface Shipment {
  id: string;
  order_id: string;
  vendor_id: string;
  customer_name: string;
  destination: string;
  carrier: string;
  tracking_number: string;
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Exception';
  estimated_delivery?: string;
  created_at: string;
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
  | 'NEW_ARRIVALS_MANAGE'
  | 'DESIGNERS'
  | 'THE_DROP'
  | 'VENDOR_PROFILE'
  | 'PRODUCT_DETAIL' 
  | 'VENDOR_DASHBOARD' 
  | 'ADMIN_PANEL'
  | 'VENDOR_REVIEW'
  | 'ANALYTICS'
  | 'BUYER_DASHBOARD'
  | 'AUTH'
  | 'PROFILE_SETTINGS'
  | 'PRICING'
  | 'ABOUT'
  | 'AI_CONCIERGE';

export interface TrendAnalysis {
  title: string;
  description: string;
  colorPalette: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
  productId?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  photos?: string[];
  createdAt: string;
}

export interface AboutPageContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    imageUrl: string;
  };
  philosophy: {
    title: string;
    description1: string;
    description2: string;
    image1: string;
    image2: string;
  };
  contact: {
    address: string;
    email: string;
    phone: string;
    hours: string;
  };
}

export interface AuthPageContent {
  loginImage: string;
  registerImage: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlight: boolean;
}

export interface PricingPageContent {
  title: string;
  subtitle: string;
  description: string;
  plans: PricingPlan[];
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: 'Serif' | 'Sans';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export interface DropPageContent {
  title: string;
  subtitle: string;
  description: string;
  backgroundImages: string[];
  countdownDate: string;
  productIds: string[];
}

export interface LandingPageContent {
  theme?: ThemeSettings;
  hero: {
    videoUrl: string;
    posterUrl: string;
    subtitle: string;
    titleLine1: string;
    titleLine2: string;
    buttonText: string;
    secondaryButtonText?: string;
  };
  marquee: {
    text: string;
  };
  designers: {
    subtitle: string;
    title: string;
  };
  campaign: {
    subtitle: string;
    title: string;
    image1: string;
    image2: string;
    image3: string;
    image4: string;
    overlayText1: string;
  };
  spotlight: {
    title: string;
  };
  drop?: DropPageContent;
  about: AboutPageContent;
  auth?: AuthPageContent;
  pricing?: PricingPageContent;
}
