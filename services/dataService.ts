
import { pool } from './db';
import { Product, Vendor, Order, User, LandingPageContent, ContactSubmission } from '../types';

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
  twitter: row.twitter,
  paymentMethods: row.payment_methods || [],
  kycDocuments: row.kyc_documents || {}
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

// Default CMS Content
const DEFAULT_CMS_CONTENT: LandingPageContent = {
  hero: {
    videoUrl: "https://videos.pexels.com/video-files/3205917/3205917-uhd_2560_1440_25fps.mp4",
    posterUrl: "https://images.unsplash.com/photo-1605289355680-e66a36d2e680?q=80&w=2070&auto=format&fit=crop",
    subtitle: "The New Vanguard",
    titleLine1: "DIGITAL",
    titleLine2: "AVANT-GARDE",
    buttonText: "Shop Collection"
  },
  marquee: {
    text: "Lagos • Accra • Nairobi • Cape Town • Heritage Reimagined • Pan-African Aesthetics"
  },
  designers: {
    subtitle: "The Ateliers",
    title: "Shop by Designer"
  },
  campaign: {
    subtitle: "The Campaign",
    title: "Urban Chronicles",
    image1: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1887&auto=format&fit=crop",
    image2: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1888&auto=format&fit=crop",
    image3: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2070&auto=format&fit=crop",
    image4: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1886&auto=format&fit=crop",
    overlayText1: "Street Edition"
  },
  spotlight: {
    title: "Editor's Picks"
  },
  about: {
    hero: {
        title: "The Maison",
        subtitle: "Established 2024",
        description: "Bridging the gap between African heritage and global luxury through technology, curation, and craftsmanship.",
        imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574&auto=format&fit=crop"
    },
    philosophy: {
        title: "Our Philosophy",
        description1: "MyFitStore was born from a desire to redefine the digital luxury experience. We believe that true luxury lies in the stories behind the seams. Our platform serves as a curated ecosystem for the world's most avant-garde designers, providing a stage where heritage meets innovation.",
        description2: "We are more than a marketplace; we are a cultural conduit. By integrating AI-driven styling with human curation, we offer a personalized journey that respects the individuality of both the creator and the collector.",
        image1: "https://images.unsplash.com/photo-1509319117116-31cf071916de?q=80&w=800",
        image2: "https://images.unsplash.com/photo-1537832816519-689ad163238b?q=80&w=800"
    },
    contact: {
        address: "24 Rue du Faubourg Saint-Honoré\n75008 Paris, France",
        email: "concierge@myfitstore.com",
        phone: "+33 1 42 68 53 00",
        hours: "Mon - Fri: 09:00 - 18:00 CET"
    }
  },
  auth: {
    loginImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070",
    registerImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574"
  }
};

export const seedDatabase = async () => {
  try {
    console.log('Initializing database for production...');
    
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
    
    // Add columns if not exists (for updates)
    try {
        await pool.query('ALTER TABLE vendors ADD COLUMN IF NOT EXISTS payment_methods JSONB');
        await pool.query('ALTER TABLE vendors ADD COLUMN IF NOT EXISTS kyc_documents JSONB');
    } catch (e) {
        console.log("Column additions might already exist or error adding them.", e);
    }

    // Create Users Table (For Buyers/Admins)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        role TEXT,
        avatar TEXT,
        joined_date TEXT,
        status TEXT
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

    // Create CMS Content Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_content (
        id TEXT PRIMARY KEY,
        data JSONB
      );
    `);

    // Create Contact Submissions Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        subject TEXT,
        message TEXT,
        date TEXT,
        status TEXT
      );
    `);

    // CLEAR DEMO DATA - ENSURE FRESH START
    // This removes any data from previous demo sessions.
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM vendors');
    await pool.query('DELETE FROM orders');
    // Note: We are not deleting 'users' indiscriminately to avoid locking out the admin immediately if they just registered, 
    // but in a true "start fresh" scenario, we might. 
    // For now, let's clear the business logic tables.
    // If you want to clear users too, uncomment the next line:
    // await pool.query('DELETE FROM users');

    // Seed CMS Content if empty
    const cmsCount = await pool.query('SELECT COUNT(*) FROM cms_content');
    if (parseInt(cmsCount.rows[0].count) === 0) {
      console.log('Seeding Default CMS Content...');
      await pool.query(`
        INSERT INTO cms_content (id, data) VALUES ($1, $2)
      `, ['landing_page', JSON.stringify(DEFAULT_CMS_CONTENT)]);
    }
    
    console.log('Database initialized and cleaned for production.');
  } catch (err) {
    console.error('Error initializing database:', err);
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

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const res = await pool.query('SELECT * FROM users ORDER BY joined_date DESC');
    return res.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as any,
      avatar: row.avatar,
      joined: new Date(row.joined_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: (row.status || 'ACTIVE') as any, 
      spend: '-',
      location: 'Global'
    }));
  } catch (e) {
    console.error("Failed to fetch users", e);
    return [];
  }
};

export const fetchLandingContent = async (): Promise<LandingPageContent> => {
  try {
    const res = await pool.query('SELECT data FROM cms_content WHERE id = $1', ['landing_page']);
    if (res.rows.length > 0) {
      const data = res.rows[0].data;
      // Merge with default to ensure keys exists if previously missing
      return { ...DEFAULT_CMS_CONTENT, ...data };
    }
    return DEFAULT_CMS_CONTENT;
  } catch (e) {
    console.error("Failed to fetch CMS content", e);
    return DEFAULT_CMS_CONTENT;
  }
};

export const fetchContactSubmissions = async (): Promise<ContactSubmission[]> => {
  try {
    const res = await pool.query('SELECT * FROM contact_submissions ORDER BY date DESC');
    return res.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject,
      message: row.message,
      date: row.date,
      status: row.status as any
    }));
  } catch (e) {
    console.error("Failed to fetch contact submissions", e);
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
    SET name=$2, bio=$3, avatar=$4, location=$5, cover_image=$6, email=$7, website=$8, instagram=$9, twitter=$10, subscription_plan=$11, subscription_status=$12, verification_status=$13, payment_methods=$14, kyc_documents=$15
    WHERE id=$1
  `, [vendor.id, vendor.name, vendor.bio, vendor.avatar, vendor.location, vendor.coverImage, vendor.email, vendor.website, vendor.instagram, vendor.twitter, vendor.subscriptionPlan, vendor.subscriptionStatus, vendor.verificationStatus, JSON.stringify(vendor.paymentMethods || []), JSON.stringify(vendor.kycDocuments || {})]);
};

export const createVendorInDb = async (vendor: Vendor) => {
  await pool.query(`
    INSERT INTO vendors (id, name, bio, avatar, verification_status, subscription_status, location, cover_image, email, subscription_plan, website, instagram, twitter, payment_methods, kyc_documents)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
  `, [vendor.id, vendor.name, vendor.bio, vendor.avatar, vendor.verificationStatus, vendor.subscriptionStatus, vendor.location, vendor.coverImage, vendor.email, vendor.subscriptionPlan, vendor.website, vendor.instagram, vendor.twitter, JSON.stringify(vendor.paymentMethods || []), JSON.stringify(vendor.kycDocuments || {})]);
};

// --- WRITE OPERATIONS (USERS/BUYERS) ---

export const createUserInDb = async (user: { id: string, name: string, email: string, role: string, avatar: string, status: string }) => {
  await pool.query(`
    INSERT INTO users (id, name, email, role, avatar, joined_date, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [user.id, user.name, user.email, user.role, user.avatar, new Date().toISOString(), user.status]);
};

export const updateUserInDb = async (user: User) => {
  await pool.query(`
    UPDATE users
    SET role=$2, status=$3
    WHERE id=$1
  `, [user.id, user.role, user.status]);
};

// --- WRITE OPERATIONS (CMS) ---

export const updateLandingContentInDb = async (content: LandingPageContent) => {
  await pool.query(`
    INSERT INTO cms_content (id, data) VALUES ($1, $2)
    ON CONFLICT (id) DO UPDATE SET data = $2
  `, ['landing_page', JSON.stringify(content)]);
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

// --- WRITE OPERATIONS (CONTACT) ---

export const submitContactFormInDb = async (submission: ContactSubmission) => {
  await pool.query(`
    INSERT INTO contact_submissions (id, name, email, subject, message, date, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [submission.id, submission.name, submission.email, submission.subject, submission.message, submission.date, submission.status]);
};

export const updateContactStatusInDb = async (id: string, status: 'NEW' | 'READ' | 'ARCHIVED') => {
  await pool.query(`UPDATE contact_submissions SET status=$2 WHERE id=$1`, [id, status]);
};
