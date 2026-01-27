import { pool } from './db';
import { MOCK_VENDORS, MOCK_PRODUCTS } from '../constants';
import { Product, Vendor, Order } from '../types';

// Helper to map DB row to Vendor type
const mapVendor = (row: any): Vendor => ({
  id: row.id,
  name: row.name,
  bio: row.bio,
  avatar: row.avatar,
  verificationStatus: row.verification_status as any,
  subscriptionStatus: row.subscription_status as any,
  location: row.location,
  coverImage: row.cover_image,
  email: row.email,
  subscriptionPlan: row.subscription_plan as any,
  website: row.website,
  instagram: row.instagram,
  twitter: row.twitter
});

// Helper to map DB row to Product type
const mapProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  designer: row.designer,
  price: Number(row.price),
  category: row.category,
  image: row.image,
  description: row.description,
  rating: Number(row.rating),
  isNewSeason: row.is_new_season,
  stock: row.stock,
  sizes: row.sizes,
  isPreOrder: row.is_pre_order
});

const mapOrder = (row: any): Order => ({
  id: row.id,
  customerName: row.customer_name,
  date: row.date,
  total: Number(row.total),
  status: row.status as any,
  items: row.items
});

export const seedDatabase = async () => {
  try {
    console.log('Checking database state...');
    
    // Create Vendors Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id TEXT PRIMARY KEY,
        name TEXT,
        bio TEXT,
        avatar TEXT,
        verification_status TEXT,
        subscription_status TEXT,
        location TEXT,
        cover_image TEXT,
        email TEXT,
        subscription_plan TEXT,
        website TEXT,
        instagram TEXT,
        twitter TEXT
      );
    `);

    // Create Products Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT,
        designer TEXT,
        price NUMERIC,
        category TEXT,
        image TEXT,
        description TEXT,
        rating NUMERIC,
        is_new_season BOOLEAN,
        stock INTEGER,
        sizes TEXT[],
        is_pre_order BOOLEAN
      );
    `);

    // Create Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT,
        date TEXT,
        total NUMERIC,
        status TEXT,
        items JSONB
      );
    `);

    // Check if we need to seed initial data (only if empty)
    const vendorCount = await pool.query('SELECT COUNT(*) FROM vendors');
    
    if (parseInt(vendorCount.rows[0].count) === 0) {
      console.log('Seeding Vendors...');
      for (const v of MOCK_VENDORS) {
        await pool.query(`
          INSERT INTO vendors (id, name, bio, avatar, verification_status, subscription_status, location, cover_image, email, subscription_plan, website, instagram, twitter)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [v.id, v.name, v.bio, v.avatar, v.verificationStatus, v.subscriptionStatus, v.location, v.coverImage, v.email, v.subscriptionPlan, v.website, v.instagram, v.twitter]);
      }
    }

    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      console.log('Seeding Products...');
      for (const p of MOCK_PRODUCTS) {
        await pool.query(`
          INSERT INTO products (id, name, designer, price, category, image, description, rating, is_new_season, stock, sizes, is_pre_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [p.id, p.name, p.designer, p.price, p.category, p.image, p.description, p.rating, p.isNewSeason || false, p.stock, p.sizes, p.isPreOrder || false]);
      }
    }
    
    console.log('Database synced.');
  } catch (err) {
    console.error('Error seeding database:', err);
    throw err; 
  }
};

// --- READ OPERATIONS ---

export const fetchVendors = async (): Promise<Vendor[]> => {
  try {
    const res = await pool.query('SELECT * FROM vendors');
    return res.rows.map(mapVendor);
  } catch (e) {
    console.error("Failed to fetch vendors", e);
    return [];
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const res = await pool.query('SELECT * FROM products ORDER BY is_new_season DESC');
    return res.rows.map(mapProduct);
  } catch (e) {
    console.error("Failed to fetch products", e);
    return [];
  }
};

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const res = await pool.query('SELECT * FROM orders ORDER BY date DESC');
    return res.rows.map(mapOrder);
  } catch (e) {
    console.error("Failed to fetch orders", e);
    return [];
  }
};

// --- WRITE OPERATIONS (PRODUCTS) ---

export const addProductToDb = async (product: Product) => {
  await pool.query(`
    INSERT INTO products (id, name, designer, price, category, image, description, rating, is_new_season, stock, sizes, is_pre_order)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `, [product.id, product.name, product.designer, product.price, product.category, product.image, product.description, product.rating, product.isNewSeason || false, product.stock, product.sizes, product.isPreOrder || false]);
};

export const updateProductInDb = async (product: Product) => {
  await pool.query(`
    UPDATE products 
    SET name=$2, price=$3, category=$4, image=$5, description=$6, stock=$7, sizes=$8, is_pre_order=$9
    WHERE id=$1
  `, [product.id, product.name, product.price, product.category, product.image, product.description, product.stock, product.sizes, product.isPreOrder]);
};

export const deleteProductFromDb = async (productId: string) => {
  await pool.query('DELETE FROM products WHERE id=$1', [productId]);
};

// --- WRITE OPERATIONS (VENDORS) ---

export const updateVendorInDb = async (vendor: Vendor) => {
  await pool.query(`
    UPDATE vendors
    SET name=$2, bio=$3, avatar=$4, location=$5, cover_image=$6, email=$7, website=$8, instagram=$9, twitter=$10, subscription_plan=$11, subscription_status=$12, verification_status=$13
    WHERE id=$1
  `, [vendor.id, vendor.name, vendor.bio, vendor.avatar, vendor.location, vendor.coverImage, vendor.email, vendor.website, vendor.instagram, vendor.twitter, vendor.subscriptionPlan, vendor.subscriptionStatus, vendor.verificationStatus]);
};

// --- WRITE OPERATIONS (ORDERS) ---

export const createOrderInDb = async (order: Order) => {
  await pool.query(`
    INSERT INTO orders (id, customer_name, date, total, status, items)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [order.id, order.customerName, order.date, order.total, order.status, JSON.stringify(order.items)]);
};

export const updateOrderStatusInDb = async (orderId: string, status: string) => {
  await pool.query(`UPDATE orders SET status=$2 WHERE id=$1`, [orderId, status]);
};