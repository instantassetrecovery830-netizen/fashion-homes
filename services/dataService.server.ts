
import { Product, Vendor, Order, User, LandingPageContent, ContactSubmission, VerificationStatus, Follower, AppNotification, WaitlistEntry, CartItem, ChatMessage, DirectMessage, UserRole, Review } from '../types.ts';
import { sql } from './db.ts';
import bcrypt from 'bcryptjs';
import { emitNotification, emitMessage, emitOrderCreated, emitOrderUpdated } from './socketService.server.ts';

// --- INITIALIZATION & SEEDING ---

export const initSchema = async () => {
    console.log("Initializing database schema...");
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS vendors (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                bio TEXT,
                visual_theme TEXT,
                avatar TEXT,
                location TEXT,
                website TEXT,
                verification_status TEXT,
                subscription_status TEXT,
                subscription_plan TEXT,
                cover_image TEXT,
                instagram TEXT,
                twitter TEXT,
                facebook TEXT,
                tiktok TEXT,
                payment_methods JSONB,
                kyc_documents JSONB,
                gallery JSONB,
                video_url TEXT,
                shipping_address JSONB
            )
        `;
        console.log("Vendors table ready.");

        // Ensure shipping_address column exists for existing tables
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS shipping_address JSONB`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS visual_theme TEXT`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS verification_status TEXT`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS subscription_status TEXT`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS subscription_plan TEXT`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS cover_image TEXT`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS instagram TEXT`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS twitter TEXT`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS facebook TEXT`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS tiktok TEXT`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS payment_methods JSONB`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS kyc_documents JSONB`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS gallery JSONB`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS video_url TEXT`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS location TEXT`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS website TEXT`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS avatar TEXT`;
        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS bio TEXT`;

        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                designer TEXT NOT NULL,
                price DECIMAL NOT NULL,
                vendor_id TEXT REFERENCES vendors(id),
                category TEXT,
                image TEXT,
                images JSONB,
                video TEXT,
                description TEXT,
                rating DECIMAL,
                is_new_season BOOLEAN,
                stock INTEGER,
                sizes JSONB,
                is_pre_order BOOLEAN,
                release_date TEXT,
                created_at TEXT,
                votes INTEGER DEFAULT 0,
                drop_date TEXT
            )
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS user_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                action TEXT NOT NULL,
                details JSONB,
                timestamp TEXT NOT NULL
            )
        `;
        console.log("User logs table ready.");

    // Ensure created_at, images, and video columns exist for existing tables
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS video TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_season BOOLEAN`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_pre_order BOOLEAN`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS release_date TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS drop_date TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id TEXT REFERENCES vendors(id)`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS rating DECIMAL`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSONB`;

    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL,
            avatar TEXT,
            joined TEXT,
            status TEXT,
            spend TEXT,
            location TEXT,
            verification_status TEXT,
            phone TEXT,
            shipping_address JSONB,
            measurements JSONB
        )
    `;

    // Ensure columns exist for existing tables
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS joined TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS spend TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS shipping_address JSONB`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS measurements JSONB`;

    await sql`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            date TEXT NOT NULL,
            total DECIMAL NOT NULL,
            status TEXT NOT NULL,
            items JSONB NOT NULL,
            user_id TEXT REFERENCES users(id),
            shipping_cost DECIMAL DEFAULT 0
        )
    `;

    // Ensure user_id, shipping_cost, and customer_name columns exist for existing tables
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id)`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL DEFAULT 0`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT`;

    await sql`
        CREATE TABLE IF NOT EXISTS followers (
            id TEXT PRIMARY KEY,
            name TEXT,
            avatar TEXT,
            location TEXT,
            joined TEXT,
            purchases INTEGER,
            style TEXT,
            vendor_id TEXT REFERENCES vendors(id),
            follower_id TEXT REFERENCES users(id)
        )
    `;

    // Ensure columns exist for existing tables
    await sql`ALTER TABLE followers ADD COLUMN IF NOT EXISTS vendor_id TEXT REFERENCES vendors(id)`;
    await sql`ALTER TABLE followers ADD COLUMN IF NOT EXISTS follower_id TEXT REFERENCES users(id)`;

    // Ensure foreign key columns exist for existing tables
    try {
        await sql`ALTER TABLE cart_items ADD COLUMN user_id TEXT REFERENCES users(id)`;
    } catch (e) {}
    try {
        await sql`ALTER TABLE cart_items ADD COLUMN product_id TEXT REFERENCES products(id)`;
    } catch (e) {}
    try {
        await sql`ALTER TABLE saved_items ADD COLUMN user_id TEXT REFERENCES users(id)`;
    } catch (e) {}
    try {
        await sql`ALTER TABLE saved_items ADD COLUMN product_id TEXT REFERENCES products(id)`;
    } catch (e) {}
    try {
        await sql`ALTER TABLE chat_messages ADD COLUMN user_id TEXT REFERENCES users(id)`;
    } catch (e) {}
    try {
        await sql`ALTER TABLE product_votes ADD COLUMN user_id TEXT REFERENCES users(id)`;
    } catch (e) {}
    try {
        await sql`ALTER TABLE product_votes ADD COLUMN product_id TEXT REFERENCES products(id)`;
    } catch (e) {}
    try {
        await sql`ALTER TABLE waitlist ADD COLUMN product_id TEXT REFERENCES products(id)`;
    } catch (e) {}

    await sql`
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT FALSE,
            date TEXT NOT NULL,
            type TEXT NOT NULL,
            link TEXT
        )
    `;

    // Ensure user_id column exists for existing tables
    try {
        await sql`ALTER TABLE notifications ADD COLUMN user_id TEXT`;
    } catch (e) {
        // Column might already exist
    }

    await sql`
        CREATE TABLE IF NOT EXISTS cms (
            id TEXT PRIMARY KEY,
            content JSONB NOT NULL
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS contacts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT DEFAULT 'NEW'
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS waitlist (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            product_id TEXT REFERENCES products(id),
            date TEXT NOT NULL
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS cart_items (
            cart_item_id TEXT PRIMARY KEY,
            user_id TEXT REFERENCES users(id),
            product_id TEXT REFERENCES products(id),
            quantity INTEGER NOT NULL,
            size TEXT,
            added_at TEXT NOT NULL
        )
    `;

    // Ensure added_at column exists for existing tables
    await sql`ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS added_at TEXT`;

    await sql`
        CREATE TABLE IF NOT EXISTS saved_items (
            id TEXT PRIMARY KEY,
            user_id TEXT REFERENCES users(id),
            product_id TEXT REFERENCES products(id),
            saved_at TEXT NOT NULL,
            UNIQUE(user_id, product_id)
        )
    `;

    // Ensure saved_at column exists for existing tables
    await sql`ALTER TABLE saved_items ADD COLUMN IF NOT EXISTS saved_at TEXT`;

    await sql`
        CREATE TABLE IF NOT EXISTS chat_messages (
            id TEXT PRIMARY KEY,
            user_id TEXT REFERENCES users(id),
            sender TEXT NOT NULL,
            text TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            read BOOLEAN DEFAULT FALSE
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS product_votes (
            id TEXT PRIMARY KEY,
            user_id TEXT REFERENCES users(id),
            product_id TEXT REFERENCES products(id),
            voted_at TEXT NOT NULL,
            UNIQUE(user_id, product_id)
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS direct_messages (
            id TEXT PRIMARY KEY,
            sender_id TEXT NOT NULL,
            receiver_id TEXT NOT NULL,
            text TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            read BOOLEAN DEFAULT FALSE,
            product_id TEXT
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS reviews (
            id TEXT PRIMARY KEY,
            product_id TEXT REFERENCES products(id),
            user_id TEXT REFERENCES users(id),
            user_name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            text TEXT NOT NULL,
            photos JSONB,
            created_at TEXT NOT NULL
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS product_variants (
            id TEXT PRIMARY KEY,
            product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
            size TEXT NOT NULL,
            color TEXT,
            stock INTEGER NOT NULL DEFAULT 0
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS product_analytics (
            id TEXT PRIMARY KEY,
            product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
            vendor_id TEXT REFERENCES vendors(id) ON DELETE CASCADE,
            type TEXT NOT NULL, -- 'VIEW', 'SALE', 'CART_ADD'
            timestamp TEXT NOT NULL
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS shipments (
            id TEXT PRIMARY KEY,
            order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
            vendor_id TEXT REFERENCES vendors(id) ON DELETE CASCADE,
            customer_name TEXT NOT NULL,
            destination TEXT NOT NULL,
            carrier TEXT NOT NULL,
            tracking_number TEXT NOT NULL,
            status TEXT NOT NULL, -- 'Pending', 'In Transit', 'Delivered', 'Exception'
            estimated_delivery TEXT,
            created_at TEXT NOT NULL
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS auth_accounts (
            uid TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    `;

    // Ensure created_at column exists for existing tables
    await sql`ALTER TABLE auth_accounts ADD COLUMN IF NOT EXISTS created_at TEXT`;

    } catch (e) {
        console.error("Error initializing schema:", e);
        throw e;
    }
};

export const seedDatabase = async () => {
    console.log("Seeding database with initial data...");
    
    // Seed vendors
    const v1: Vendor = {
        id: 'v1',
        name: 'Atelier Lagos',
        email: 'atelier@lagos.com',
        bio: 'Merging digital craftsmanship with sustainable organic fibers.',
        visualTheme: 'MINIMALIST',
        avatar: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600',
        location: 'Lagos, Nigeria',
        website: 'www.atelier-lagos.com',
        verificationStatus: 'VERIFIED',
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: 'Atelier'
    };
    await sql`
        INSERT INTO vendors (id, name, email, bio, visual_theme, avatar, location, website, verification_status, subscription_status, subscription_plan)
        VALUES (${v1.id}, ${v1.name}, ${v1.email}, ${v1.bio}, ${v1.visualTheme}, ${v1.avatar}, ${v1.location}, ${v1.website}, ${v1.verificationStatus}, ${v1.subscriptionStatus}, ${v1.subscriptionPlan})
        ON CONFLICT (id) DO NOTHING
    `;

    const v2: Vendor = {
        id: 'v2',
        name: 'Accra Avant-Garde',
        email: 'accra@avant.com',
        bio: 'Monochromatic minimalism for the modern avant-garde.',
        visualTheme: 'DARK',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600',
        location: 'Accra, Ghana',
        website: 'www.accra-avant.com',
        verificationStatus: 'VERIFIED',
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: 'Maison'
    };
    await sql`
        INSERT INTO vendors (id, name, email, bio, visual_theme, avatar, location, website, verification_status, subscription_status, subscription_plan)
        VALUES (${v2.id}, ${v2.name}, ${v2.email}, ${v2.bio}, ${v2.visualTheme}, ${v2.avatar}, ${v2.location}, ${v2.website}, ${v2.verificationStatus}, ${v2.subscriptionStatus}, ${v2.subscriptionPlan})
        ON CONFLICT (id) DO NOTHING
    `;
    
    // Seed products
    const p1: Product = {
        id: 'p1',
        name: 'Lagos Silk Dress',
        price: 250,
        vendorId: 'v1',
        designer: 'Atelier Lagos',
        description: 'Hand-woven silk dress with asymmetrical cut.',
        createdAt: new Date().toISOString(),
        category: 'Dresses',
        image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800',
        rating: 4.8,
        isNewSeason: true,
        stock: 5,
        sizes: ["S", "M", "L"],
        isPreOrder: false
    };
    await sql`
        INSERT INTO products (id, name, designer, price, vendor_id, description, created_at, category, image, rating, is_new_season, stock, sizes, is_pre_order)
        VALUES (${p1.id}, ${p1.name}, ${p1.designer}, ${p1.price}, ${p1.vendorId}, ${p1.description}, ${p1.createdAt}, ${p1.category}, ${p1.image}, ${p1.rating}, ${p1.isNewSeason}, ${p1.stock}, ${JSON.stringify(p1.sizes)}, ${p1.isPreOrder})
        ON CONFLICT (id) DO NOTHING
    `;

    const p2: Product = {
        id: 'p2',
        name: 'Accra Leather Bag',
        price: 150,
        vendorId: 'v2',
        designer: 'Accra Avant-Garde',
        description: 'Genuine leather bag with metallic hardware.',
        createdAt: new Date().toISOString(),
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=800',
        rating: 5.0,
        isNewSeason: true,
        stock: 12,
        sizes: ["One Size"],
        isPreOrder: false
    };
    await sql`
        INSERT INTO products (id, name, designer, price, vendor_id, description, created_at, category, image, rating, is_new_season, stock, sizes, is_pre_order)
        VALUES (${p2.id}, ${p2.name}, ${p2.designer}, ${p2.price}, ${p2.vendorId}, ${p2.description}, ${p2.createdAt}, ${p2.category}, ${p2.image}, ${p2.rating}, ${p2.isNewSeason}, ${p2.stock}, ${JSON.stringify(p2.sizes)}, ${p2.isPreOrder})
        ON CONFLICT (id) DO NOTHING
    `;
        
    // Seed CMS
    await sql`
        INSERT INTO cms (id, content)
        VALUES ('main', ${JSON.stringify(DEFAULT_CMS_CONTENT)})
        ON CONFLICT (id) DO NOTHING
    `;

    // Seed initial notifications
    const n1: AppNotification = {
        id: 'n1',
        userId: 'all',
        title: 'Welcome to MyFitStore',
        message: 'Experience the new vanguard of digital luxury. Explore our curated collections.',
        read: false,
        date: new Date().toISOString(),
        type: 'SYSTEM',
        link: 'MARKETPLACE'
    };
    const n2: AppNotification = {
        id: 'n2',
        userId: 'all',
        title: 'New Season Drop',
        message: 'The Vantablack Ether Coat is now available for pre-order. Limited quantities.',
        read: false,
        date: new Date().toISOString(),
        type: 'PROMO',
        link: 'THE_DROP'
    };

    await sql`
        INSERT INTO notifications (id, user_id, title, message, read, date, type, link)
        VALUES (${n1.id}, ${n1.userId}, ${n1.title}, ${n1.message}, ${n1.read}, ${n1.date}, ${n1.type}, ${n1.link}),
               (${n2.id}, ${n2.userId}, ${n2.title}, ${n2.message}, ${n2.read}, ${n2.date}, ${n2.type}, ${n2.link})
        ON CONFLICT (id) DO NOTHING
    `;

    // Seed Admin Users
    const adminEmails = ['instantassetrecovery830@gmail.com', 'juliemtrice7@proton.me', 'mikelarry00764@proton.me'];
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    for (const email of adminEmails) {
        const uid = `admin_${email.split('@')[0]}`;
        // Check if exists
        const existing = await sql`SELECT uid FROM auth_accounts WHERE email = ${email}`;
        if (existing.length === 0) {
            await sql`
                INSERT INTO auth_accounts (uid, email, password, created_at)
                VALUES (${uid}, ${email}, ${hashedPassword}, ${new Date().toISOString()})
            `;
            await sql`
                INSERT INTO users (id, name, email, role, avatar, joined, status)
                VALUES (${uid}, 'Admin', ${email}, ${UserRole.ADMIN}, 'https://ui-avatars.com/api/?name=Admin', ${new Date().toISOString()}, 'ACTIVE')
            `;
        }
    }

    // Seed some mock customers and vendors to populate the dashboard
    const mockUsers = [
        { id: 'u1', name: 'Sarah Johnson', email: 'sarah@example.com', role: UserRole.BUYER, avatar: 'https://i.pravatar.cc/150?u=u1', joined: new Date().toISOString(), status: 'ACTIVE', spend: '$1,200', location: 'New York, USA' },
        { id: 'u2', name: 'Michael Chen', email: 'michael@example.com', role: UserRole.BUYER, avatar: 'https://i.pravatar.cc/150?u=u2', joined: new Date().toISOString(), status: 'ACTIVE', spend: '$850', location: 'London, UK' },
        { id: 'u3', name: 'Elena Rodriguez', email: 'elena@example.com', role: UserRole.BUYER, avatar: 'https://i.pravatar.cc/150?u=u3', joined: new Date().toISOString(), status: 'ACTIVE', spend: '$2,100', location: 'Madrid, Spain' }
    ];

    for (const user of mockUsers) {
        await sql`
            INSERT INTO users (id, name, email, role, avatar, joined, status, spend, location)
            VALUES (${user.id}, ${user.name}, ${user.email}, ${user.role}, ${user.avatar}, ${user.joined}, ${user.status}, ${user.spend}, ${user.location})
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                role = EXCLUDED.role,
                avatar = EXCLUDED.avatar,
                status = EXCLUDED.status,
                spend = EXCLUDED.spend,
                location = EXCLUDED.location
        `;
    }

    const mockVendors = [
        { id: 'v3', name: 'Nairobi Knits', email: 'nairobi@knits.com', bio: 'Sustainable knitwear from the heart of Kenya.', visualTheme: 'GOLD', avatar: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600', location: 'Nairobi, Kenya', website: 'www.nairobi-knits.com', verificationStatus: 'VERIFIED', subscriptionStatus: 'ACTIVE', subscriptionPlan: 'Couture' },
        { id: 'v4', name: 'Cape Town Couture', email: 'ct@couture.com', bio: 'High-end fashion inspired by the Atlantic coast.', visualTheme: 'MINIMALIST', avatar: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600', location: 'Cape Town, South Africa', website: 'www.ct-couture.com', verificationStatus: 'PENDING', subscriptionStatus: 'ACTIVE', subscriptionPlan: 'Maison' }
    ];

    for (const vendor of mockVendors) {
        await sql`
            INSERT INTO vendors (id, name, email, bio, visual_theme, avatar, location, website, verification_status, subscription_status, subscription_plan)
            VALUES (${vendor.id}, ${vendor.name}, ${vendor.email}, ${vendor.bio}, ${vendor.visualTheme}, ${vendor.avatar}, ${vendor.location}, ${vendor.website}, ${vendor.verificationStatus}, ${vendor.subscriptionStatus}, ${vendor.subscriptionPlan})
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                bio = EXCLUDED.bio,
                visual_theme = EXCLUDED.visual_theme,
                avatar = EXCLUDED.avatar,
                location = EXCLUDED.location,
                website = EXCLUDED.website,
                verification_status = EXCLUDED.verification_status,
                subscription_status = EXCLUDED.subscription_status,
                subscription_plan = EXCLUDED.subscription_plan
        `;
    }

    console.log("Database seeded with mock data.");
};

// --- PRODUCTION CONFIGURATION ---

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
  drop: {
    title: 'VANTABLACK ETHER COAT',
    subtitle: 'MAISON OMEGA',
    description: 'A masterpiece of light absorption. The Vantablack Ether Coat redefines the silhouette with a void-like presence. Highly limited run.',
    backgroundImages: ['https://images.unsplash.com/photo-1536766820879-059fec98ec0a?q=80&w=1974&auto=format&fit=crop'],
    countdownDate: new Date(Date.now() + 172800000).toISOString(),
    productIds: []
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

// --- READ OPERATIONS ---

export const fetchVendors = async (): Promise<Vendor[]> => {
    const rows = await sql`SELECT * FROM vendors`;
    return rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        bio: r.bio,
        visualTheme: r.visual_theme,
        avatar: r.avatar,
        location: r.location,
        website: r.website,
        verificationStatus: r.verification_status,
        subscriptionStatus: r.subscription_status,
        subscriptionPlan: r.subscription_plan,
        coverImage: r.cover_image,
        instagram: r.instagram,
        twitter: r.twitter,
        facebook: r.facebook,
        tiktok: r.tiktok,
        paymentMethods: r.payment_methods,
        kycDocuments: r.kyc_documents,
        gallery: r.gallery,
        videoUrl: r.video_url
    } as Vendor));
};

export const fetchProducts = async (): Promise<Product[]> => {
    const productRows = await sql`SELECT * FROM products ORDER BY created_at DESC`;
    const variantRows = await sql`SELECT * FROM product_variants`;

    const variantsByProduct: Record<string, any[]> = {};
    variantRows.forEach(v => {
        if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = [];
        variantsByProduct[v.product_id].push({
            id: v.id,
            size: v.size,
            color: v.color,
            stock: v.stock
        });
    });

    return productRows.map(r => ({
        id: r.id,
        name: r.name,
        designer: r.designer,
        price: Number(r.price),
        vendorId: r.vendor_id,
        category: r.category,
        image: r.image,
        images: r.images,
        video: r.video,
        description: r.description,
        rating: Number(r.rating),
        isNewSeason: r.is_new_season,
        stock: r.stock,
        sizes: r.sizes,
        variants: variantsByProduct[r.id] || [],
        isPreOrder: r.is_pre_order,
        releaseDate: r.release_date,
        createdAt: r.created_at,
        votes: r.votes,
        dropDate: r.drop_date
    } as Product));
};

export const fetchOrders = async (): Promise<Order[]> => {
    const rows = await sql`SELECT * FROM orders ORDER BY date DESC`;
    return rows.map(r => ({
        id: r.id,
        customerName: r.customer_name,
        date: r.date,
        total: Number(r.total),
        status: r.status,
        items: r.items,
        buyerId: r.user_id,
        shippingCost: Number(r.shipping_cost)
    } as Order));
};

export const fetchUsers = async (): Promise<User[]> => {
    const rows = await sql`SELECT * FROM users`;
    return rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        avatar: r.avatar,
        joined: r.joined,
        status: r.status,
        spend: r.spend,
        location: r.location,
        verificationStatus: r.verification_status,
        phone: r.phone,
        shippingAddress: r.shipping_address,
        measurements: r.measurements
    } as User));
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
    if (rows.length > 0) {
        const r = rows[0];
        return {
            id: r.id,
            name: r.name,
            email: r.email,
            role: r.role,
            avatar: r.avatar,
            joined: r.joined,
            status: r.status,
            spend: r.spend,
            location: r.location,
            verificationStatus: r.verification_status,
            phone: r.phone,
            shippingAddress: r.shipping_address,
            measurements: r.measurements
        } as User;
    }
    return null;
};

export const getVendorByEmail = async (email: string): Promise<Vendor | null> => {
    try {
        const rows = await sql`SELECT * FROM vendors WHERE email = ${email} LIMIT 1`;
        if (rows.length > 0) {
            const r = rows[0];
            return {
                id: r.id,
                name: r.name,
                email: r.email,
                bio: r.bio,
                visualTheme: r.visual_theme,
                avatar: r.avatar,
                location: r.location,
                website: r.website,
                verificationStatus: r.verification_status,
                subscriptionStatus: r.subscription_status,
                subscriptionPlan: r.subscription_plan,
                coverImage: r.cover_image,
                instagram: r.instagram,
                twitter: r.twitter,
                facebook: r.facebook,
                tiktok: r.tiktok,
                paymentMethods: r.payment_methods,
                kycDocuments: r.kyc_documents,
                gallery: r.gallery,
                videoUrl: r.video_url
            } as Vendor;
        }
        return null;
    } catch (e) {
        console.error("Error fetching vendor by email:", e);
        return null;
    }
};

export const fetchVendorFollowerCount = async (vendorId: string): Promise<number> => {
    try {
        const rows = await sql`SELECT COUNT(*) as count FROM followers WHERE vendor_id = ${vendorId}`;
        return Number(rows[0].count);
    } catch (e) {
        console.error("Error fetching follower count:", e);
        return 0;
    }
};

export const fetchVendorFollowers = async (vendorId: string): Promise<Follower[]> => {
    try {
        const rows = await sql`SELECT * FROM followers WHERE vendor_id = ${vendorId} ORDER BY joined DESC`;
        return rows.map(r => ({
            id: r.id,
            name: r.name,
            avatar: r.avatar,
            location: r.location,
            joined: r.joined,
            purchases: r.purchases,
            style: r.style,
            vendorId: r.vendor_id,
            followerId: r.follower_id
        } as Follower));
    } catch (e) {
        console.error("Error fetching vendor followers:", e);
        return [];
    }
};

export const fetchAllFollowers = async (): Promise<Follower[]> => {
    try {
        const rows = await sql`SELECT * FROM followers`;
        return rows.map(r => ({
            id: r.id,
            name: r.name,
            avatar: r.avatar,
            location: r.location,
            joined: r.joined,
            purchases: r.purchases,
            style: r.style,
            vendorId: r.vendor_id,
            followerId: r.follower_id
        } as Follower));
    } catch (e) {
        console.error("Error fetching all followers:", e);
        return [];
    }
};

export const fetchUserFollowedVendors = async (userId: string): Promise<Vendor[]> => {
    try {
        const rows = await sql`
            SELECT v.* FROM vendors v
            JOIN followers f ON v.id = f.vendor_id
            WHERE f.follower_id = ${userId}
        `;
        return rows.map(r => ({
            id: r.id,
            name: r.name,
            email: r.email,
            bio: r.bio,
            visualTheme: r.visual_theme,
            avatar: r.avatar,
            location: r.location,
            website: r.website,
            verificationStatus: r.verification_status,
            subscriptionStatus: r.subscription_status,
            subscriptionPlan: r.subscription_plan
        } as Vendor));
    } catch (e) {
        console.error("Error fetching followed vendors:", e);
        return [];
    }
};

export const fetchNotifications = async (userId?: string): Promise<AppNotification[]> => {
    try {
        const rows = await sql`
            SELECT * FROM notifications 
            WHERE user_id = ${userId || 'all'} OR user_id = 'all'
            ORDER BY date DESC
        `;
        return rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            title: r.title,
            message: r.message,
            read: r.read,
            date: r.date,
            type: r.type,
            link: r.link
        } as AppNotification));
    } catch (e) {
        console.error("Error fetching notifications:", e);
        return [];
    }
};

export const fetchLandingContent = async (): Promise<LandingPageContent> => {
    try {
        const rows = await sql`SELECT content FROM cms WHERE id = 'main' LIMIT 1`;
        if (rows.length > 0) {
            return rows[0].content as LandingPageContent;
        }
        return DEFAULT_CMS_CONTENT;
    } catch (e) {
        console.error("Error fetching landing content:", e);
        return DEFAULT_CMS_CONTENT;
    }
};

export const trackProductEvent = async (productId: string, vendorId: string, type: 'VIEW' | 'SALE' | 'CART_ADD') => {
    const id = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await sql`
        INSERT INTO product_analytics (id, product_id, vendor_id, type, timestamp)
        VALUES (${id}, ${productId}, ${vendorId}, ${type}, ${new Date().toISOString()})
    `;
};

export const fetchVendorAnalytics = async (vendorId: string) => {
    const rows = await sql`
        SELECT type, timestamp, product_id
        FROM product_analytics
        WHERE vendor_id = ${vendorId}
        ORDER BY timestamp ASC
    `;
    return rows;
};

export const fetchVendorShipments = async (vendorId: string) => {
    const rows = await sql`
        SELECT * FROM shipments
        WHERE vendor_id = ${vendorId}
        ORDER BY created_at DESC
    `;
    return rows;
};

export const createShipment = async (shipment: any) => {
    await sql`
        INSERT INTO shipments (id, order_id, vendor_id, customer_name, destination, carrier, tracking_number, status, estimated_delivery, created_at)
        VALUES (${shipment.id}, ${shipment.order_id}, ${shipment.vendor_id}, ${shipment.customer_name}, ${shipment.destination}, ${shipment.carrier}, ${shipment.tracking_number}, ${shipment.status}, ${shipment.estimated_delivery}, ${shipment.created_at})
    `;
    return { success: true };
};

export const updateShipmentStatus = async (id: string, status: string) => {
    await sql`
        UPDATE shipments
        SET status = ${status}
        WHERE id = ${id}
    `;
    return { success: true };
};

export const fetchContactSubmissions = async (): Promise<ContactSubmission[]> => {
    try {
        const rows = await sql`SELECT * FROM contacts ORDER BY date DESC`;
        return rows.map(r => ({
            id: r.id,
            name: r.name,
            email: r.email,
            subject: r.subject,
            message: r.message,
            date: r.date,
            status: r.status
        } as ContactSubmission));
    } catch (e) {
        console.error("Error fetching contact submissions:", e);
        return [];
    }
};

// --- WRITE OPERATIONS (PRODUCTS) ---

export const addProductToDb = async (product: Product) => {
    try {
        await sql`
            INSERT INTO products (id, name, designer, price, vendor_id, category, image, images, video, description, rating, is_new_season, stock, sizes, is_pre_order, release_date, created_at, votes, drop_date)
            VALUES (${product.id}, ${product.name}, ${product.designer}, ${product.price}, ${product.vendorId}, ${product.category}, ${product.image}, ${JSON.stringify(product.images)}, ${product.video}, ${product.description}, ${product.rating}, ${product.isNewSeason}, ${product.stock}, ${JSON.stringify(product.sizes)}, ${product.isPreOrder}, ${product.releaseDate}, ${product.createdAt || new Date().toISOString()}, ${product.votes || 0}, ${product.dropDate})
        `;
        
        if (product.variants && product.variants.length > 0) {
            for (const v of product.variants) {
                await sql`
                    INSERT INTO product_variants (id, product_id, size, color, stock)
                    VALUES (${v.id}, ${product.id}, ${v.size}, ${v.color}, ${v.stock})
                `;
            }
        }
    } catch (e) {
        console.error("Error adding product:", e);
    }
};

export const updateProductInDb = async (product: Product) => {
    try {
        await sql`
            UPDATE products SET 
                name = ${product.name},
                designer = ${product.designer},
                price = ${product.price},
                vendor_id = ${product.vendorId},
                category = ${product.category},
                image = ${product.image},
                images = ${JSON.stringify(product.images)},
                video = ${product.video},
                description = ${product.description},
                rating = ${product.rating},
                is_new_season = ${product.isNewSeason},
                stock = ${product.stock},
                sizes = ${JSON.stringify(product.sizes)},
                is_pre_order = ${product.isPreOrder},
                release_date = ${product.releaseDate},
                votes = ${product.votes},
                drop_date = ${product.dropDate}
            WHERE id = ${product.id}
        `;

        await sql`DELETE FROM product_variants WHERE product_id = ${product.id}`;
        if (product.variants && product.variants.length > 0) {
            for (const v of product.variants) {
                await sql`
                    INSERT INTO product_variants (id, product_id, size, color, stock)
                    VALUES (${v.id}, ${product.id}, ${v.size}, ${v.color}, ${v.stock})
                `;
            }
        }
    } catch (e) {
        console.error("Error updating product:", e);
    }
};

export const deleteProductFromDb = async (productId: string) => {
    try {
        await sql`DELETE FROM products WHERE id = ${productId}`;
    } catch (e) {
        console.error("Error deleting product:", e);
    }
};

// --- WRITE OPERATIONS (VENDORS) ---

export const updateVendorInDb = async (vendor: Vendor) => {
    try {
        await sql`
            UPDATE vendors SET 
                name = ${vendor.name},
                email = ${vendor.email},
                bio = ${vendor.bio},
                visual_theme = ${vendor.visualTheme},
                avatar = ${vendor.avatar},
                location = ${vendor.location},
                website = ${vendor.website},
                verification_status = ${vendor.verificationStatus},
                subscription_status = ${vendor.subscriptionStatus},
                subscription_plan = ${vendor.subscriptionPlan},
                cover_image = ${vendor.coverImage},
                instagram = ${vendor.instagram},
                twitter = ${vendor.twitter},
                facebook = ${vendor.facebook},
                tiktok = ${vendor.tiktok},
                payment_methods = ${JSON.stringify(vendor.paymentMethods)},
                kyc_documents = ${JSON.stringify(vendor.kycDocuments)},
                gallery = ${JSON.stringify(vendor.gallery)},
                video_url = ${vendor.videoUrl},
                shipping_address = ${JSON.stringify(vendor.shipping_address)}
            WHERE id = ${vendor.id}
        `;
    } catch (e) {
        console.error("Error updating vendor:", e);
    }
};

export const createVendorInDb = async (vendor: Vendor) => {
    try {
        await sql`
            INSERT INTO vendors (
                id, name, email, bio, visual_theme, avatar, location, website, 
                verification_status, subscription_status, subscription_plan, 
                cover_image, instagram, twitter, facebook, tiktok, 
                payment_methods, kyc_documents, gallery, video_url, shipping_address
            )
            VALUES (
                ${vendor.id}, ${vendor.name}, ${vendor.email}, ${vendor.bio}, ${vendor.visualTheme}, ${vendor.avatar}, ${vendor.location}, ${vendor.website}, 
                ${vendor.verificationStatus}, ${vendor.subscriptionStatus}, ${vendor.subscriptionPlan},
                ${vendor.coverImage}, ${vendor.instagram}, ${vendor.twitter}, ${vendor.facebook}, ${vendor.tiktok},
                ${JSON.stringify(vendor.paymentMethods)}, ${JSON.stringify(vendor.kycDocuments)}, ${JSON.stringify(vendor.gallery)}, ${vendor.videoUrl}, ${JSON.stringify(vendor.shipping_address)}
            )
        `;
    } catch (e) {
        console.error("Error creating vendor:", e);
    }
};

export const addFollowerToDb = async (follower: Follower & { followerId: string }) => {
    try {
        await sql`
            INSERT INTO followers (id, name, avatar, location, joined, purchases, style, vendor_id, follower_id)
            VALUES (${follower.id}, ${follower.name}, ${follower.avatar}, ${follower.location}, ${follower.joined}, ${follower.purchases}, ${follower.style}, ${follower.vendorId}, ${follower.followerId})
        `;
    } catch (e) {
        console.error("Error adding follower:", e);
    }
};

export const removeFollowerFromDb = async (followerId: string, vendorId: string) => {
    try {
        await sql`DELETE FROM followers WHERE follower_id = ${followerId} AND vendor_id = ${vendorId}`;
    } catch (e) {
        console.error("Error removing follower:", e);
    }
};

// --- WRITE OPERATIONS (NOTIFICATIONS) ---

export const createNotificationInDb = async (notif: AppNotification) => {
    try {
        await sql`
            INSERT INTO notifications (id, user_id, title, message, read, date, type, link)
            VALUES (${notif.id}, ${notif.userId}, ${notif.title}, ${notif.message}, ${notif.read}, ${notif.date}, ${notif.type}, ${notif.link})
        `;
        emitNotification(notif.userId, notif);
    } catch (e) {
        console.error("Error creating notification:", e);
    }
};

export const markNotificationRead = async (id: string) => {
    try {
        await sql`UPDATE notifications SET read = TRUE WHERE id = ${id}`;
    } catch (e) {
        console.error("Error marking notification read:", e);
    }
};

// --- WRITE OPERATIONS (USERS) ---

export const createUserInDb = async (user: { id: string, name: string, email: string, role: UserRole, avatar: string, status: string, verificationStatus?: VerificationStatus }) => {
    try {
        const joined = new Date().toISOString();
        const verificationStatus = user.verificationStatus || 'PENDING';
        await sql`
            INSERT INTO users (id, name, email, role, avatar, joined, status, verification_status)
            VALUES (${user.id}, ${user.name}, ${user.email}, ${user.role}, ${user.avatar}, ${joined}, ${user.status}, ${verificationStatus})
        `;
    } catch (e) {
        console.error("Error creating user:", e);
    }
};

export const updateUserInDb = async (user: User) => {
    try {
        await sql`
            UPDATE users SET 
                name = ${user.name},
                email = ${user.email},
                role = ${user.role},
                avatar = ${user.avatar},
                status = ${user.status},
                spend = ${user.spend},
                location = ${user.location},
                verification_status = ${user.verificationStatus},
                phone = ${user.phone},
                shipping_address = ${JSON.stringify(user.shippingAddress)},
                measurements = ${JSON.stringify(user.measurements)}
            WHERE id = ${user.id}
        `;
    } catch (e) {
        console.error("Error updating user:", e);
    }
};

export const deleteUserFromDb = async (userId: string) => {
    await sql`DELETE FROM users WHERE id = ${userId}`;
};

export const deleteVendorFromDb = async (vendorId: string) => {
    await sql`DELETE FROM vendors WHERE id = ${vendorId}`;
};

// --- WRITE OPERATIONS (CMS) ---

export const voteForProduct = async (productId: string, userId: string) => {
    try {
        const id = `${userId}_${productId}`;
        const votedAt = new Date().toISOString();
        await sql`
            INSERT INTO product_votes (id, user_id, product_id, voted_at)
            VALUES (${id}, ${userId}, ${productId}, ${votedAt})
            ON CONFLICT (user_id, product_id) DO NOTHING
        `;
        await sql`UPDATE products SET votes = votes + 1 WHERE id = ${productId}`;
    } catch (e) {
        console.error("Error voting for product:", e);
    }
};

export const fetchUserVotes = async (userId: string): Promise<string[]> => {
    try {
        const rows = await sql`SELECT product_id FROM product_votes WHERE user_id = ${userId}`;
        return rows.map(r => r.product_id);
    } catch (e) {
        console.error("Error fetching user votes:", e);
        return [];
    }
};

export const updateLandingContentInDb = async (content: LandingPageContent) => {
    try {
        await sql`
            INSERT INTO cms (id, content)
            VALUES ('main', ${JSON.stringify(content)})
            ON CONFLICT (id) DO UPDATE SET content = ${JSON.stringify(content)}
        `;
    } catch (e) {
        console.error("Error updating landing content:", e);
    }
};

// --- WRITE OPERATIONS (ORDERS) ---

export const createOrderInDb = async (order: Order) => {
    try {
        await sql`
            INSERT INTO orders (id, customer_name, date, total, status, items, user_id, shipping_cost)
            VALUES (${order.id}, ${order.customerName}, ${order.date}, ${order.total}, ${order.status}, ${JSON.stringify(order.items)}, ${order.buyerId || null}, ${order.shippingCost || 0})
        `;
        
        // Extract vendor IDs from items
        const vendorIds = Array.from(new Set(order.items.map(item => item.vendorId).filter(Boolean)));
        
        // Create notifications for vendors
        for (const vendorId of vendorIds) {
            const notif: AppNotification = {
                id: `notif_order_${order.id}_${vendorId}`,
                userId: vendorId as string,
                title: 'New Order Received',
                message: `You have a new order #${order.id.slice(0, 8)} for ${order.items.filter(i => i.vendorId === vendorId).length} items.`,
                read: false,
                date: new Date().toISOString(),
                type: 'ORDER',
                link: 'DASHBOARD'
            };
            await createNotificationInDb(notif);
        }

        // Create notification for buyer
        if (order.buyerId) {
            const buyerNotif: AppNotification = {
                id: `notif_order_confirm_${order.id}`,
                userId: order.buyerId,
                title: 'Order Confirmed',
                message: `Your order #${order.id.slice(0, 8)} has been placed successfully.`,
                read: false,
                date: new Date().toISOString(),
                type: 'ORDER',
                link: 'ORDERS'
            };
            await createNotificationInDb(buyerNotif);
        }

        emitOrderCreated(order, vendorIds as string[]);
    } catch (e) {
        console.error("Error creating order:", e);
    }
};

export const updateOrderStatusInDb = async (orderId: string, status: string) => {
    try {
        await sql`UPDATE orders SET status = ${status} WHERE id = ${orderId}`;
        
        // Fetch the order to get the buyerId and emit update
        const [r] = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
        if (r) {
            const order: Order = {
                id: r.id,
                customerName: r.customer_name,
                date: r.date,
                total: Number(r.total),
                status: r.status,
                items: r.items,
                buyerId: r.user_id,
                shippingCost: Number(r.shipping_cost)
            };

            // Create notification for buyer
            if (order.buyerId) {
                const statusNotif: AppNotification = {
                    id: `notif_order_status_${order.id}_${Date.now()}`,
                    userId: order.buyerId,
                    title: 'Order Status Updated',
                    message: `Your order #${order.id.slice(0, 8)} is now ${status}.`,
                    read: false,
                    date: new Date().toISOString(),
                    type: 'ORDER',
                    link: 'ORDERS'
                };
                await createNotificationInDb(statusNotif);
            }

            emitOrderUpdated(order, order.buyerId);
        }
    } catch (e) {
        console.error("Error updating order status:", e);
    }
};

// --- WRITE OPERATIONS (CONTACT) ---

export const submitContactFormInDb = async (submission: ContactSubmission) => {
    try {
        await sql`
            INSERT INTO contacts (id, name, email, subject, message, date, status)
            VALUES (${submission.id}, ${submission.name}, ${submission.email}, ${submission.subject}, ${submission.message}, ${submission.date}, ${submission.status})
        `;
    } catch (e) {
        console.error("Error submitting contact form:", e);
    }
};

export const updateContactStatusInDb = async (id: string, status: 'NEW' | 'READ' | 'ARCHIVED') => {
    try {
        await sql`UPDATE contacts SET status = ${status} WHERE id = ${id}`;
    } catch (e) {
        console.error("Error updating contact status:", e);
    }
};

// --- WRITE OPERATIONS (WAITLIST) ---

export const joinWaitlistInDb = async (entry: WaitlistEntry) => {
    try {
        await sql`
            INSERT INTO waitlist (id, email, product_id, date)
            VALUES (${entry.id}, ${entry.email}, ${entry.productId}, ${entry.date})
        `;
    } catch (e) {
        console.error("Error joining waitlist:", e);
    }
};

export const fetchCartItems = async (userId: string): Promise<CartItem[]> => {
    try {
        const rows = await sql`
            SELECT c.*, p.name, p.designer, p.price, p.category, p.image, p.images, p.video, p.description, p.rating, p.is_new_season, p.stock as product_stock, p.sizes as product_sizes, p.is_pre_order, p.release_date, p.created_at, p.votes, p.drop_date
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ${userId}
            ORDER BY c.added_at DESC
        `;
        return rows.map(r => ({
            id: r.product_id,
            cartItemId: r.cart_item_id,
            name: r.name,
            designer: r.designer,
            price: Number(r.price),
            category: r.category,
            image: r.image,
            images: r.images,
            video: r.video,
            description: r.description,
            rating: Number(r.rating),
            isNewSeason: r.is_new_season,
            stock: r.product_stock,
            sizes: r.product_sizes,
            isPreOrder: r.is_pre_order,
            releaseDate: r.release_date,
            createdAt: r.created_at,
            votes: r.votes,
            dropDate: r.drop_date,
            quantity: r.quantity,
            size: r.size
        } as CartItem));
    } catch (e) {
        console.error("Error fetching cart items:", e);
        return [];
    }
};

export const addCartItemToDb = async (userId: string, item: CartItem) => {
    try {
        const cartItemId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const addedAt = new Date().toISOString();
        await sql`
            INSERT INTO cart_items (cart_item_id, user_id, product_id, quantity, size, added_at)
            VALUES (${cartItemId}, ${userId}, ${item.id}, ${item.quantity}, ${item.size}, ${addedAt})
        `;
        return cartItemId;
    } catch (e) {
        console.error("Error adding cart item:", e);
        return null;
    }
};

export const updateCartItemInDb = async (cartItemId: string, quantity: number, size: string) => {
    try {
        await sql`
            UPDATE cart_items SET quantity = ${quantity}, size = ${size}
            WHERE cart_item_id = ${cartItemId}
        `;
    } catch (e) {
        console.error("Error updating cart item:", e);
    }
};

export const removeCartItemFromDb = async (cartItemId: string) => {
    try {
        await sql`DELETE FROM cart_items WHERE cart_item_id = ${cartItemId}`;
    } catch (e) {
        console.error("Error removing cart item:", e);
    }
};

export const clearCartInDb = async (userId: string) => {
    try {
        await sql`DELETE FROM cart_items WHERE user_id = ${userId}`;
    } catch (e) {
        console.error("Error clearing cart:", e);
    }
};

export const fetchSavedItems = async (userId: string): Promise<Product[]> => {
    try {
        const rows = await sql`
            SELECT p.* FROM products p
            JOIN saved_items s ON p.id = s.product_id
            WHERE s.user_id = ${userId}
            ORDER BY s.saved_at DESC
        `;
        return rows.map(r => ({
            id: r.id,
            name: r.name,
            designer: r.designer,
            price: Number(r.price),
            vendorId: r.vendor_id,
            category: r.category,
            image: r.image,
            images: r.images,
            video: r.video,
            description: r.description,
            rating: Number(r.rating),
            isNewSeason: r.is_new_season,
            stock: r.stock,
            sizes: r.sizes,
            isPreOrder: r.is_pre_order,
            releaseDate: r.release_date,
            createdAt: r.created_at,
            votes: r.votes,
            dropDate: r.drop_date
        } as Product));
    } catch (e) {
        console.error("Error fetching saved items:", e);
        return [];
    }
};

export const addSavedItemToDb = async (userId: string, productId: string) => {
    try {
        const id = `${userId}_${productId}`;
        const savedAt = new Date().toISOString();
        await sql`
            INSERT INTO saved_items (id, user_id, product_id, saved_at)
            VALUES (${id}, ${userId}, ${productId}, ${savedAt})
            ON CONFLICT (user_id, product_id) DO NOTHING
        `;
    } catch (e) {
        console.error("Error adding saved item:", e);
    }
};

export const removeSavedItemFromDb = async (userId: string, productId: string) => {
    try {
        await sql`DELETE FROM saved_items WHERE user_id = ${userId} AND product_id = ${productId}`;
    } catch (e) {
        console.error("Error removing saved item:", e);
    }
};

export const fetchChatMessages = async (userId: string): Promise<ChatMessage[]> => {
    try {
        const rows = await sql`SELECT * FROM chat_messages WHERE user_id = ${userId} ORDER BY timestamp ASC`;
        return rows.map(r => ({
            id: r.id,
            sender: r.sender,
            text: r.text,
            timestamp: new Date(r.timestamp)
        } as ChatMessage));
    } catch (e) {
        console.error("Error fetching chat messages:", e);
        return [];
    }
};

export const addChatMessageToDb = async (userId: string, message: ChatMessage) => {
    try {
        await sql`
            INSERT INTO chat_messages (id, user_id, sender, text, timestamp, read)
            VALUES (${message.id}, ${userId}, ${message.sender}, ${message.text}, ${message.timestamp.toISOString()}, FALSE)
        `;
    } catch (e) {
        console.error("Error adding chat message:", e);
    }
};

// --- AUTHENTICATION OPERATIONS ---

export const signUp = async (email: string, password: string) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const createdAt = new Date().toISOString();
        
        await sql`
            INSERT INTO auth_accounts (uid, email, password, created_at)
            VALUES (${uid}, ${email.toLowerCase()}, ${hashedPassword}, ${createdAt})
        `;
        
        return { uid, email };
    } catch (e: any) {
        if (e.message?.includes('unique constraint')) {
            throw new Error('Email already in use');
        }
        throw e;
    }
};

export const signIn = async (email: string, password: string) => {
    try {
        const rows = await sql`SELECT * FROM auth_accounts WHERE email = ${email.toLowerCase()} LIMIT 1`;
        if (rows.length === 0) {
            throw new Error('User not found');
        }
        
        const account = rows[0];
        const isValid = await bcrypt.compare(password, account.password);
        
        if (!isValid) {
            throw new Error('Invalid password');
        }
        
        return { uid: account.uid, email: account.email };
    } catch (e) {
        throw e;
    }
};

export const updateAuthPassword = async (email: string, newPassword: string) => {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await sql`UPDATE auth_accounts SET password = ${hashedPassword} WHERE email = ${email.toLowerCase()}`;
        return true;
    } catch (e) {
        console.error("Error updating auth password:", e);
        return false;
    }
};

// --- DIRECT MESSAGING OPERATIONS ---

export const fetchDirectMessages = async (userId: string): Promise<DirectMessage[]> => {
    try {
        const rows = await sql`
            SELECT * FROM direct_messages 
            WHERE sender_id = ${userId} OR receiver_id = ${userId} 
            ORDER BY timestamp ASC
        `;
        return rows.map(r => ({
            id: r.id,
            senderId: r.sender_id,
            receiverId: r.receiver_id,
            text: r.text,
            timestamp: r.timestamp,
            read: r.read,
            productId: r.product_id
        } as DirectMessage));
    } catch (e) {
        console.error("Error fetching direct messages:", e);
        return [];
    }
};

export const sendDirectMessage = async (message: DirectMessage) => {
    try {
        await sql`
            INSERT INTO direct_messages (id, sender_id, receiver_id, text, timestamp, read, product_id)
            VALUES (${message.id}, ${message.senderId}, ${message.receiverId}, ${message.text}, ${message.timestamp}, ${message.read}, ${message.productId || null})
        `;
        emitMessage(message.receiverId, message);
    } catch (e) {
        console.error("Error sending direct message:", e);
    }
};

export const markDirectMessagesRead = async (receiverId: string, senderId: string) => {
    try {
        await sql`
            UPDATE direct_messages 
            SET read = TRUE 
            WHERE receiver_id = ${receiverId} AND sender_id = ${senderId} AND read = FALSE
        `;
    } catch (e) {
        console.error("Error marking direct messages read:", e);
    }
};

// --- REVIEWS OPERATIONS ---

export const fetchProductReviews = async (productId: string): Promise<Review[]> => {
    try {
        const rows = await sql`SELECT * FROM reviews WHERE product_id = ${productId} ORDER BY created_at DESC`;
        return rows.map(r => ({
            id: r.id,
            productId: r.product_id,
            userId: r.user_id,
            userName: r.user_name,
            rating: r.rating,
            text: r.text,
            photos: r.photos ? JSON.parse(r.photos) : undefined,
            createdAt: r.created_at
        }));
    } catch (e) {
        console.error("Error fetching product reviews:", e);
        return [];
    }
};

export const addReviewToDb = async (review: Review) => {
    try {
        await sql`
            INSERT INTO reviews (id, product_id, user_id, user_name, rating, text, photos, created_at)
            VALUES (${review.id}, ${review.productId}, ${review.userId}, ${review.userName}, ${review.rating}, ${review.text}, ${review.photos ? JSON.stringify(review.photos) : null}, ${review.createdAt})
        `;
        
        // Update product average rating
        const avg = await sql`SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = ${review.productId}`;
        if (avg.length > 0 && avg[0].avg_rating) {
            await sql`UPDATE products SET rating = ${Number(avg[0].avg_rating).toFixed(1)} WHERE id = ${review.productId}`;
        }
    } catch (e) {
        console.error("Error adding review:", e);
    }
};

// --- SHIPPING OPERATIONS ---

export const getShippingRates = async (addressTo: any, items: CartItem[]) => {
    const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY;
    if (!SHIPPO_API_KEY) {
        console.warn("SHIPPO_API_KEY not found in environment variables.");
        return [];
    }

    try {
        // Get the first vendor's address from the items
        let addressFrom = {
            name: "MyFitStore Fulfillment",
            street1: "123 Fashion Ave",
            city: "San Francisco",
            state: "CA",
            zip: "94103",
            country: "US"
        };

        if (items.length > 0 && items[0].vendorId) {
            const vendorRows = await sql`SELECT shipping_address FROM vendors WHERE id = ${items[0].vendorId}`;
            if (vendorRows.length > 0 && vendorRows[0].shipping_address) {
                let vAddr = vendorRows[0].shipping_address;
                if (typeof vAddr === 'string') {
                    try {
                        vAddr = JSON.parse(vAddr);
                    } catch (e) {
                        console.error("Failed to parse shipping_address", e);
                    }
                }
                
                if (vAddr && typeof vAddr === 'object') {
                    addressFrom = {
                        name: items[0].designer || "Vendor",
                        street1: vAddr.street || vAddr.street1 || "123 Fashion Ave",
                        city: vAddr.city || "San Francisco",
                        state: vAddr.state || "CA",
                        zip: vAddr.zip || "94103",
                        country: vAddr.country || "US"
                    };
                }
            }
        }

        // Calculate total weight (mocking weight for now)
        const totalWeight = items.reduce((sum, item) => sum + (item.quantity * 0.5), 0); // 0.5kg per item

        const response = await fetch("https://api.goshippo.com/shipments/", {
            method: "POST",
            headers: {
                "Authorization": `ShippoToken ${SHIPPO_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                address_from: addressFrom,
                address_to: addressTo,
                parcels: [{
                    length: "10",
                    width: "10",
                    height: "10",
                    distance_unit: "in",
                    weight: totalWeight.toString(),
                    mass_unit: "lb"
                }],
                async: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Shippo API Error:", errorData);
            return [];
        }

        const data = await response.json();
        return data.rates || [];
    } catch (e) {
        console.error("Error fetching shipping rates:", e);
        return [];
    }
};
