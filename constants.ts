
import { Product, Vendor, ViewState, Order } from './types';

export const NAV_LINKS: { label: string; view: ViewState }[] = [
  { label: 'Shop', view: 'MARKETPLACE' },
  { label: 'New Arrivals', view: 'NEW_ARRIVALS' },
  { label: 'Designers', view: 'DESIGNERS' },
  { label: 'The Maison', view: 'ABOUT' }
];

export const MOCK_VENDORS: Vendor[] = [];
export const MOCK_PRODUCTS: Product[] = [];
