
import { Product, Vendor, Order, User, LandingPageContent, ContactSubmission, Follower, AppNotification, CartItem, ChatMessage, DirectMessage, Review } from '../types.ts';

const fetchApi = async (path: string, options?: RequestInit) => {
    try {
        const response = await fetch(`/api${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options?.headers || {}),
            },
        });
        
        if (!response.ok) {
            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    // Not valid JSON after all
                }
            } else {
                // Likely HTML or plain text
                try {
                    const text = await response.text();
                    console.error(`Non-JSON Error Response for [${path}]:`, text.substring(0, 200));
                    if (text.includes('<!doctype html>') || text.includes('<html>')) {
                        errorMessage = `Server returned HTML instead of JSON for ${path}. This usually means a 404 or a server error page.`;
                    }
                } catch (e) {
                    // Could not read text
                }
            }
            throw new Error(errorMessage);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error(`Expected JSON but got [${contentType}] for [${path}]:`, text.substring(0, 200));
            throw new Error(`Expected JSON response but got ${contentType || 'unknown'}`);
        }

        return response.json();
    } catch (error: any) {
        console.error(`Fetch API Error [${path}]:`, error);
        throw error;
    }
};

export const initSchema = () => fetchApi('/init-schema', { method: 'POST' });
export const seedDatabase = () => fetchApi('/seed-database', { method: 'POST' });

export const fetchVendors = (): Promise<Vendor[]> => fetchApi('/vendors');
export const fetchProducts = (): Promise<Product[]> => fetchApi('/products');
export const fetchOrders = (): Promise<Order[]> => fetchApi('/orders');
export const fetchUsers = (): Promise<User[]> => fetchApi('/users');

export const getUserByEmail = (email: string): Promise<User | null> => fetchApi(`/user-by-email?email=${encodeURIComponent(email)}`);
export const getVendorByEmail = (email: string): Promise<Vendor | null> => fetchApi(`/vendor-by-email?email=${encodeURIComponent(email)}`);

export const fetchVendorFollowerCount = (vendorId: string): Promise<number> => 
    fetchApi(`/vendor-follower-count/${vendorId}`).then(res => res.count);

export const fetchVendorFollowers = (vendorId: string): Promise<Follower[]> => fetchApi(`/vendor-followers/${vendorId}`);
export const fetchAllFollowers = (): Promise<Follower[]> => fetchApi('/all-followers');

export const fetchUserFollowedVendors = (userId: string): Promise<Vendor[]> => fetchApi(`/user-followed-vendors/${userId}`);

export const fetchNotifications = (userId?: string): Promise<AppNotification[]> => 
    fetchApi(`/notifications/${userId || 'all'}`);

export const fetchLandingContent = (): Promise<LandingPageContent> => fetchApi('/landing-content');
export const fetchContactSubmissions = (): Promise<ContactSubmission[]> => fetchApi('/contact-submissions');

export const addProductToDb = (product: Product) => fetchApi('/products', {
    method: 'POST',
    body: JSON.stringify(product)
});

export const updateProductInDb = (product: Product) => fetchApi(`/products/${product.id}`, {
    method: 'PUT',
    body: JSON.stringify(product)
});

export const deleteProductFromDb = (productId: string) => fetchApi(`/products/${productId}`, {
    method: 'DELETE'
});

export const updateVendorInDb = (vendor: Vendor) => fetchApi(`/vendors/${vendor.id}`, {
    method: 'PUT',
    body: JSON.stringify(vendor)
});

export const createVendorInDb = (vendor: Vendor) => fetchApi('/vendors', {
    method: 'POST',
    body: JSON.stringify(vendor)
});

export const deleteVendorFromDb = (vendorId: string) => fetchApi(`/vendors/${vendorId}`, {
    method: 'DELETE'
});

export const createUserInDb = (user: User) => fetchApi('/users', {
    method: 'POST',
    body: JSON.stringify(user)
});

export const updateUserInDb = (user: User) => fetchApi(`/users/${user.id}`, {
    method: 'PUT',
    body: JSON.stringify(user)
});

export const createOrderInDb = (order: Order) => fetchApi('/orders', {
    method: 'POST',
    body: JSON.stringify(order)
});

export const markNotificationRead = (notificationId: string) => fetchApi('/notifications/read', {
    method: 'POST',
    body: JSON.stringify({ notificationId })
});

export const submitContactFormInDb = (submission: ContactSubmission) => fetchApi('/contacts', {
    method: 'POST',
    body: JSON.stringify(submission)
});

export const joinWaitlistInDb = (entry: any) => fetchApi('/waitlist', {
    method: 'POST',
    body: JSON.stringify(entry)
});

export const fetchCartItems = (userId: string): Promise<CartItem[]> => fetchApi(`/cart/${userId}`);

export const addCartItemToDb = (userId: string, item: CartItem) => fetchApi('/cart', {
    method: 'POST',
    body: JSON.stringify({ userId, item })
});

export const updateCartItemInDb = (cartItemId: string, quantity: number, size: string) => fetchApi(`/cart/${cartItemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity, size })
});

export const removeCartItemFromDb = (cartItemId: string) => fetchApi(`/cart-item/${cartItemId}`, {
    method: 'DELETE'
});

export const clearCartInDb = (userId: string) => fetchApi(`/cart/${userId}`, {
    method: 'DELETE'
});

export const fetchSavedItems = (userId: string): Promise<Product[]> => fetchApi(`/saved/${userId}`);

export const addSavedItemToDb = (userId: string, productId: string) => fetchApi('/saved', {
    method: 'POST',
    body: JSON.stringify({ userId, productId })
});

export const removeSavedItemFromDb = (userId: string, productId: string) => fetchApi(`/saved/${userId}/${productId}`, {
    method: 'DELETE'
});

export const fetchChatMessages = (userId: string): Promise<ChatMessage[]> => fetchApi(`/chat/${userId}`);

export const addChatMessageToDb = (userId: string, message: ChatMessage) => fetchApi('/chat', {
    method: 'POST',
    body: JSON.stringify({ userId, message })
});

export const addFollowerToDb = (follower: Follower & { followerId: string }) => fetchApi('/follow', {
    method: 'POST',
    body: JSON.stringify({ follower })
});

export const removeFollowerFromDb = (followerId: string, vendorId: string) => fetchApi(`/follow/${followerId}/${vendorId}`, {
    method: 'DELETE'
});

export const voteForProduct = (productId: string, userId: string) => fetchApi('/vote', {
    method: 'POST',
    body: JSON.stringify({ productId, userId })
});

export const fetchUserVotes = (userId: string): Promise<string[]> => fetchApi(`/votes/${userId}`);

export const updateLandingContentInDb = (content: LandingPageContent) => fetchApi('/landing-content', {
    method: 'PUT',
    body: JSON.stringify(content)
});

export const updateOrderStatusInDb = (orderId: string, status: string) => fetchApi(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
});

export const updateContactStatusInDb = (id: string, status: string) => fetchApi(`/contacts/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
});

export const deleteUserFromDb = (userId: string) => fetchApi(`/users/${userId}`, {
    method: 'DELETE'
});

export const createNotificationInDb = (notif: AppNotification) => fetchApi('/notifications', {
    method: 'POST',
    body: JSON.stringify(notif)
});

// Direct Messaging API
export const fetchDirectMessages = (userId: string): Promise<DirectMessage[]> => fetchApi(`/direct-messages/${userId}`);

export const sendDirectMessage = (message: DirectMessage) => fetchApi('/direct-messages', {
    method: 'POST',
    body: JSON.stringify(message)
});

export const markDirectMessagesRead = (receiverId: string, senderId: string) => fetchApi('/direct-messages/read', {
    method: 'PUT',
    body: JSON.stringify({ receiverId, senderId })
});

// Reviews API
export const fetchProductReviews = (productId: string): Promise<Review[]> => fetchApi(`/reviews/${productId}`);

export const submitReview = (review: Review) => fetchApi('/reviews', {
    method: 'POST',
    body: JSON.stringify(review)
});

// Auth API
export const apiSignUp = (email: string, password: string) => fetchApi('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password })
});

export const apiSignIn = (email: string, password: string) => fetchApi('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password })
});

export const apiUpdatePassword = (email: string, newPassword: string) => fetchApi('/auth/update-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword })
});

// Analytics API
export const trackProductEvent = (productId: string, vendorId: string, type: 'VIEW' | 'SALE' | 'CART_ADD') => fetchApi('/analytics/track', {
    method: 'POST',
    body: JSON.stringify({ productId, vendorId, type })
});

export const fetchVendorAnalytics = (vendorId: string): Promise<any[]> => fetchApi(`/analytics/vendor/${vendorId}`);

export const fetchVendorShipments = (vendorId: string): Promise<any[]> => fetchApi(`/shipments/vendor/${vendorId}`);

export const createShipmentInDb = (shipment: any) => fetchApi('/shipments', {
    method: 'POST',
    body: JSON.stringify(shipment)
});

export const updateShipmentStatusInDb = (id: string, status: string) => fetchApi(`/shipments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
});
