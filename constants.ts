import { Product, Vendor, ViewState, Order } from './types';

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Maison Margaux',
    bio: 'Avant-garde tailoring meets sustainable fabrics. Based in Paris.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    verificationStatus: 'VERIFIED',
    subscriptionStatus: 'ACTIVE',
    location: 'Paris, France',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070',
    email: 'contact@margaux.com',
    subscriptionPlan: 'Maison',
    website: 'https://maisonmargaux.com',
    instagram: '@maisonmargaux',
    twitter: '@margaux_paris'
  },
  {
    id: 'v2',
    name: 'KAIZEN Studios',
    bio: 'Streetwear reimagined for the digital age. Tokyo-inspired technical gear.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    verificationStatus: 'VERIFIED',
    subscriptionStatus: 'ACTIVE',
    location: 'Tokyo, Japan',
    coverImage: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=2070',
    email: 'info@kaizen.jp',
    subscriptionPlan: 'Atelier',
    website: 'https://kaizen.jp',
    instagram: '@kaizen_studios',
    twitter: '@kaizen_jp'
  },
  {
    id: 'v3',
    name: 'Studio Null',
    bio: 'Minimalist leather goods and accessories stripping away the non-essential.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    verificationStatus: 'PENDING',
    subscriptionStatus: 'INACTIVE',
    location: 'Berlin, Germany',
    coverImage: 'https://images.unsplash.com/photo-1470309864661-68328b2cd0a5?q=80&w=2070',
    email: 'hello@studionull.com',
    subscriptionPlan: 'Atelier',
    website: 'https://studionull.com',
    instagram: '@studionull',
    twitter: '@null_berlin'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Asymmetric Silk Trench',
    designer: 'Maison Margaux',
    price: 1250,
    category: 'Outerwear',
    image: 'https://picsum.photos/id/325/600/800',
    description: 'A deconstructed trench coat featuring raw hems and an oversized belt.',
    rating: 4.8,
    isNewSeason: true,
    stock: 12,
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    id: 'p2',
    name: 'Obsidian Cargo Pant',
    designer: 'KAIZEN Studios',
    price: 450,
    category: 'Bottoms',
    image: 'https://picsum.photos/id/1005/600/800',
    description: 'Technical fabric cargo pants with modular pockets and adjustable cuffs.',
    rating: 4.5,
    isNewSeason: false,
    stock: 40,
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'p3',
    name: 'Structure Knit Sweater',
    designer: 'Maison Margaux',
    price: 680,
    category: 'Knitwear',
    image: 'https://picsum.photos/id/1027/600/800',
    description: 'Heavy gauge wool blend with architectural shoulder pads.',
    rating: 4.9,
    stock: 5,
    sizes: ['M', 'L']
  },
  {
    id: 'p4',
    name: 'Void Runner Sneakers',
    designer: 'KAIZEN Studios',
    price: 890,
    category: 'Footwear',
    image: 'https://picsum.photos/id/103/600/800',
    description: 'Chunky sole sneakers with reflective detailing.',
    rating: 4.2,
    isNewSeason: true,
    stock: 25,
    sizes: ['39', '40', '41', '42', '43', '44']
  },
  {
    id: 'p5',
    name: 'Minimalist Leather Tote',
    designer: 'Studio Null',
    price: 1500,
    category: 'Accessories',
    image: 'https://picsum.photos/id/250/600/800',
    description: 'Full grain leather tote with zero hardware.',
    rating: 5.0,
    stock: 8,
    sizes: ['One Size']
  },
  {
    id: 'p6',
    name: 'Drape Neck Silk Dress',
    designer: 'Maison Margaux',
    price: 2100,
    category: 'Clothing',
    image: 'https://picsum.photos/id/338/600/800',
    description: 'Liquid silk evening wear. Made to order.',
    rating: 5.0,
    isNewSeason: true,
    stock: 3,
    sizes: ['XS', 'S', 'M'],
    isPreOrder: true
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord_1',
    customerName: 'Alice V.',
    date: 'Oct 24, 2023',
    total: 1250,
    status: 'Processing',
    items: [
      { ...MOCK_PRODUCTS[0], quantity: 1, size: 'M', stock: 12 }
    ]
  },
  {
    id: 'ord_2',
    customerName: 'James B.',
    date: 'Oct 22, 2023',
    total: 2100,
    status: 'Shipped',
    items: [
      { ...MOCK_PRODUCTS[5], quantity: 1, size: 'S', stock: 3, measurements: 'Bust: 88, Waist: 60' }
    ]
  }
];

export const NAV_LINKS: { label: string; view: ViewState }[] = [
  { label: 'New Arrivals', view: 'NEW_ARRIVALS' },
  { label: 'Designers', view: 'DESIGNERS' },
  { label: 'Shop All', view: 'MARKETPLACE' },
];