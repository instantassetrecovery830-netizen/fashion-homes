import { Product, Vendor, ViewState } from './types';

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Maison Margaux',
    bio: 'Avant-garde tailoring meets sustainable fabrics. Based in Paris.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    verified: true
  },
  {
    id: 'v2',
    name: 'KAIZEN Studios',
    bio: 'Streetwear reimagined for the digital age. Tokyo-inspired technical gear.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    verified: true
  },
  {
    id: 'v3',
    name: 'Studio Null',
    bio: 'Minimalist leather goods and accessories stripping away the non-essential.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    verified: false
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
    stock: 12
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
    stock: 40
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
    stock: 5
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
    stock: 25
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
    stock: 8
  },
  {
    id: 'p6',
    name: 'Drape Neck Silk Dress',
    designer: 'Maison Margaux',
    price: 2100,
    category: 'Clothing',
    image: 'https://picsum.photos/id/338/600/800',
    description: 'Liquid silk evening wear.',
    rating: 5.0,
    isNewSeason: true,
    stock: 3
  }
];

export const NAV_LINKS: { label: string; view: ViewState }[] = [
  { label: 'New Arrivals', view: 'NEW_ARRIVALS' },
  { label: 'Designers', view: 'DESIGNERS' },
  { label: 'Shop All', view: 'MARKETPLACE' },
];