
import { Product, Vendor, ViewState, Order } from './types';

export const NAV_LINKS: { label: string; view: ViewState }[] = [
  { label: 'Shop', view: 'MARKETPLACE' },
  { label: 'New Arrivals', view: 'NEW_ARRIVALS' },
  { label: 'Designers', view: 'DESIGNERS' },
  { label: 'The Maison', view: 'ABOUT' }
];

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
    bio: 'Minimalist streetwear from Tokyo. Focusing on silhouette and utility.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    verificationStatus: 'VERIFIED',
    subscriptionStatus: 'ACTIVE',
    location: 'Tokyo, Japan',
    coverImage: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=2070',
    email: 'info@kaizen.jp',
    subscriptionPlan: 'Atelier',
    website: 'https://kaizenstudios.jp',
    instagram: '@kaizen_studios'
  },
  {
    id: 'v3',
    name: 'Studio Null',
    bio: 'Experimental knitwear and deconstructed forms. Based in Berlin.',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop',
    verificationStatus: 'PENDING',
    subscriptionStatus: 'INACTIVE',
    location: 'Berlin, Germany',
    coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070',
    email: 'hello@studionull.de',
    subscriptionPlan: 'Atelier',
    website: 'https://studionull.de',
    instagram: '@studio_null'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Asymmetric Silk Trench',
    designer: 'Maison Margaux',
    price: 890,
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000',
    description: 'A deconstructed trench coat featuring asymmetric lapels and a belted waist. Crafted from raw silk blends.',
    rating: 4.8,
    isNewSeason: true,
    stock: 5,
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    id: 'p2',
    name: 'Obsidian Cargo Pant',
    designer: 'KAIZEN Studios',
    price: 450,
    category: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000',
    description: 'Heavyweight technical cotton cargos with multiple utility pockets and adjustable hem.',
    rating: 4.5,
    stock: 12,
    sizes: ['30', '32', '34', '36']
  },
  {
    id: 'p3',
    name: 'Distressed Mohair Knit',
    designer: 'Studio Null',
    price: 620,
    category: 'Knitwear',
    image: 'https://images.unsplash.com/photo-1621335829175-95f437384d7c?q=80&w=1000',
    description: 'Hand-knit mohair sweater with intentional distressing and drop-shoulder fit.',
    rating: 5.0,
    isNewSeason: true,
    stock: 3,
    sizes: ['S/M', 'L/XL']
  },
  {
    id: 'p4',
    name: 'Void Runner Sneakers',
    designer: 'KAIZEN Studios',
    price: 380,
    category: 'Footwear',
    image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1000',
    description: 'Sculptural sneakers featuring a split sole design and neoprene upper.',
    rating: 4.7,
    stock: 8,
    sizes: ['39', '40', '41', '42', '43', '44', '45']
  },
  {
    id: 'p5',
    name: 'Structured Leather Tote',
    designer: 'Maison Margaux',
    price: 1200,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000',
    description: 'Minimalist leather tote with silver hardware and raw edges.',
    rating: 4.9,
    stock: 4,
    sizes: ['One Size']
  }
];
