
import { pool } from './db.ts';
import { Product, Vendor, Order, User, LandingPageContent, ContactSubmission, VerificationStatus, Follower, AppNotification } from '../types.ts';

// --- MOCK DATA FOR SEEDING ---

const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Aura Atelier',
    bio: 'Merging digital craftsmanship with sustainable organic fibers. Based in Copenhagen.',
    avatar: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600',
    verificationStatus: 'VERIFIED',
    subscriptionStatus: 'ACTIVE',
    location: 'Copenhagen, Denmark',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200',
    email: 'contact@aura.com',
    subscriptionPlan: 'Maison',
    website: 'www.aura-atelier.com',
    instagram: '@aura_atelier',
    twitter: '@aura',
    visualTheme: 'MINIMALIST'
  },
  {
    id: 'v2',
    name: 'Noir Et Blanc',
    bio: 'Monochromatic minimalism for the modern avant-garde. Tokyo styling meets Parisian cut.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600',
    verificationStatus: 'VERIFIED',
    subscriptionStatus: 'ACTIVE',
    location: 'Tokyo, Japan',
    coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200',
    email: 'studio@noiretblanc.jp',
    subscriptionPlan: 'Couture',
    website: 'www.noiretblanc.jp',
    instagram: '@noiretblanc',
    twitter: '',
    visualTheme: 'DARK'
  },
  {
    id: 'v3',
    name: 'Neo-Genesis',
    bio: 'Futuristic streetwear inspired by cybernetic aesthetics.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600',
    verificationStatus: 'PENDING',
    subscriptionStatus: 'ACTIVE',
    location: 'Berlin, Germany',
    coverImage: 'https://images.unsplash.com/photo-1485230946086-1d99d529c7d4?q=80&w=1200',
    email: 'info@neogenesis.de',
    subscriptionPlan: 'Atelier',
    website: '',
    instagram: '@neogenesis',
    twitter: '',
    visualTheme: 'MINIMALIST'
  }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Structured Wool Trench',
    designer: 'Aura Atelier',
    price: 850,
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800',
    description: 'Oversized wool trench coat with asymmetrical lapels and hidden button placket.',
    rating: 4.8,
    isNewSeason: true,
    stock: 5,
    sizes: ['S', 'M', 'L'],
    isPreOrder: false
  },
  {
    id: 'p2',
    name: 'Cyber-Knit Turtleneck',
    designer: 'Noir Et Blanc',
    price: 320,
    category: 'Knitwear',
    image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=800',
    description: 'Fine gauge merino wool turtleneck with distressed detailing.',
    rating: 5.0,
    isNewSeason: true,
    stock: 12,
    sizes: ['M', 'L', 'XL'],
    isPreOrder: false
  },
  {
    id: 'p3',
    name: 'Obsidian Wide Trousers',
    designer: 'Noir Et Blanc',
    price: 450,
    category: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800',
    description: 'High-waisted wide leg trousers in Japanese denim.',
    rating: 4.5,
    isNewSeason: false,
    stock: 8,
    sizes: ['28', '30', '32', '34'],
    isPreOrder: false
  },
  {
    id: 'p4',
    name: 'Void Runner Boots',
    designer: 'Neo-Genesis',
    price: 680,
    category: 'Footwear',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800',
    description: 'Platform leather boots with metallic hardware.',
    rating: 4.9,
    isNewSeason: true,
    stock: 3,
    sizes: ['39', '40', '41', '42'],
    isPreOrder: true
  },
  {
    id: 'p5',
    name: 'Silk Wrap Blouse',
    designer: 'Aura Atelier',
    price: 290,
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800',
    description: '100% organic silk blouse with elongated sleeves.',
    rating: 4.7,
    isNewSeason: false,
    stock: 15,
    sizes: ['XS', 'S', 'M'],
    isPreOrder: false
  }
];

const MOCK_FOLLOWERS: Follower[] = [
    { id: 'f1', name: 'Sofia R.', location: 'Milan', avatar: 'https://i.pravatar.cc/150?u=1', joined: 'Oct 2023', purchases: 12, style: 'Avant-Garde', vendorId: 'v1' },
    { id: 'f2', name: 'James K.', location: 'London', avatar: 'https://i.pravatar.cc/150?u=2', joined: 'Dec 2023', purchases: 3, style: 'Minimalist', vendorId: 'v1' },
    { id: 'f3', name: 'Arjun P.', location: 'New York', avatar: 'https://i.pravatar.cc/150?u=3', joined: 'Jan 2024', purchases: 8, style: 'Streetwear', vendorId: 'v1' },
    { id: 'f4', name: 'Wei L.', location: 'Shanghai', avatar: 'https://i.pravatar.cc/150?u=4', joined: 'Feb 2024', purchases: 5, style: 'Luxury', vendorId: 'v2' },
    { id: 'f5', name: 'Zoe M.', location: 'Berlin', avatar: 'https://i.pravatar.cc/150?u=5', joined: 'Mar 2024', purchases: 1, style: 'Techno', vendorId: 'v3' }
];

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

// --- INITIALIZATION ---

const initSchema = async () => {
    // Create tables if not exist
    const queries = [
        `CREATE TABLE IF NOT EXISTS vendors (
            id TEXT PRIMARY KEY,
            name TEXT,
            bio TEXT,
            avatar TEXT,
            verificationStatus TEXT,
            subscriptionStatus TEXT,
            location TEXT,
            coverImage TEXT,
            email TEXT,
            subscriptionPlan TEXT,
            website TEXT,
            instagram TEXT,
            twitter TEXT,
            paymentMethods JSONB,
            kycDocuments JSONB,
            visualTheme TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT,
            designer TEXT,
            price NUMERIC,
            category TEXT,
            image TEXT,
            description TEXT,
            rating NUMERIC,
            isNewSeason BOOLEAN,
            stock INTEGER,
            sizes JSONB,
            isPreOrder BOOLEAN
        )`,
        `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            role TEXT,
            avatar TEXT,
            joined TEXT,
            status TEXT,
            spend TEXT,
            location TEXT,
            verificationStatus TEXT,
            profileData JSONB
        )`,
        `CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            customerName TEXT,
            date TEXT,
            total NUMERIC,
            status TEXT,
            items JSONB
        )`,
        `CREATE TABLE IF NOT EXISTS cms (
            id TEXT PRIMARY KEY,
            content JSONB
        )`,
        `CREATE TABLE IF NOT EXISTS contacts (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            subject TEXT,
            message TEXT,
            date TEXT,
            status TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS followers (
            id TEXT PRIMARY KEY,
            name TEXT,
            avatar TEXT,
            location TEXT,
            joined TEXT,
            purchases INTEGER,
            style TEXT,
            vendorId TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            userId TEXT,
            title TEXT,
            message TEXT,
            read BOOLEAN,
            date TEXT,
            type TEXT,
            link TEXT
        )`,
        // Real-time Authentication Table
        `CREATE TABLE IF NOT EXISTS auth_accounts (
            email TEXT PRIMARY KEY,
            password TEXT,
            uid TEXT,
            email_verified BOOLEAN DEFAULT FALSE
        )`
    ];

    for (const q of queries) {
        await pool.query(q);
    }

    // --- MIGRATIONS ---
    // Ensure all columns exist even if tables were created by an older version of the schema.
    const migrations = [
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS verificationStatus TEXT`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS subscriptionStatus TEXT`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS location TEXT`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS coverImage TEXT`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS email TEXT`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS subscriptionPlan TEXT`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS website TEXT`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS instagram TEXT`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS twitter TEXT`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS paymentMethods JSONB`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS kycDocuments JSONB`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS visualTheme TEXT`,
        
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS verificationStatus TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS joined TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS profileData JSONB`,

        `ALTER TABLE products ADD COLUMN IF NOT EXISTS isPreOrder BOOLEAN`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSONB`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS isNewSeason BOOLEAN`,
        
        `ALTER TABLE products ALTER COLUMN sizes TYPE JSONB USING to_jsonb(sizes)`
    ];

    for (const m of migrations) {
        try {
            await pool.query(m);
        } catch (e) {
            console.warn("Migration warning:", e);
        }
    }

    // --- AUTH BACKFILL ---
    // Ensure existing users/vendors have auth accounts (default password: 'password')
    await pool.query(`INSERT INTO auth_accounts (email, password, uid, email_verified) SELECT email, 'password', id, true FROM vendors ON CONFLICT (email) DO NOTHING`);
    await pool.query(`INSERT INTO auth_accounts (email, password, uid, email_verified) SELECT email, 'password', id, true FROM users ON CONFLICT (email) DO NOTHING`);
};

export const seedDatabase = async () => {
    try {
        await initSchema();

        // Check if vendors exist
        const res = await pool.query('SELECT count(*) FROM vendors');
        if (res.rows[0].count === '0') {
            console.log('Seeding Database...');
            
            // Seed Vendors
            for (const v of MOCK_VENDORS) {
                await pool.query(
                    `INSERT INTO vendors (id, name, bio, avatar, verificationStatus, subscriptionStatus, location, coverImage, email, subscriptionPlan, website, instagram, twitter, visualTheme)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                    [v.id, v.name, v.bio, v.avatar, v.verificationStatus, v.subscriptionStatus, v.location, v.coverImage, v.email, v.subscriptionPlan, v.website, v.instagram, v.twitter, v.visualTheme || 'MINIMALIST']
                );
                // Create auth account for seeded vendor
                await pool.query(
                    `INSERT INTO auth_accounts (email, password, uid, email_verified) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
                    [v.email, 'password', v.id, true]
                );
            }

            // Seed Products
            for (const p of MOCK_PRODUCTS) {
                await pool.query(
                    `INSERT INTO products (id, name, designer, price, category, image, description, rating, isNewSeason, stock, sizes, isPreOrder)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                    [p.id, p.name, p.designer, p.price, p.category, p.image, p.description, p.rating, p.isNewSeason, p.stock, JSON.stringify(p.sizes), p.isPreOrder]
                );
            }

            // Seed Followers
            for (const f of MOCK_FOLLOWERS) {
                await pool.query(
                    `INSERT INTO followers (id, name, avatar, location, joined, purchases, style, vendorId)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [f.id, f.name, f.avatar, f.location, f.joined, f.purchases, f.style, f.vendorId]
                );
            }

            // Seed Notifications (Welcome)
            await pool.query(
                `INSERT INTO notifications (id, userId, title, message, read, date, type, link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
                ['notif_init', 'all', 'Welcome to MyFitStore', 'Explore our new collection of avant-garde digital fashion.', false, new Date().toISOString(), 'SYSTEM', 'MARKETPLACE']
            );

            // Seed CMS
            await pool.query(
                `INSERT INTO cms (id, content) VALUES ($1, $2)`,
                ['main', JSON.stringify(DEFAULT_CMS_CONTENT)]
            );
        } else {
            console.log('Database already initialized.');
        }
    } catch (e) {
        console.error("Error seeding database:", e);
    }
};

// --- READ OPERATIONS ---

export const fetchVendors = async (): Promise<Vendor[]> => {
    try {
        const { rows } = await pool.query('SELECT * FROM vendors');
        return rows.map(row => ({
            ...row,
            paymentMethods: row.paymentmethods, // Postgres lowercases by default if not quoted
            kycDocuments: row.kycdocuments,
            verificationStatus: row.verificationstatus,
            subscriptionStatus: row.subscriptionstatus,
            coverImage: row.coverimage,
            subscriptionPlan: row.subscriptionplan,
            visualTheme: row.visualtheme
        })) as Vendor[];
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const fetchProducts = async (): Promise<Product[]> => {
    try {
        const { rows } = await pool.query('SELECT * FROM products');
        return rows.map(row => ({
            ...row,
            price: Number(row.price),
            rating: Number(row.rating),
            stock: Number(row.stock),
            sizes: row.sizes, // JSONB is auto-parsed by node-postgres
            isNewSeason: row.isnewseason,
            isPreOrder: row.ispreorder
        })) as Product[];
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const fetchOrders = async (): Promise<Order[]> => {
    try {
        const { rows } = await pool.query('SELECT * FROM orders ORDER BY date DESC');
        return rows.map(row => ({
            ...row,
            customerName: row.customername,
            total: Number(row.total),
            items: row.items
        })) as Order[];
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const fetchUsers = async (): Promise<User[]> => {
    try {
        const { rows } = await pool.query('SELECT * FROM users');
        return rows.map(row => ({
            ...row,
            verificationStatus: row.verificationstatus,
            // Flatten profileData into user object
            ...(row.profiledata || {})
        })) as User[];
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const fetchVendorFollowers = async (vendorId: string): Promise<Follower[]> => {
    try {
        const { rows } = await pool.query('SELECT * FROM followers WHERE vendorId = $1 ORDER BY id DESC', [vendorId]);
        return rows as Follower[];
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const fetchNotifications = async (userId?: string): Promise<AppNotification[]> => {
    try {
        let query = 'SELECT * FROM notifications WHERE userId = $1 OR userId = $2 ORDER BY date DESC LIMIT 20';
        let values = ['all', userId || 'guest'];
        
        const { rows } = await pool.query(query, values);
        return rows as AppNotification[];
    } catch (e) {
        console.error("Error fetching notifications", e);
        return [];
    }
};

export const fetchLandingContent = async (): Promise<LandingPageContent> => {
    try {
        const { rows } = await pool.query("SELECT content FROM cms WHERE id = 'main'");
        if (rows.length > 0) return rows[0].content as LandingPageContent;
        return DEFAULT_CMS_CONTENT;
    } catch (e) {
        console.error(e);
        return DEFAULT_CMS_CONTENT;
    }
};

export const fetchContactSubmissions = async (): Promise<ContactSubmission[]> => {
    try {
        const { rows } = await pool.query('SELECT * FROM contacts ORDER BY date DESC');
        return rows as ContactSubmission[];
    } catch (e) {
        console.error(e);
        return [];
    }
};

// --- WRITE OPERATIONS (PRODUCTS) ---

export const addProductToDb = async (product: Product) => {
    try {
        await pool.query(
            `INSERT INTO products (id, name, designer, price, category, image, description, rating, isNewSeason, stock, sizes, isPreOrder)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [product.id, product.name, product.designer, product.price, product.category, product.image, product.description, product.rating, product.isNewSeason, product.stock, JSON.stringify(product.sizes), product.isPreOrder]
        );
    } catch (e) {
        console.error("Add Product Failed", e);
    }
};

export const updateProductInDb = async (product: Product) => {
    try {
        await pool.query(
            `UPDATE products SET name=$1, price=$2, category=$3, image=$4, description=$5, stock=$6, sizes=$7, isPreOrder=$8 WHERE id=$9`,
            [product.name, product.price, product.category, product.image, product.description, product.stock, JSON.stringify(product.sizes), product.isPreOrder, product.id]
        );
    } catch (e) {
        console.error("Update Product Failed", e);
    }
};

export const deleteProductFromDb = async (productId: string) => {
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    } catch (e) {
        console.error("Delete Product Failed", e);
    }
};

// --- WRITE OPERATIONS (VENDORS) ---

export const updateVendorInDb = async (vendor: Vendor) => {
    try {
        await pool.query(
            `UPDATE vendors SET 
                name=$1, bio=$2, avatar=$3, verificationStatus=$4, subscriptionStatus=$5, 
                location=$6, coverImage=$7, email=$8, subscriptionPlan=$9, 
                website=$10, instagram=$11, twitter=$12, kycDocuments=$13, visualTheme=$14 
             WHERE id=$15`,
            [vendor.name, vendor.bio, vendor.avatar, vendor.verificationStatus, vendor.subscriptionStatus,
             vendor.location, vendor.coverImage, vendor.email, vendor.subscriptionPlan,
             vendor.website, vendor.instagram, vendor.twitter, JSON.stringify(vendor.kycDocuments), vendor.visualTheme, vendor.id]
        );
    } catch (e) {
        console.error("Update Vendor Failed", e);
    }
};

export const createVendorInDb = async (vendor: Vendor) => {
    try {
        // Check duplication
        const check = await pool.query('SELECT id FROM vendors WHERE id = $1', [vendor.id]);
        if (check.rows.length === 0) {
            await pool.query(
                `INSERT INTO vendors (id, name, bio, avatar, verificationStatus, subscriptionStatus, location, coverImage, email, subscriptionPlan, visualTheme)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [vendor.id, vendor.name, vendor.bio, vendor.avatar, vendor.verificationStatus, vendor.subscriptionStatus, vendor.location, vendor.coverImage, vendor.email, vendor.subscriptionPlan, vendor.visualTheme || 'MINIMALIST']
            );
        }
    } catch (e) {
        console.error("Create Vendor Failed", e);
    }
};

export const addFollowerToDb = async (follower: Follower) => {
    try {
        await pool.query(
            `INSERT INTO followers (id, name, avatar, location, joined, purchases, style, vendorId)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [follower.id, follower.name, follower.avatar, follower.location, follower.joined, follower.purchases, follower.style, follower.vendorId]
        );
    } catch (e) {
        console.error("Add Follower Failed", e);
    }
};

// --- WRITE OPERATIONS (NOTIFICATIONS) ---

export const createNotificationInDb = async (notif: AppNotification) => {
    try {
        await pool.query(
            `INSERT INTO notifications (id, userId, title, message, read, date, type, link)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [notif.id, notif.userId || 'all', notif.title, notif.message, notif.read, notif.date, notif.type, notif.link || '']
        );
    } catch (e) {
        console.error("Create Notification Failed", e);
    }
};

export const markNotificationRead = async (id: string) => {
    try {
        await pool.query("UPDATE notifications SET read = true WHERE id = $1", [id]);
    } catch (e) {
        console.error("Mark Read Failed", e);
    }
};

// --- WRITE OPERATIONS (USERS) ---

export const createUserInDb = async (user: { id: string, name: string, email: string, role: string, avatar: string, status: string, verificationStatus?: VerificationStatus }) => {
    try {
        const check = await pool.query('SELECT id FROM users WHERE id = $1', [user.id]);
        if (check.rows.length === 0) {
             await pool.query(
                 `INSERT INTO users (id, name, email, role, avatar, joined, status, verificationStatus)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                 [user.id, user.name, user.email, user.role, user.avatar, new Date().toISOString(), user.status, user.verificationStatus || 'PENDING']
             );
        }
    } catch (e) {
        console.error("Create User Failed", e);
    }
};

export const updateUserInDb = async (user: User) => {
    try {
        // Construct profileData object from user properties
        const profileData = {
            phone: user.phone,
            shippingAddress: user.shippingAddress,
            measurements: user.measurements
        };

        await pool.query(
            `UPDATE users SET role=$1, status=$2, verificationStatus=$3, profileData=$4, name=$5, avatar=$6 WHERE id=$7`,
            [user.role, user.status, user.verificationStatus, JSON.stringify(profileData), user.name, user.avatar, user.id]
        );
    } catch (e) {
        console.error("Update User Failed", e);
    }
};

// --- WRITE OPERATIONS (CMS) ---

export const updateLandingContentInDb = async (content: LandingPageContent) => {
    try {
        // Upsert logic for ID 'main'
        const check = await pool.query("SELECT id FROM cms WHERE id = 'main'");
        if (check.rows.length > 0) {
             await pool.query("UPDATE cms SET content = $1 WHERE id = 'main'", [JSON.stringify(content)]);
        } else {
             await pool.query("INSERT INTO cms (id, content) VALUES ('main', $1)", [JSON.stringify(content)]);
        }
    } catch (e) {
        console.error("Update CMS Failed", e);
    }
};

// --- WRITE OPERATIONS (ORDERS) ---

export const createOrderInDb = async (order: Order) => {
    try {
        await pool.query(
            `INSERT INTO orders (id, customerName, date, total, status, items)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [order.id, order.customerName, order.date, order.total, order.status, JSON.stringify(order.items)]
        );
    } catch (e) {
        console.error("Create Order Failed", e);
    }
};

export const updateOrderStatusInDb = async (orderId: string, status: string) => {
    try {
        await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [status, orderId]);
    } catch (e) {
        console.error("Update Order Status Failed", e);
    }
};

// --- WRITE OPERATIONS (CONTACT) ---

export const submitContactFormInDb = async (submission: ContactSubmission) => {
    try {
        await pool.query(
            `INSERT INTO contacts (id, name, email, subject, message, date, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [submission.id, submission.name, submission.email, submission.subject, submission.message, submission.date, submission.status]
        );
    } catch (e) {
        console.error("Submit Contact Failed", e);
    }
};

export const updateContactStatusInDb = async (id: string, status: 'NEW' | 'READ' | 'ARCHIVED') => {
    try {
        await pool.query("UPDATE contacts SET status = $1 WHERE id = $2", [status, id]);
    } catch (e) {
        console.error("Update Contact Status Failed", e);
    }
};
