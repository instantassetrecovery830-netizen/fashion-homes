import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, addDoc, orderBy } from 'firebase/firestore';
import { db } from './firebase.ts';
import { Product, Vendor, Order, User, LandingPageContent, ContactSubmission, Follower, AppNotification, CartItem, ChatMessage, DirectMessage, Review, UserRole } from '../types.ts';

// Helper to convert Firestore docs to array
const getArray = async (q: any) => {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) }));
};

export const fetchVendors = async (): Promise<Vendor[]> => getArray(collection(db, 'vendors')) as Promise<Vendor[]>;
export const fetchProducts = async (): Promise<Product[]> => getArray(collection(db, 'products')) as Promise<Product[]>;
export const fetchOrders = async (): Promise<Order[]> => getArray(collection(db, 'orders')) as Promise<Order[]>;
export const fetchUsers = async (): Promise<User[]> => getArray(collection(db, 'users')) as Promise<User[]>;

export const getUserByEmail = async (email: string): Promise<User | null> => {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const docs = await getArray(q);
    return docs.length > 0 ? docs[0] as User : null;
};

export const getVendorByEmail = async (email: string): Promise<Vendor | null> => {
    const q = query(collection(db, 'vendors'), where('email', '==', email));
    const docs = await getArray(q);
    return docs.length > 0 ? docs[0] as Vendor : null;
};

export const fetchVendorFollowerCount = async (vendorId: string): Promise<number> => {
    const q = query(collection(db, 'followers'), where('vendorId', '==', vendorId));
    const docs = await getArray(q);
    return docs.length;
};

export const fetchVendorFollowers = async (vendorId: string): Promise<Follower[]> => {
    const q = query(collection(db, 'followers'), where('vendorId', '==', vendorId));
    return getArray(q) as Promise<Follower[]>;
};

export const fetchAllFollowers = async (): Promise<Follower[]> => getArray(collection(db, 'followers')) as Promise<Follower[]>;

export const fetchUserFollowedVendors = async (userId: string): Promise<Vendor[]> => {
    const q = query(collection(db, 'followers'), where('userId', '==', userId));
    const follows = await getArray(q);
    const vendorIds = follows.map((f: any) => f.vendorId);
    if (vendorIds.length === 0) return [];
    
    const vendors: Vendor[] = [];
    for (const id of vendorIds) {
        const vDoc = await getDoc(doc(db, 'vendors', id));
        if (vDoc.exists()) vendors.push({ id: vDoc.id, ...vDoc.data() } as Vendor);
    }
    return vendors;
};

export const fetchNotifications = async (userId?: string): Promise<AppNotification[]> => {
    let q = collection(db, 'notifications');
    if (userId && userId !== 'all') {
        q = query(q, where('userId', '==', userId)) as any;
    }
    return getArray(q) as Promise<AppNotification[]>;
};

export const fetchLandingContent = async (): Promise<LandingPageContent> => {
    const d = await getDoc(doc(db, 'cms', 'main'));
    if (d.exists()) return d.data() as LandingPageContent;
    return { 
        hero: { videoUrl: '', posterUrl: '', subtitle: '', titleLine1: '', titleLine2: '', buttonText: '' },
        featuredDesigners: [],
        categories: [],
        curatedCollections: [],
        footer: { aboutText: '', links: [], social: [] }
    } as any;
};

export const fetchContactSubmissions = async (): Promise<ContactSubmission[]> => getArray(collection(db, 'contact_submissions')) as Promise<ContactSubmission[]>;

export const addProductToDb = async (product: Product) => setDoc(doc(db, 'products', product.id), cleanData(product));
export const updateProductInDb = async (product: Product) => updateDoc(doc(db, 'products', product.id), cleanData(product));
export const deleteProductFromDb = async (productId: string) => deleteDoc(doc(db, 'products', productId));

export const createVendorInDb = async (vendor: Vendor) => setDoc(doc(db, 'vendors', vendor.id), cleanData(vendor));
export const updateVendorInDb = async (vendor: Vendor) => updateDoc(doc(db, 'vendors', vendor.id), cleanData(vendor));
export const deleteVendorFromDb = async (vendorId: string) => deleteDoc(doc(db, 'vendors', vendorId));

export const createUserInDb = async (user: User) => setDoc(doc(db, 'users', user.id), cleanData(user));
export const updateUserInDb = async (user: User) => updateDoc(doc(db, 'users', user.id), cleanData(user));
export const deleteUserFromDb = async (userId: string) => deleteDoc(doc(db, 'users', userId));

const cleanData = (obj: any) => {
    // Handle null or non-objects
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => cleanData(item)).filter(item => item !== undefined);
    }

    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined) {
            cleaned[key] = cleanData(obj[key]);
        }
    });
    return cleaned;
};

export const createOrderInDb = async (order: Order) => setDoc(doc(db, 'orders', order.id), cleanData(order));

export const markNotificationRead = async (notificationId: string) => updateDoc(doc(db, 'notifications', notificationId), { read: true });

export const submitContactFormInDb = async (submission: ContactSubmission) => setDoc(doc(db, 'contact_submissions', submission.id), cleanData(submission));

export const joinWaitlistInDb = async (entry: any) => setDoc(doc(db, 'waitlist', entry.email), cleanData(entry));

export const fetchCartItems = async (userId: string): Promise<CartItem[]> => {
    const q = query(collection(db, 'cart_items'), where('userId', '==', userId));
    return getArray(q) as Promise<CartItem[]>;
};

export const addCartItemToDb = async (userId: string, item: CartItem) => {
    const id = `${userId}_${item.id}_${item.size || 'nosize'}`;
    await setDoc(doc(db, 'cart_items', id), cleanData({ ...item, userId, id }));
    return id;
};

export const updateCartItemInDb = async (cartItemId: string, quantity: number, size: string) => {
    await updateDoc(doc(db, 'cart_items', cartItemId), { quantity, size });
};

export const removeCartItemFromDb = async (cartItemId: string) => deleteDoc(doc(db, 'cart_items', cartItemId));

export const clearCartInDb = async (userId: string) => {
    const items = await fetchCartItems(userId);
    for (const item of items) {
        await deleteDoc(doc(db, 'cart_items', item.id));
    }
};

export const fetchSavedItems = async (userId: string): Promise<Product[]> => {
    const q = query(collection(db, 'saved_items'), where('userId', '==', userId));
    const saved = await getArray(q);
    const productIds = saved.map((s: any) => s.productId);
    if (productIds.length === 0) return [];
    
    const products: Product[] = [];
    for (const id of productIds) {
        const pDoc = await getDoc(doc(db, 'products', id));
        if (pDoc.exists()) products.push({ id: pDoc.id, ...pDoc.data() } as Product);
    }
    return products;
};

export const addSavedItemToDb = async (userId: string, productId: string) => {
    const id = `${userId}_${productId}`;
    await setDoc(doc(db, 'saved_items', id), cleanData({ userId, productId, id }));
};

export const removeSavedItemFromDb = async (userId: string, productId: string) => {
    const id = `${userId}_${productId}`;
    await deleteDoc(doc(db, 'saved_items', id));
};

export const fetchChatMessages = async (userId: string): Promise<ChatMessage[]> => {
    const q = query(collection(db, 'messages'), where('userId', '==', userId));
    return getArray(q) as Promise<ChatMessage[]>;
};

export const addChatMessageToDb = async (userId: string, message: ChatMessage) => {
    await setDoc(doc(db, 'messages', message.id), cleanData({ ...message, userId }));
};

export const fetchDirectMessages = async (userId1: string, userId2: string): Promise<DirectMessage[]> => {
    const q1 = query(collection(db, 'direct_messages'), where('senderId', '==', userId1), where('receiverId', '==', userId2));
    const q2 = query(collection(db, 'direct_messages'), where('senderId', '==', userId2), where('receiverId', '==', userId1));
    const [docs1, docs2] = await Promise.all([getArray(q1), getArray(q2)]);
    return [...docs1, ...docs2].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) as DirectMessage[];
};

export const sendDirectMessageToDb = async (message: DirectMessage) => {
    await setDoc(doc(db, 'direct_messages', message.id), cleanData(message));
};

export const markDirectMessageReadInDb = async (messageId: string) => {
    await updateDoc(doc(db, 'direct_messages', messageId), { read: true });
};

export const fetchReviews = async (productId: string): Promise<Review[]> => {
    const q = query(collection(db, 'reviews'), where('productId', '==', productId));
    return getArray(q) as Promise<Review[]>;
};

export const addReviewToDb = async (review: Review) => {
    await setDoc(doc(db, 'reviews', review.id), cleanData(review));
};

export const fetchUserVotes = async (userId: string): Promise<string[]> => {
    const q = query(collection(db, 'votes'), where('userId', '==', userId));
    const docs = await getArray(q);
    return docs.map((d: any) => d.productId);
};

export const addVoteToDb = async (userId: string, productId: string) => {
    const id = `${userId}_${productId}`;
    await setDoc(doc(db, 'votes', id), cleanData({ userId, productId, id }));
};

export const removeVoteFromDb = async (userId: string, productId: string) => {
    const id = `${userId}_${productId}`;
    await deleteDoc(doc(db, 'votes', id));
};

export const updateLandingContentInDb = async (content: LandingPageContent) => {
    await setDoc(doc(db, 'cms', 'main'), cleanData(content));
};

export const updateOrderStatusInDb = async (orderId: string, status: string) => updateDoc(doc(db, 'orders', orderId), { status });

export const createNotificationInDb = async (notification: AppNotification) => setDoc(doc(db, 'notifications', notification.id), cleanData(notification));

export const addFollowerToDb = async (follower: Follower) => setDoc(doc(db, 'followers', follower.id), cleanData(follower));

export const removeFollowerFromDb = async (followerId: string) => deleteDoc(doc(db, 'followers', followerId));

export const updateContactStatusInDb = async (id: string, status: string) => updateDoc(doc(db, 'contact_submissions', id), { status });

export const voteForProduct = async (userId: string, productId: string) => {
    const id = `${userId}_${productId}`;
    await setDoc(doc(db, 'votes', id), cleanData({ userId, productId, id }));
};

export const trackProductEvent = async (productId: string, eventType: string, userId?: string) => {
    // Optional implementation
};

export const fetchVendorAnalytics = async (vendorId: string) => {
    return [];
};

export const createShipmentInDb = async (shipment: any) => setDoc(doc(db, 'shipments', shipment.id), cleanData(shipment));

export const fetchVendorShipments = async (vendorId: string): Promise<any[]> => {
    const q = query(collection(db, 'shipments'), where('vendorId', '==', vendorId));
    return getArray(q);
};

export const updateShipmentStatusInDb = async (id: string, status: string) => updateDoc(doc(db, 'shipments', id), { status });

export const sendDirectMessage = async (message: DirectMessage) => setDoc(doc(db, 'direct_messages', message.id), cleanData(message));

export const markDirectMessagesRead = async (userId: string, senderId: string) => {
    const q = query(collection(db, 'direct_messages'), where('receiverId', '==', userId), where('senderId', '==', senderId), where('read', '==', false));
    const unread = await getArray(q);
    for (const msg of unread) {
        await updateDoc(doc(db, 'direct_messages', msg.id), { read: true });
    }
};

export const getShippingRates = async (addressTo: any, items: any[]) => {
    // Mock shipping rates
    return [
        { object_id: 'rate_1', provider: 'USPS', servicelevel: { name: 'Priority Mail' }, amount: '8.50', currency: 'USD', estimated_days: 3 },
        { object_id: 'rate_2', provider: 'FedEx', servicelevel: { name: 'Ground' }, amount: '12.00', currency: 'USD', estimated_days: 5 },
        { object_id: 'rate_3', provider: 'UPS', servicelevel: { name: 'Next Day Air' }, amount: '35.00', currency: 'USD', estimated_days: 1 }
    ];
};

export const fetchProductReviews = async (productId: string): Promise<Review[]> => {
    const q = query(collection(db, 'reviews'), where('productId', '==', productId));
    return getArray(q) as Promise<Review[]>;
};

export const submitReview = async (review: Review) => setDoc(doc(db, 'reviews', review.id), cleanData(review));

export const initSchema = async () => {};
export const seedDatabase = async () => {};

export const apiSignUp = async (email: string, name: string) => {
    const existing = await getUserByEmail(email);
    if (!existing) {
        const newUser: User = {
            id: email, // Or generate a UUID
            name: name || email.split('@')[0],
            email: email,
            role: UserRole.BUYER,
            joined: new Date().toISOString(),
            status: 'ACTIVE',
            avatar: ''
        };
        await createUserInDb(newUser);
    }
};
