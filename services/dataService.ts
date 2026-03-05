
import { pool } from './db.ts';
import { Product, Vendor, Order, User, LandingPageContent, ContactSubmission, VerificationStatus, Follower, AppNotification, WaitlistEntry } from '../types.ts';

// --- PRODUCTION CONFIGURATION ---

// Empty mock data for production environment
const MOCK_VENDORS: Vendor[] = [];
const MOCK_PRODUCTS: Product[] = [];
const MOCK_FOLLOWERS: Follower[] = [];

const DEFAULT_CMS_CONTENT: LandingPageContent = {
  theme: {
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    accentColor: '#D4AF37', // Gold
    fontFamily: 'Serif',
    borderRadius: 'sm'
  },
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
            vendorId TEXT,
            followerId TEXT
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
        `CREATE TABLE IF NOT EXISTS waitlist (
            id TEXT PRIMARY KEY,
            email TEXT,
            productId TEXT,
            date TEXT
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
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS facebook TEXT`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS tiktok TEXT`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS paymentMethods JSONB`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS kycDocuments JSONB`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS visualTheme TEXT`,
        `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS gallery JSONB`,
        
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
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS releaseDate TEXT`,
        
        `ALTER TABLE products ALTER COLUMN sizes TYPE JSONB USING to_jsonb(sizes)`,
        
        `ALTER TABLE followers ADD COLUMN IF NOT EXISTS followerId TEXT`
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

        // Check if content exists to determine if we need to seed the system defaults
        const cmsRes = await pool.query('SELECT count(*) FROM cms');
        
        if (cmsRes.rows[0].count === '0') {
            console.log('Initializing System Data...');
            
            // Seed CMS content only
            await pool.query(
                `INSERT INTO cms (id, content) VALUES ($1, $2)`,
                ['main', JSON.stringify(DEFAULT_CMS_CONTENT)]
            );

            // Seed Welcome Notification (System Wide)
            await pool.query(
                `INSERT INTO notifications (id, userId, title, message, read, date, type, link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
                ['notif_init', 'all', 'Welcome to MyFitStore', 'Explore our curated collection of digital fashion.', false, new Date().toISOString(), 'SYSTEM', 'MARKETPLACE']
            );
            
            console.log('System initialized. Waiting for real users.');
        } else {
            console.log('Database already initialized.');
        }
    } catch (e) {
        console.error("Error initializing database:", e);
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
            visualTheme: row.visualtheme,
            facebook: row.facebook,
            tiktok: row.tiktok,
            gallery: row.gallery || []
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
            isPreOrder: row.ispreorder,
            releaseDate: row.releasedate
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

// --- OPTIMIZED SINGLE FETCH OPERATIONS ---

export const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (rows.length > 0) {
             const row = rows[0];
             return {
                ...row,
                verificationStatus: row.verificationstatus,
                ...(row.profiledata || {})
            } as User;
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const getVendorByEmail = async (email: string): Promise<Vendor | null> => {
    try {
        const { rows } = await pool.query('SELECT * FROM vendors WHERE email = $1', [email]);
        if (rows.length > 0) {
            const row = rows[0];
            return {
                ...row,
                paymentMethods: row.paymentmethods,
                kycDocuments: row.kycdocuments,
                verificationStatus: row.verificationstatus,
                subscriptionStatus: row.subscriptionstatus,
                coverImage: row.coverimage,
                subscriptionPlan: row.subscriptionplan,
                visualTheme: row.visualtheme,
                facebook: row.facebook,
                tiktok: row.tiktok,
                gallery: row.gallery || []
            } as Vendor;
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const fetchVendorFollowerCount = async (vendorId: string): Promise<number> => {
    try {
        const { rows } = await pool.query('SELECT COUNT(*) FROM followers WHERE vendorId = $1', [vendorId]);
        return parseInt(rows[0].count, 10);
    } catch (e) {
        console.error("Error fetching follower count:", e);
        return 0;
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

export const fetchUserFollowedVendors = async (userId: string): Promise<Vendor[]> => {
    try {
        // Find vendors that the user (followerId) is following
        const { rows } = await pool.query(`
            SELECT v.* 
            FROM vendors v 
            JOIN followers f ON v.id = f.vendorId 
            WHERE f.followerId = $1
        `, [userId]);
        
        return rows.map(row => ({
            ...row,
            paymentMethods: row.paymentmethods,
            kycDocuments: row.kycdocuments,
            verificationStatus: row.verificationstatus,
            subscriptionStatus: row.subscriptionstatus,
            coverImage: row.coverimage,
            subscriptionPlan: row.subscriptionplan,
            visualTheme: row.visualtheme,
            facebook: row.facebook,
            tiktok: row.tiktok,
            gallery: row.gallery || []
        })) as Vendor[];
    } catch (e) {
        console.error("Error fetching followed vendors:", e);
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
            `INSERT INTO products (id, name, designer, price, category, image, description, rating, isNewSeason, stock, sizes, isPreOrder, releaseDate)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [product.id, product.name, product.designer, product.price, product.category, product.image, product.description, product.rating, product.isNewSeason, product.stock, JSON.stringify(product.sizes), product.isPreOrder, product.releaseDate || null]
        );
    } catch (e) {
        console.error("Add Product Failed", e);
    }
};

export const updateProductInDb = async (product: Product) => {
    try {
        await pool.query(
            `UPDATE products SET name=$1, price=$2, category=$3, image=$4, description=$5, stock=$6, sizes=$7, isPreOrder=$8, releaseDate=$9 WHERE id=$10`,
            [product.name, product.price, product.category, product.image, product.description, product.stock, JSON.stringify(product.sizes), product.isPreOrder, product.releaseDate || null, product.id]
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
                website=$10, instagram=$11, twitter=$12, kycDocuments=$13, visualTheme=$14,
                facebook=$15, tiktok=$16, gallery=$17
             WHERE id=$18`,
            [vendor.name, vendor.bio, vendor.avatar, vendor.verificationStatus, vendor.subscriptionStatus,
             vendor.location, vendor.coverImage, vendor.email, vendor.subscriptionPlan,
             vendor.website, vendor.instagram, vendor.twitter, JSON.stringify(vendor.kycDocuments), vendor.visualTheme,
             vendor.facebook, vendor.tiktok, JSON.stringify(vendor.gallery || []), vendor.id]
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

export const addFollowerToDb = async (follower: Follower & { followerId: string }) => {
    try {
        await pool.query(
            `INSERT INTO followers (id, name, avatar, location, joined, purchases, style, vendorId, followerId)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING`,
            [follower.id, follower.name, follower.avatar, follower.location, follower.joined, follower.purchases, follower.style, follower.vendorId, follower.followerId]
        );
    } catch (e) {
        console.error("Add Follower Failed", e);
    }
};

export const removeFollowerFromDb = async (followerId: string, vendorId: string) => {
    try {
        await pool.query('DELETE FROM followers WHERE followerId = $1 AND vendorId = $2', [followerId, vendorId]);
    } catch (e) {
        console.error("Remove Follower Failed", e);
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

// --- WRITE OPERATIONS (WAITLIST) ---

export const joinWaitlistInDb = async (entry: WaitlistEntry) => {
    try {
        await pool.query(
            `INSERT INTO waitlist (id, email, productId, date) VALUES ($1, $2, $3, $4)`,
            [entry.id, entry.email, entry.productId, entry.date]
        );
    } catch (e) {
        console.error("Join Waitlist Failed", e);
    }
};
