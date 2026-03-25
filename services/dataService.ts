
import { db } from './firebase.ts';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  documentId,
  Timestamp,
  addDoc,
  onSnapshot
} from 'firebase/firestore';
import { Product, Vendor, Order, User, LandingPageContent, ContactSubmission, VerificationStatus, Follower, AppNotification, WaitlistEntry, CartItem, ChatMessage } from '../types.ts';
import { sql } from './db.ts';

// --- TEST FUNCTION ---
export const checkFirestoreData = async () => {
    try {
        const vendors = await getDocs(collection(db, 'vendors'));
        console.log('Vendors found in Firestore:', vendors.size);
        return vendors.size > 0;
    } catch (e) {
        console.error('Error checking Firestore data:', e);
        return false;
    }
};
export const seedDatabase = async () => {
    try {
        // Seed vendors
        await sql`INSERT INTO vendors (id, name, email, description, visualTheme) VALUES 
            ('v1', 'Atelier Lagos', 'atelier@lagos.com', 'Heritage reimagined', 'MINIMALIST'),
            ('v2', 'Accra Avant-Garde', 'accra@avant.com', 'Modern African aesthetics', 'DARK')
            ON CONFLICT (id) DO NOTHING`;
        
        // Seed products
        await sql`INSERT INTO products (id, name, price, vendorId, description, createdAt) VALUES 
            ('p1', 'Lagos Silk Dress', 250, 'v1', 'Hand-woven silk', NOW()),
            ('p2', 'Accra Leather Bag', 150, 'v2', 'Genuine leather', NOW())
            ON CONFLICT (id) DO NOTHING`;
            
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

export const initSchema = async () => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS vendors (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            description TEXT,
            visualTheme TEXT
        )`;
        await sql`CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT,
            price NUMERIC,
            vendorId TEXT,
            description TEXT,
            createdAt TEXT
        )`;
        // ... add other tables ...
        console.log("Neon schema initialized");
    } catch (e) {
        console.error("Error initializing Neon schema:", e);
    }
};

export const migrateData = async () => {
    console.log("Starting migration from Firestore to Neon...");
    // 1. Fetch from Firestore
    const vendors = await fetchVendors();
    // 2. Insert into Neon
    for (const vendor of vendors) {
        await sql`INSERT INTO vendors (id, name, email, description, visualTheme) 
                  VALUES (${vendor.id}, ${vendor.name}, ${vendor.email}, ${vendor.bio}, ${vendor.visualTheme || 'MINIMALIST'})
                  ON CONFLICT (id) DO NOTHING`;
    }
    console.log("Migration complete.");
};

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
            name: row.name,
            email: row.email,
            role: row.role,
            avatar: row.avatar,
            joined: row.joined,
            status: row.status,
            verificationStatus: row.verificationstatus
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
                name: row.name,
                email: row.email,
                role: row.role,
                avatar: row.avatar,
                joined: row.joined,
                status: row.status,
                verificationStatus: row.verificationstatus
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
        const q = query(collection(db, 'followers'), where('vendorId', '==', vendorId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (e) {
        console.error("Error fetching follower count:", e);
        return 0;
    }
};

export const fetchVendorFollowers = async (vendorId: string): Promise<Follower[]> => {
    try {
        const q = query(collection(db, 'followers'), where('vendorId', '==', vendorId), orderBy('joined', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Follower[];
    } catch (e) {
        console.error("Fetch Vendor Followers Error:", e);
        return [];
    }
};

export const fetchAllFollowers = async (): Promise<Follower[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, 'followers'));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Follower[];
    } catch (e) {
        console.error("Fetch All Followers Error:", e);
        return [];
    }
};

export const fetchUserFollowedVendors = async (userId: string): Promise<Vendor[]> => {
    try {
        const q = query(collection(db, 'followers'), where('followerId', '==', userId));
        const querySnapshot = await getDocs(q);
        const vendorIds = querySnapshot.docs.map(doc => doc.data().vendorId);
        
        if (vendorIds.length === 0) return [];
        
        // Use 'in' operator to fetch all vendors in one query (limit 30)
        const vendorsQuery = query(
            collection(db, 'vendors'), 
            where(documentId(), 'in', vendorIds.slice(0, 30))
        );
        const vendorsSnapshot = await getDocs(vendorsQuery);
        
        return vendorsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Vendor[];
    } catch (e) {
        console.error("Error fetching followed vendors:", e);
        return [];
    }
};

export const fetchNotifications = async (userId?: string): Promise<AppNotification[]> => {
    try {
        const docRef = doc(db, 'notifications', 'notif_init');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return [{ id: docSnap.id, ...docSnap.data() } as AppNotification];
        } else {
            console.log("No such document!");
            return [];
        }
    } catch (e) {
        console.error("Error fetching notifications", e);
        return [];
    }
};

export const fetchLandingContent = async (): Promise<LandingPageContent> => {
    try {
        const docSnap = await getDoc(doc(db, 'cms', 'main'));
        if (docSnap.exists()) {
            const content = docSnap.data() as LandingPageContent;
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
        const q = query(collection(db, 'contacts'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ContactSubmission[];
    } catch (e) {
        console.error("Fetch Contact Submissions Error:", e);
        return [];
    }
};

// --- WRITE OPERATIONS (PRODUCTS) ---

export const addProductToDb = async (product: Product) => {
    try {
        await setDoc(doc(db, 'products', product.id), {
            ...product,
            createdAt: product.createdAt || new Date().toISOString()
        });
    } catch (e) {
        console.error("Add Product Failed", e);
    }
};

export const updateProductInDb = async (product: Product) => {
    try {
        await updateDoc(doc(db, 'products', product.id), { ...product });
    } catch (e) {
        console.error("Update Product Failed", e);
    }
};

export const deleteProductFromDb = async (productId: string) => {
    try {
        await deleteDoc(doc(db, 'products', productId));
    } catch (e) {
        console.error("Delete Product Failed", e);
    }
};

// --- WRITE OPERATIONS (VENDORS) ---

export const updateVendorInDb = async (vendor: Vendor) => {
    try {
        await updateDoc(doc(db, 'vendors', vendor.id), { ...vendor });
    } catch (e) {
        console.error("Update Vendor Failed", e);
    }
};

export const createVendorInDb = async (vendor: Vendor) => {
    try {
        const vendorDoc = doc(db, 'vendors', vendor.id);
        const docSnap = await getDoc(vendorDoc);
        if (!docSnap.exists()) {
            await setDoc(vendorDoc, {
                ...vendor,
                visualTheme: vendor.visualTheme || 'MINIMALIST'
            });
        }
    } catch (e) {
        console.error("Create Vendor Failed", e);
    }
};

export const addFollowerToDb = async (follower: Follower & { followerId: string }) => {
    try {
        await setDoc(doc(db, 'followers', follower.id), { ...follower });
    } catch (e) {
        console.error("Add Follower Failed", e);
    }
};

export const removeFollowerFromDb = async (followerId: string, vendorId: string) => {
    try {
        const q = query(collection(db, 'followers'), where('followerId', '==', followerId), where('vendorId', '==', vendorId));
        const querySnapshot = await getDocs(q);
        for (const docSnap of querySnapshot.docs) {
            await deleteDoc(doc(db, 'followers', docSnap.id));
        }
    } catch (e) {
        console.error("Remove Follower Failed", e);
    }
};

// --- WRITE OPERATIONS (NOTIFICATIONS) ---

export const createNotificationInDb = async (notif: AppNotification) => {
    try {
        await setDoc(doc(db, 'notifications', notif.id), {
            ...notif,
            userId: notif.userId || 'all'
        });
    } catch (e) {
        console.error("Create Notification Failed", e);
    }
};

export const markNotificationRead = async (id: string) => {
    try {
        await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
        console.error("Mark Read Failed", e);
    }
};

// --- WRITE OPERATIONS (USERS) ---

export const createUserInDb = async (user: { id: string, name: string, email: string, role: string, avatar: string, status: string, verificationStatus?: VerificationStatus }) => {
    try {
        const userDoc = doc(db, 'users', user.id);
        const docSnap = await getDoc(userDoc);
        if (!docSnap.exists()) {
            await setDoc(userDoc, {
                ...user,
                joined: new Date().toISOString(),
                verificationStatus: user.verificationStatus || 'PENDING'
            });
        }
    } catch (e) {
        console.error("Create User Failed", e);
    }
};

export const updateUserInDb = async (user: User) => {
    try {
        const userDoc = doc(db, 'users', user.id);
        await updateDoc(userDoc, { ...user });
    } catch (e) {
        console.error("Update User Failed", e);
    }
};

export const deleteUserFromDb = async (userId: string) => {
    try {
        await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
        console.error("Delete User Failed", e);
    }
};

// --- WRITE OPERATIONS (CMS) ---

export const voteForProduct = async (productId: string, userId: string) => {
    try {
        const voteId = `${userId}_${productId}`;
        const voteDoc = doc(db, 'product_votes', voteId);
        const docSnap = await getDoc(voteDoc);
        if (docSnap.exists()) return;

        await setDoc(voteDoc, {
            userId,
            productId,
            votedAt: new Date().toISOString()
        });

        const productDoc = doc(db, 'products', productId);
        const productSnap = await getDoc(productDoc);
        if (productSnap.exists()) {
            const currentVotes = productSnap.data().votes || 0;
            await updateDoc(productDoc, { votes: currentVotes + 1 });
        }
    } catch (e) {
        console.error("Error voting for product:", e);
    }
};

export const fetchUserVotes = async (userId: string): Promise<string[]> => {
    try {
        const q = query(collection(db, 'product_votes'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data().productId);
    } catch (e) {
        console.error("Error fetching user votes:", e);
        return [];
    }
};

export const updateLandingContentInDb = async (content: LandingPageContent) => {
    try {
        await setDoc(doc(db, 'cms', 'main'), content);
    } catch (e) {
        console.error("Update CMS Failed", e);
    }
};

// --- WRITE OPERATIONS (ORDERS) ---

export const createOrderInDb = async (order: Order) => {
    try {
        await setDoc(doc(db, 'orders', order.id), order);
    } catch (e) {
        console.error("Create Order Failed", e);
    }
};

export const updateOrderStatusInDb = async (orderId: string, status: string) => {
    try {
        await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (e) {
        console.error("Update Order Status Failed", e);
    }
};

// --- WRITE OPERATIONS (CONTACT) ---

export const submitContactFormInDb = async (submission: ContactSubmission) => {
    try {
        await setDoc(doc(db, 'contacts', submission.id), submission);
    } catch (e) {
        console.error("Submit Contact Failed", e);
    }
};

export const updateContactStatusInDb = async (id: string, status: 'NEW' | 'READ' | 'ARCHIVED') => {
    try {
        await updateDoc(doc(db, 'contacts', id), { status });
    } catch (e) {
        console.error("Update Contact Status Failed", e);
    }
};

// --- WRITE OPERATIONS (WAITLIST) ---

export const joinWaitlistInDb = async (entry: WaitlistEntry) => {
    try {
        await setDoc(doc(db, 'waitlist', entry.id), entry);
    } catch (e) {
        console.error("Join Waitlist Failed", e);
    }
};

export const fetchCartItems = async (userId: string): Promise<CartItem[]> => {
    try {
        const q = query(collection(db, 'cart_items'), where('userId', '==', userId), orderBy('addedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const cartItems: CartItem[] = [];
        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            const productDoc = await getDoc(doc(db, 'products', data.productId));
            if (productDoc.exists()) {
                cartItems.push({
                    ...productDoc.data(),
                    id: data.productId,
                    cartItemId: docSnap.id,
                    quantity: data.quantity,
                    size: data.size,
                    measurements: data.measurements
                } as CartItem);
            }
        }
        return cartItems;
    } catch (e) {
        console.error("Error fetching cart items:", e);
        return [];
    }
};

export const addCartItemToDb = async (userId: string, item: CartItem) => {
    try {
        const cartItemId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await setDoc(doc(db, 'cart_items', cartItemId), {
            userId,
            productId: item.id,
            quantity: item.quantity,
            size: item.size,
            measurements: item.measurements || null,
            addedAt: new Date().toISOString()
        });
        return cartItemId;
    } catch (e) {
        console.error("Add Cart Item Failed", e);
        return null;
    }
};

export const updateCartItemInDb = async (cartItemId: string, quantity: number, size: string) => {
    try {
        await updateDoc(doc(db, 'cart_items', cartItemId), { quantity, size });
    } catch (e) {
        console.error("Update Cart Item Failed", e);
    }
};

export const removeCartItemFromDb = async (cartItemId: string) => {
    try {
        await deleteDoc(doc(db, 'cart_items', cartItemId));
    } catch (e) {
        console.error("Remove Cart Item Failed", e);
    }
};

export const clearCartInDb = async (userId: string) => {
    try {
        const q = query(collection(db, 'cart_items'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        for (const docSnap of querySnapshot.docs) {
            await deleteDoc(doc(db, 'cart_items', docSnap.id));
        }
    } catch (e) {
        console.error("Clear Cart Failed", e);
    }
};

export const fetchSavedItems = async (userId: string): Promise<Product[]> => {
    try {
        const q = query(collection(db, 'saved_items'), where('userId', '==', userId), orderBy('savedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const savedItems: Product[] = [];
        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            const productDoc = await getDoc(doc(db, 'products', data.productId));
            if (productDoc.exists()) {
                savedItems.push({
                    id: data.productId,
                    ...productDoc.data()
                } as Product);
            }
        }
        return savedItems;
    } catch (e) {
        console.error("Error fetching saved items:", e);
        return [];
    }
};

export const addSavedItemToDb = async (userId: string, productId: string) => {
    try {
        const savedItemId = `${userId}_${productId}`;
        await setDoc(doc(db, 'saved_items', savedItemId), {
            userId,
            productId,
            savedAt: new Date().toISOString()
        });
    } catch (e) {
        console.error("Add Saved Item Failed", e);
    }
};

export const removeSavedItemFromDb = async (userId: string, productId: string) => {
    try {
        const savedItemId = `${userId}_${productId}`;
        await deleteDoc(doc(db, 'saved_items', savedItemId));
    } catch (e) {
        console.error("Remove Saved Item Failed", e);
    }
};

export const fetchChatMessages = async (userId: string): Promise<ChatMessage[]> => {
    try {
        const q = query(collection(db, 'chat_messages'), where('userId', '==', userId), orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                sender: data.sender,
                text: data.text,
                timestamp: new Date(data.timestamp)
            } as ChatMessage;
        });
    } catch (e) {
        console.error("Error fetching chat messages:", e);
        return [];
    }
};

export const addChatMessageToDb = async (userId: string, message: ChatMessage) => {
    try {
        await setDoc(doc(db, 'chat_messages', message.id), {
            userId,
            sender: message.sender,
            text: message.text,
            timestamp: message.timestamp.toISOString()
        });
    } catch (e) {
        console.error("Add Chat Message Failed", e);
    }
};
