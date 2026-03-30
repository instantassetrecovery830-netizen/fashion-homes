
import { Product, Vendor, Order, User, LandingPageContent, ContactSubmission, VerificationStatus, Follower, AppNotification, WaitlistEntry, CartItem, ChatMessage } from '../types.ts';
import { sql } from './db.ts';

export const initSchema = async () => {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS vendors (
                id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT,
                description TEXT,
                visualTheme TEXT,
                bio TEXT,
                avatar TEXT,
                verificationStatus TEXT,
                subscriptionStatus TEXT,
                location TEXT,
                coverImage TEXT,
                subscriptionPlan TEXT,
                website TEXT,
                instagram TEXT,
                twitter TEXT,
                facebook TEXT,
                tiktok TEXT,
                paymentMethods JSONB,
                kycDocuments JSONB,
                gallery JSONB
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT,
                price NUMERIC,
                vendorId TEXT,
                designer TEXT,
                description TEXT,
                createdAt TIMESTAMP,
                category TEXT,
                image TEXT,
                rating NUMERIC,
                isNewSeason BOOLEAN,
                stock INTEGER,
                sizes JSONB,
                isPreOrder BOOLEAN
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                uid TEXT,
                name TEXT,
                email TEXT,
                role TEXT,
                avatar TEXT,
                joined TEXT,
                status TEXT,
                verificationStatus TEXT,
                spend TEXT,
                location TEXT,
                profileData JSONB
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                customerName TEXT,
                date TEXT,
                total NUMERIC,
                status TEXT,
                items JSONB
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS cms (
                id TEXT PRIMARY KEY,
                content JSONB
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS contacts (
                id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT,
                subject TEXT,
                message TEXT,
                date TEXT,
                status TEXT
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS followers (
                id TEXT PRIMARY KEY,
                followerId TEXT,
                vendorId TEXT,
                joined TEXT,
                name TEXT,
                avatar TEXT,
                location TEXT,
                purchases INTEGER,
                style TEXT
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                userId TEXT,
                title TEXT,
                message TEXT,
                read BOOLEAN,
                date TEXT,
                type TEXT,
                link TEXT
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS auth_accounts (
                email TEXT PRIMARY KEY,
                password TEXT,
                uid TEXT,
                email_verified BOOLEAN DEFAULT FALSE
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS waitlist (
                id TEXT PRIMARY KEY,
                email TEXT,
                joinedAt TEXT
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS cart_items (
                id TEXT PRIMARY KEY,
                userId TEXT,
                productId TEXT,
                quantity INTEGER,
                size TEXT,
                measurements JSONB,
                addedAt TEXT
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS saved_items (
                id TEXT PRIMARY KEY,
                userId TEXT,
                productId TEXT,
                savedAt TEXT
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS product_votes (
                id TEXT PRIMARY KEY,
                userId TEXT,
                productId TEXT,
                votedAt TEXT
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                userId TEXT,
                sender TEXT,
                text TEXT,
                timestamp TEXT,
                read BOOLEAN
            )
        `;

        console.log("Database schema initialized.");
    } catch (e) {
        console.error("Error initializing schema:", e);
        throw e;
    }
};

export const seedDatabase = async () => {
    try {
        await initSchema();
        
        // Seed vendors
        await sql`INSERT INTO vendors (id, name, email, description, visualTheme, bio, avatar, location, website) VALUES 
            ('v1', 'Atelier Lagos', 'atelier@lagos.com', 'Heritage reimagined', 'MINIMALIST', 'Merging digital craftsmanship with sustainable organic fibers.', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600', 'Lagos, Nigeria', 'www.atelier-lagos.com'),
            ('v2', 'Accra Avant-Garde', 'accra@avant.com', 'Modern African aesthetics', 'DARK', 'Monochromatic minimalism for the modern avant-garde.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600', 'Accra, Ghana', 'www.accra-avant.com')
            ON CONFLICT (id) DO NOTHING`;
        
        // Seed products
        await sql`INSERT INTO products (id, name, price, vendorId, designer, description, createdAt, category, image, rating, isNewSeason, stock, sizes, isPreOrder) VALUES 
            ('p1', 'Lagos Silk Dress', 250, 'v1', 'Atelier Lagos', 'Hand-woven silk dress with asymmetrical cut.', NOW(), 'Dresses', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800', 4.8, true, 5, '["S", "M", "L"]', false),
            ('p2', 'Accra Leather Bag', 150, 'v2', 'Accra Avant-Garde', 'Genuine leather bag with metallic hardware.', NOW(), 'Accessories', 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=800', 5.0, true, 12, '["One Size"]', false),
            ('p3', 'Obsidian Wide Trousers', 450, 'v2', 'Accra Avant-Garde', 'High-waisted wide leg trousers in Japanese denim.', NOW(), 'Bottoms', 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800', 4.5, false, 8, '["28", "30", "32", "34"]', false)
            ON CONFLICT (id) DO NOTHING`;
            
        // Seed followers
        await sql`INSERT INTO followers (id, followerId, vendorId, joined, name, avatar, location, purchases, style) VALUES 
            ('f1', 'u1', 'v1', '2023-10-01', 'Sofia R.', 'https://i.pravatar.cc/150?u=1', 'Milan', 12, 'Avant-Garde'),
            ('f2', 'u2', 'v1', '2023-12-15', 'James K.', 'https://i.pravatar.cc/150?u=2', 'London', 3, 'Minimalist'),
            ('f3', 'u3', 'v2', '2024-01-20', 'Arjun P.', 'https://i.pravatar.cc/150?u=3', 'New York', 8, 'Streetwear')
            ON CONFLICT (id) DO NOTHING`;
            
        // Seed notifications
        await sql`INSERT INTO notifications (id, userId, title, message, read, date, type, link) VALUES 
            ('notif_init', 'all', 'Welcome to MyFitStore', 'Explore our curated collection of digital fashion.', false, NOW(), 'SYSTEM', 'MARKETPLACE')
            ON CONFLICT (id) DO NOTHING`;
            
        // Seed CMS
        await sql`INSERT INTO cms (id, content) VALUES 
            ('main', ${JSON.stringify(DEFAULT_CMS_CONTENT)})
            ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content`;
            
        console.log("Database seeded with mock data.");
    } catch (e) {
        console.error("Error seeding database:", e);
    }
};

// --- PRODUCTION CONFIGURATION ---

// Empty mock data for production environment
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
    buttonText: "Shop Collection",
    secondaryButtonText: "View Membership"
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
  },
  pricing: {
    title: "Unlock Privilege",
    subtitle: "MyFitStore Membership",
    description: "Select your tier to access the MyFitStore ecosystem. Elevate your experience with exclusive drops, personalized curation, and white-glove service.",
    plans: [
      {
        id: 'Atelier',
        name: "The Essential",
        price: "$15",
        period: "/ month",
        description: "Curated access to the digital marketplace and seasonal trends.",
        features: [
          "Access to all New Arrivals",
          "Standard Shipping Rates",
          "Basic Trend Forecasts",
          "Member-only Newsletter"
        ],
        cta: "Join Monthly",
        highlight: false
      },
      {
        id: 'Maison',
        name: "The Insider",
        price: "$90",
        period: "/ 6 months",
        description: "Priority access for the dedicated fashion enthusiast.",
        features: [
          "24h Early Access to Drops",
          "Priority Shipping",
          "AI Style Curator Access",
          "Private Sale Invites",
          "Exclusive Editorial Content"
        ],
        cta: "Select Semi-Annual",
        highlight: false
      },
      {
        id: 'Couture',
        name: "The Collector",
        price: "$165",
        period: "/ year",
        description: "The ultimate luxury experience with white-glove service.",
        features: [
          "All Insider Features",
          "Free Global Express Shipping",
          "Dedicated Personal Stylist",
          "Custom Sizing Requests",
          "VIP Event Invitations"
        ],
        cta: "Become a Collector",
        highlight: true
      }
    ]
  }
};

// --- INITIALIZATION ---

// --- READ OPERATIONS ---

export const fetchVendors = async (): Promise<Vendor[]> => {
    try {
        const result = (await sql`SELECT * FROM vendors`) as any[];
        return result.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            bio: row.description || '',
            visualTheme: row.visualtheme,
            avatar: '',
            verificationStatus: 'VERIFIED',
            subscriptionStatus: 'ACTIVE'
        })) as Vendor[];
    } catch (e) {
        console.error("Fetch Vendors Error:", e);
        return [];
    }
};

export const fetchProducts = async (): Promise<Product[]> => {
    try {
        const result = (await sql`SELECT * FROM products ORDER BY createdAt DESC`) as any[];
        return result.map(row => ({
            id: row.id,
            name: row.name,
            price: Number(row.price),
            vendorId: row.vendorid,
            description: row.description,
            createdAt: row.createdat,
            designer: '',
            category: '',
            image: '',
            rating: 0,
            stock: 0,
            sizes: []
        })) as Product[];
    } catch (e) {
        console.error("Fetch Products Error:", e);
        return [];
    }
};

export const fetchOrders = async (): Promise<Order[]> => {
    try {
        const result = (await sql`SELECT * FROM orders ORDER BY date DESC`) as any[];
        return result.map(row => ({
            id: row.id,
            customerName: row.customername,
            date: row.date,
            total: Number(row.total),
            status: row.status,
            items: JSON.parse(row.items)
        })) as Order[];
    } catch (e) {
        console.error("Fetch Orders Error:", e);
        return [];
    }
};

export const fetchUsers = async (): Promise<User[]> => {
    try {
        const result = (await sql`SELECT * FROM users`) as any[];
        return result.map(row => ({
            id: row.id,
            uid: row.uid,
            name: row.name,
            email: row.email,
            role: row.role as any,
            avatar: row.avatar,
            joined: row.joined,
            status: row.status as any,
            verificationStatus: row.verificationstatus as any
        })) as User[];
    } catch (e) {
        console.error("Fetch Users Error:", e);
        return [];
    }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
        const result = (await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`) as any[];
        if (result.length > 0) {
            const row = result[0];
            return {
                id: row.id,
                uid: row.uid,
                name: row.name,
                email: row.email,
                role: row.role as any,
                avatar: row.avatar,
                joined: row.joined,
                status: row.status as any,
                verificationStatus: row.verificationstatus as any
            } as User;
        }
        return null;
    } catch (e) {
        console.error("Get User By Email Error:", e);
        return null;
    }
};

export const getVendorByEmail = async (email: string): Promise<Vendor | null> => {
    try {
        const result = (await sql`SELECT * FROM vendors WHERE email = ${email} LIMIT 1`) as any[];
        if (result.length > 0) {
            const row = result[0];
            return {
                id: row.id,
                name: row.name,
                email: row.email,
                bio: row.description || '',
                visualTheme: row.visualtheme,
                avatar: '',
                verificationStatus: 'VERIFIED',
                subscriptionStatus: 'ACTIVE'
            } as Vendor;
        }
        return null;
    } catch (e) {
        console.error("Get Vendor By Email Error:", e);
        return null;
    }
};

export const fetchVendorFollowerCount = async (vendorId: string): Promise<number> => {
    try {
        const result = (await sql`SELECT COUNT(*) FROM followers WHERE vendorId = ${vendorId}`) as any[];
        return Number(result[0].count);
    } catch (e) {
        console.error("Error fetching follower count:", e);
        return 0;
    }
};

export const fetchVendorFollowers = async (vendorId: string): Promise<Follower[]> => {
    try {
        const result = (await sql`SELECT * FROM followers WHERE vendorId = ${vendorId} ORDER BY joined DESC`) as any[];
        return result.map(row => ({
            id: row.id,
            followerId: row.followerid,
            vendorId: row.vendorid,
            joined: row.joined
        })) as Follower[];
    } catch (e) {
        console.error("Fetch Vendor Followers Error:", e);
        return [];
    }
};

export const fetchAllFollowers = async (): Promise<Follower[]> => {
    try {
        const result = (await sql`SELECT * FROM followers`) as any[];
        return result.map(row => ({
            id: row.id,
            followerId: row.followerid,
            vendorId: row.vendorid,
            joined: row.joined
        })) as Follower[];
    } catch (e) {
        console.error("Fetch All Followers Error:", e);
        return [];
    }
};

export const fetchUserFollowedVendors = async (userId: string): Promise<Vendor[]> => {
    try {
        const result = (await sql`
            SELECT v.* FROM vendors v
            JOIN followers f ON v.id = f.vendorId
            WHERE f.followerId = ${userId}
            LIMIT 30
        `) as any[];
        return result.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            bio: row.description || '',
            visualTheme: row.visualtheme,
            avatar: '',
            verificationStatus: 'VERIFIED',
            subscriptionStatus: 'ACTIVE'
        })) as Vendor[];
    } catch (e) {
        console.error("Error fetching followed vendors:", e);
        return [];
    }
};

export const fetchNotifications = async (userId?: string): Promise<AppNotification[]> => {
    try {
        const result = (await sql`SELECT * FROM notifications WHERE userId = ${userId || 'all'} OR userId = 'all' ORDER BY date DESC`) as any[];
        return result.map(row => ({
            id: row.id,
            userId: row.userid,
            title: row.title,
            message: row.message,
            read: row.read,
            date: row.date,
            type: row.type,
            link: row.link
        })) as AppNotification[];
    } catch (e) {
        console.error("Error fetching notifications", e);
        return [];
    }
};

export const fetchLandingContent = async (): Promise<LandingPageContent> => {
    try {
        const result = (await sql`SELECT content FROM cms WHERE id = 'main' LIMIT 1`) as any[];
        if (result.length > 0) {
            const content = JSON.parse(result[0].content) as LandingPageContent;
            return {
                ...DEFAULT_CMS_CONTENT,
                ...content,
                pricing: content.pricing || DEFAULT_CMS_CONTENT.pricing
            };
        }
        return DEFAULT_CMS_CONTENT;
    } catch (e) {
        console.error("Fetch Landing Content Error:", e);
        return DEFAULT_CMS_CONTENT;
    }
};

export const fetchContactSubmissions = async (): Promise<ContactSubmission[]> => {
    try {
        const result = (await sql`SELECT * FROM contacts ORDER BY date DESC`) as any[];
        return result.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            subject: row.subject,
            message: row.message,
            date: row.date,
            status: row.status
        })) as ContactSubmission[];
    } catch (e) {
        console.error("Fetch Contact Submissions Error:", e);
        return [];
    }
};

// --- WRITE OPERATIONS (PRODUCTS) ---

export const addProductToDb = async (product: Product) => {
    try {
        await sql`INSERT INTO products (id, name, price, designer, description, createdAt) 
                  VALUES (${product.id}, ${product.name}, ${product.price}, ${product.designer}, ${product.description}, ${product.createdAt || new Date().toISOString()})`;
    } catch (e) {
        console.error("Add Product Failed", e);
    }
};

export const updateProductInDb = async (product: Product) => {
    try {
        await sql`UPDATE products SET name=${product.name}, price=${product.price}, designer=${product.designer}, description=${product.description} WHERE id=${product.id}`;
    } catch (e) {
        console.error("Update Product Failed", e);
    }
};

export const deleteProductFromDb = async (productId: string) => {
    try {
        await sql`DELETE FROM products WHERE id=${productId}`;
    } catch (e) {
        console.error("Delete Product Failed", e);
    }
};

// --- WRITE OPERATIONS (VENDORS) ---

export const updateVendorInDb = async (vendor: Vendor) => {
    try {
        await sql`UPDATE vendors SET name=${vendor.name}, email=${vendor.email}, description=${vendor.bio}, visualTheme=${vendor.visualTheme} WHERE id=${vendor.id}`;
    } catch (e) {
        console.error("Update Vendor Failed", e);
    }
};

export const createVendorInDb = async (vendor: Vendor) => {
    try {
        await sql`INSERT INTO vendors (id, name, email, description, visualTheme) 
                  VALUES (${vendor.id}, ${vendor.name}, ${vendor.email}, ${vendor.bio}, ${vendor.visualTheme || 'MINIMALIST'})
                  ON CONFLICT (id) DO NOTHING`;
    } catch (e) {
        console.error("Create Vendor Failed", e);
    }
};

export const addFollowerToDb = async (follower: Follower & { followerId: string }) => {
    try {
        await sql`INSERT INTO followers (id, followerId, vendorId, joined) 
                  VALUES (${follower.id}, ${follower.followerId}, ${follower.vendorId}, ${follower.joined})
                  ON CONFLICT (id) DO NOTHING`;
    } catch (e) {
        console.error("Add Follower Failed", e);
    }
};

export const removeFollowerFromDb = async (followerId: string, vendorId: string) => {
    try {
        await sql`DELETE FROM followers WHERE followerId=${followerId} AND vendorId=${vendorId}`;
    } catch (e) {
        console.error("Remove Follower Failed", e);
    }
};

// --- WRITE OPERATIONS (NOTIFICATIONS) ---

export const createNotificationInDb = async (notif: AppNotification) => {
    try {
        await sql`INSERT INTO notifications (id, userId, title, message, read, date, type, link) 
                  VALUES (${notif.id}, ${notif.userId || 'all'}, ${notif.title}, ${notif.message}, ${notif.read}, ${notif.date}, ${notif.type}, ${notif.link})`;
    } catch (e) {
        console.error("Create Notification Failed", e);
    }
};

export const markNotificationRead = async (id: string) => {
    try {
        await sql`UPDATE notifications SET read=true WHERE id=${id}`;
    } catch (e) {
        console.error("Mark Read Failed", e);
    }
};

// --- WRITE OPERATIONS (USERS) ---

export const createUserInDb = async (user: { id: string, name: string, email: string, role: string, avatar: string, status: string, verificationStatus?: VerificationStatus }) => {
    try {
        await sql`INSERT INTO users (id, uid, name, email, role, avatar, joined, status, verificationStatus) 
                  VALUES (${user.id}, ${user.id}, ${user.name}, ${user.email}, ${user.role}, ${user.avatar}, ${new Date().toISOString()}, ${user.status}, ${user.verificationStatus || 'PENDING'})
                  ON CONFLICT (id) DO NOTHING`;
    } catch (e) {
        console.error("Create User Failed", e);
    }
};

export const updateUserInDb = async (user: User) => {
    try {
        await sql`UPDATE users SET 
                  name = ${user.name}, 
                  email = ${user.email}, 
                  role = ${user.role}, 
                  avatar = ${user.avatar}, 
                  status = ${user.status}, 
                  verificationStatus = ${user.verificationStatus}
                  WHERE id = ${user.id}`;
    } catch (e) {
        console.error("Update User Failed", e);
    }
};

export const deleteUserFromDb = async (userId: string) => {
    try {
        await sql`DELETE FROM users WHERE id = ${userId}`;
    } catch (e) {
        console.error("Delete User Failed", e);
    }
};

// --- WRITE OPERATIONS (CMS) ---

export const voteForProduct = async (productId: string, userId: string) => {
    try {
        const voteId = `${userId}_${productId}`;
        await sql`INSERT INTO product_votes (id, userId, productId, votedAt) 
                  VALUES (${voteId}, ${userId}, ${productId}, ${new Date().toISOString()})
                  ON CONFLICT (id) DO NOTHING`;
        
        await sql`UPDATE products SET votes = COALESCE(votes, 0) + 1 WHERE id = ${productId}`;
    } catch (e) {
        console.error("Error voting for product:", e);
    }
};

export const fetchUserVotes = async (userId: string): Promise<string[]> => {
    try {
        const result = (await sql`SELECT productId FROM product_votes WHERE userId = ${userId}`) as any[];
        return result.map(row => row.productid);
    } catch (e) {
        console.error("Error fetching user votes:", e);
        return [];
    }
};

export const updateLandingContentInDb = async (content: LandingPageContent) => {
    try {
        await sql`INSERT INTO cms (id, content) VALUES ('main', ${JSON.stringify(content)})
                  ON CONFLICT (id) DO UPDATE SET content = ${JSON.stringify(content)}`;
    } catch (e) {
        console.error("Update CMS Failed", e);
    }
};

// --- WRITE OPERATIONS (ORDERS) ---

export const createOrderInDb = async (order: Order) => {
    try {
        await sql`INSERT INTO orders (id, customerName, date, total, status, items) 
                  VALUES (${order.id}, ${order.customerName}, ${order.date}, ${order.total}, ${order.status}, ${JSON.stringify(order.items)})`;
    } catch (e) {
        console.error("Create Order Failed", e);
    }
};

export const updateOrderStatusInDb = async (orderId: string, status: string) => {
    try {
        await sql`UPDATE orders SET status=${status} WHERE id=${orderId}`;
    } catch (e) {
        console.error("Update Order Status Failed", e);
    }
};

// --- WRITE OPERATIONS (CONTACT) ---

export const submitContactFormInDb = async (submission: ContactSubmission) => {
    try {
        await sql`INSERT INTO contacts (id, name, email, subject, message, date, status) 
                  VALUES (${submission.id}, ${submission.name}, ${submission.email}, ${submission.subject}, ${submission.message}, ${submission.date}, ${submission.status})`;
    } catch (e) {
        console.error("Submit Contact Failed", e);
    }
};

export const updateContactStatusInDb = async (id: string, status: 'NEW' | 'READ' | 'ARCHIVED') => {
    try {
        await sql`UPDATE contacts SET status=${status} WHERE id=${id}`;
    } catch (e) {
        console.error("Update Contact Status Failed", e);
    }
};

// --- WRITE OPERATIONS (WAITLIST) ---

export const joinWaitlistInDb = async (entry: WaitlistEntry) => {
    try {
        await sql`INSERT INTO waitlist (id, email, joinedAt) 
                  VALUES (${entry.id}, ${entry.email}, ${entry.date})
                  ON CONFLICT (id) DO NOTHING`;
    } catch (e) {
        console.error("Join Waitlist Failed", e);
    }
};

export const fetchCartItems = async (userId: string): Promise<CartItem[]> => {
    try {
        const result = (await sql`
            SELECT c.id as cartitemid, c.quantity, c.size, c.measurements, c.addedAt, p.* 
            FROM cart_items c 
            JOIN products p ON c.productId = p.id 
            WHERE c.userId = ${userId} 
            ORDER BY c.addedAt DESC
        `) as any[];
        
        return result.map(row => ({
            ...row,
            id: row.id, // product id
            cartItemId: row.cartitemid,
            quantity: row.quantity,
            size: row.size,
            measurements: row.measurements ? JSON.parse(row.measurements) : null,
            price: Number(row.price)
        })) as CartItem[];
    } catch (e) {
        console.error("Error fetching cart items:", e);
        return [];
    }
};

export const addCartItemToDb = async (userId: string, item: CartItem) => {
    try {
        const cartItemId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await sql`INSERT INTO cart_items (id, userId, productId, quantity, size, measurements, addedAt) 
                  VALUES (${cartItemId}, ${userId}, ${item.id}, ${item.quantity}, ${item.size}, ${item.measurements ? JSON.stringify(item.measurements) : null}, ${new Date().toISOString()})`;
        return cartItemId;
    } catch (e) {
        console.error("Add Cart Item Failed", e);
        return null;
    }
};

export const updateCartItemInDb = async (cartItemId: string, quantity: number, size: string) => {
    try {
        await sql`UPDATE cart_items SET quantity=${quantity}, size=${size} WHERE id=${cartItemId}`;
    } catch (e) {
        console.error("Update Cart Item Failed", e);
    }
};

export const removeCartItemFromDb = async (cartItemId: string) => {
    try {
        await sql`DELETE FROM cart_items WHERE id=${cartItemId}`;
    } catch (e) {
        console.error("Remove Cart Item Failed", e);
    }
};

export const clearCartInDb = async (userId: string) => {
    try {
        await sql`DELETE FROM cart_items WHERE userId=${userId}`;
    } catch (e) {
        console.error("Clear Cart Failed", e);
    }
};

export const fetchSavedItems = async (userId: string): Promise<Product[]> => {
    try {
        const result = (await sql`
            SELECT s.savedAt, p.* 
            FROM saved_items s 
            JOIN products p ON s.productId = p.id 
            WHERE s.userId = ${userId} 
            ORDER BY s.savedAt DESC
        `) as any[];
        
        return result.map(row => ({
            ...row,
            id: row.id,
            price: Number(row.price)
        })) as Product[];
    } catch (e) {
        console.error("Error fetching saved items:", e);
        return [];
    }
};

export const addSavedItemToDb = async (userId: string, productId: string) => {
    try {
        const savedItemId = `${userId}_${productId}`;
        await sql`INSERT INTO saved_items (id, userId, productId, savedAt) 
                  VALUES (${savedItemId}, ${userId}, ${productId}, ${new Date().toISOString()})
                  ON CONFLICT (id) DO NOTHING`;
    } catch (e) {
        console.error("Add Saved Item Failed", e);
    }
};

export const removeSavedItemFromDb = async (userId: string, productId: string) => {
    try {
        const savedItemId = `${userId}_${productId}`;
        await sql`DELETE FROM saved_items WHERE id=${savedItemId}`;
    } catch (e) {
        console.error("Remove Saved Item Failed", e);
    }
};

export const fetchChatMessages = async (userId: string): Promise<ChatMessage[]> => {
    try {
        const result = (await sql`SELECT * FROM chat_messages WHERE userId = ${userId} ORDER BY timestamp ASC`) as any[];
        return result.map(row => ({
            id: row.id,
            sender: row.sender,
            text: row.text,
            timestamp: new Date(row.timestamp)
        })) as ChatMessage[];
    } catch (e) {
        console.error("Error fetching chat messages:", e);
        return [];
    }
};

export const addChatMessageToDb = async (userId: string, message: ChatMessage) => {
    try {
        await sql`INSERT INTO chat_messages (id, userId, sender, text, timestamp, read) 
                  VALUES (${message.id}, ${userId}, ${message.sender}, ${message.text}, ${message.timestamp.toISOString()}, false)`;
    } catch (e) {
        console.error("Add Chat Message Failed", e);
    }
};
