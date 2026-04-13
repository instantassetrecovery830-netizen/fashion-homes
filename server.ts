
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import cors from "cors";
import * as dataService from "./services/dataService.server.ts";
import { initSocket } from "./services/socketService.server.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Request logging
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Data Service API Routes
  app.post("/api/init-schema", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.initSchema();
    res.json({ success: true });
  }));

  app.post("/api/seed-database", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.seedDatabase();
    res.json({ success: true });
  }));

  app.get("/api/vendors", asyncHandler(async (req: express.Request, res: express.Response) => {
    const vendors = await dataService.fetchVendors();
    res.json(vendors);
  }));

  app.get("/api/products", asyncHandler(async (req: express.Request, res: express.Response) => {
    const products = await dataService.fetchProducts();
    res.json(products);
  }));

  app.get("/api/orders", asyncHandler(async (req: express.Request, res: express.Response) => {
    const orders = await dataService.fetchOrders();
    res.json(orders);
  }));

  app.get("/api/users", asyncHandler(async (req: express.Request, res: express.Response) => {
    const users = await dataService.fetchUsers();
    res.json(users);
  }));

  app.get("/api/user-by-email", asyncHandler(async (req: express.Request, res: express.Response) => {
    const { email } = req.query;
    const user = await dataService.getUserByEmail(email as string);
    res.json(user);
  }));

  app.get("/api/vendor-by-email", asyncHandler(async (req: express.Request, res: express.Response) => {
    const { email } = req.query;
    const vendor = await dataService.getVendorByEmail(email as string);
    res.json(vendor);
  }));

  app.get("/api/vendor-follower-count/:vendorId", asyncHandler(async (req: express.Request, res: express.Response) => {
    const { vendorId } = req.params;
    const count = await dataService.fetchVendorFollowerCount(vendorId as string);
    res.json({ count });
  }));

  app.get("/api/vendor-followers/:vendorId", asyncHandler(async (req: express.Request, res: express.Response) => {
    const { vendorId } = req.params;
    const followers = await dataService.fetchVendorFollowers(vendorId as string);
    res.json(followers);
  }));

  app.get("/api/all-followers", asyncHandler(async (req: express.Request, res: express.Response) => {
    const followers = await dataService.fetchAllFollowers();
    res.json(followers);
  }));

  app.get("/api/user-followed-vendors/:userId", asyncHandler(async (req: express.Request, res: express.Response) => {
    const { userId } = req.params;
    const vendors = await dataService.fetchUserFollowedVendors(userId as string);
    res.json(vendors);
  }));

  app.get("/api/notifications/:userId", asyncHandler(async (req: express.Request, res: express.Response) => {
    const { userId } = req.params;
    const notifications = await dataService.fetchNotifications((userId as string) === 'all' ? undefined : (userId as string));
    res.json(notifications);
  }));

  app.get("/api/landing-content", asyncHandler(async (req: express.Request, res: express.Response) => {
    const content = await dataService.fetchLandingContent();
    res.json(content);
  }));

  app.get("/api/contact-submissions", asyncHandler(async (req: express.Request, res: express.Response) => {
    const submissions = await dataService.fetchContactSubmissions();
    res.json(submissions);
  }));

  app.post("/api/products", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.addProductToDb(req.body);
    res.json({ success: true });
  }));

  app.put("/api/products/:id", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.updateProductInDb(req.body);
    res.json({ success: true });
  }));

  app.delete("/api/products/:id", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.deleteProductFromDb(req.params.id as string);
    res.json({ success: true });
  }));

  app.put("/api/vendors/:id", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.updateVendorInDb(req.body);
    res.json({ success: true });
  }));

  app.post("/api/vendors", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.createVendorInDb(req.body);
    res.json({ success: true });
  }));

  app.delete("/api/vendors/:id", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.deleteVendorFromDb(req.params.id as string);
    res.json({ success: true });
  }));

  app.post("/api/users", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.createUserInDb(req.body);
    res.json({ success: true });
  }));

  app.put("/api/users/:id", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.updateUserInDb(req.body);
    res.json({ success: true });
  }));

  app.post("/api/orders", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.createOrderInDb(req.body);
    res.json({ success: true });
  }));

  app.post("/api/contacts", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.submitContactFormInDb(req.body);
    res.json({ success: true });
  }));

  app.post("/api/waitlist", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.joinWaitlistInDb(req.body);
    res.json({ success: true });
  }));

  app.get("/api/cart/:userId", asyncHandler(async (req: express.Request, res: express.Response) => {
    const cart = await dataService.fetchCartItems(req.params.userId as string);
    res.json(cart);
  }));

  app.post("/api/cart", asyncHandler(async (req: express.Request, res: express.Response) => {
    const cartItemId = await dataService.addCartItemToDb(req.body.userId, req.body.item);
    res.json({ success: true, cartItemId });
  }));

  app.put("/api/cart/:cartItemId", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.updateCartItemInDb(req.params.cartItemId as string, req.body.quantity, req.body.size);
    res.json({ success: true });
  }));

  app.delete("/api/cart-item/:cartItemId", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.removeCartItemFromDb(req.params.cartItemId as string);
    res.json({ success: true });
  }));

  app.delete("/api/cart/:userId", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.clearCartInDb(req.params.userId as string);
    res.json({ success: true });
  }));

  app.get("/api/saved/:userId", asyncHandler(async (req: express.Request, res: express.Response) => {
    const saved = await dataService.fetchSavedItems(req.params.userId as string);
    res.json(saved);
  }));

  app.post("/api/saved", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.addSavedItemToDb(req.body.userId, req.body.productId);
    res.json({ success: true });
  }));

  app.delete("/api/saved/:userId/:productId", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.removeSavedItemFromDb(req.params.userId as string, req.params.productId as string);
    res.json({ success: true });
  }));

  app.get("/api/chat/:userId", asyncHandler(async (req: express.Request, res: express.Response) => {
    const messages = await dataService.fetchChatMessages(req.params.userId as string);
    res.json(messages);
  }));

  app.post("/api/chat", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.addChatMessageToDb(req.body.userId, req.body.message);
    res.json({ success: true });
  }));

  app.post("/api/follow", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.addFollowerToDb(req.body.follower);
    res.json({ success: true });
  }));

  app.delete("/api/follow/:followerId/:vendorId", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.removeFollowerFromDb(req.params.followerId as string, req.params.vendorId as string);
    res.json({ success: true });
  }));

  app.post("/api/vote", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.voteForProduct(req.body.productId, req.body.userId);
    res.json({ success: true });
  }));

  app.get("/api/votes/:userId", asyncHandler(async (req: express.Request, res: express.Response) => {
    const votes = await dataService.fetchUserVotes(req.params.userId as string);
    res.json(votes);
  }));

  app.put("/api/landing-content", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.updateLandingContentInDb(req.body);
    res.json({ success: true });
  }));

  app.put("/api/orders/:id/status", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.updateOrderStatusInDb(req.params.id as string, req.body.status);
    res.json({ success: true });
  }));

  app.put("/api/contacts/:id/status", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.updateContactStatusInDb(req.params.id as string, req.body.status);
    res.json({ success: true });
  }));

  app.delete("/api/users/:id", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.deleteUserFromDb(req.params.id as string);
    res.json({ success: true });
  }));

  app.post("/api/notifications", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.createNotificationInDb(req.body);
    res.json({ success: true });
  }));

  app.post("/api/notifications/read", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.markNotificationRead(req.body.notificationId);
    res.json({ success: true });
  }));

  // Direct Messaging Routes
  app.get("/api/direct-messages/:userId", asyncHandler(async (req: express.Request, res: express.Response) => {
    const messages = await dataService.fetchDirectMessages(req.params.userId as string);
    res.json(messages);
  }));

  app.post("/api/direct-messages", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.sendDirectMessage(req.body);
    res.json({ success: true });
  }));

  app.put("/api/direct-messages/read", asyncHandler(async (req: express.Request, res: express.Response) => {
    const { receiverId, senderId } = req.body;
    await dataService.markDirectMessagesRead(receiverId, senderId);
    res.json({ success: true });
  }));

  // Reviews Routes
  app.get("/api/reviews/:productId", asyncHandler(async (req: express.Request, res: express.Response) => {
    const reviews = await dataService.fetchProductReviews(req.params.productId as string);
    res.json(reviews);
  }));

  app.post("/api/reviews", asyncHandler(async (req: express.Request, res: express.Response) => {
    await dataService.addReviewToDb(req.body);
    res.json({ success: true });
  }));

  app.post("/api/shipping/rates", asyncHandler(async (req: express.Request, res: express.Response) => {
    const { addressTo, items } = req.body;
    const rates = await dataService.getShippingRates(addressTo, items);
    res.json(rates);
  }));

  // Auth Routes
  app.post("/api/auth/signup", asyncHandler(async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;
    const user = await dataService.signUp(email, password);
    res.json(user);
  }));

  app.post("/api/auth/signin", asyncHandler(async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;
    const user = await dataService.signIn(email, password);
    res.json(user);
  }));

  app.post("/api/auth/update-password", asyncHandler(async (req: express.Request, res: express.Response) => {
    const { email, newPassword } = req.body;
    const success = await dataService.updateAuthPassword(email, newPassword);
    res.json({ success });
  }));

  // Analytics Routes
  app.post("/api/analytics/track", asyncHandler(async (req: express.Request, res: express.Response) => {
    const { productId, vendorId, type } = req.body;
    await dataService.trackProductEvent(productId, vendorId, type);
    res.json({ success: true });
  }));

  app.get("/api/analytics/vendor/:vendorId", asyncHandler(async (req: express.Request, res: express.Response) => {
    const vendorId = req.params.vendorId as string;
    const analytics = await dataService.fetchVendorAnalytics(vendorId);
    res.json(analytics);
  }));

  app.get("/api/shipments/vendor/:vendorId", asyncHandler(async (req: express.Request, res: express.Response) => {
    const vendorId = req.params.vendorId as string;
    const shipments = await dataService.fetchVendorShipments(vendorId);
    res.json(shipments);
  }));

  app.post("/api/shipments", asyncHandler(async (req: express.Request, res: express.Response) => {
    const result = await dataService.createShipment(req.body);
    res.json(result);
  }));

  app.put("/api/shipments/:id/status", asyncHandler(async (req: express.Request, res: express.Response) => {
    const id = req.params.id as string;
    const { status } = req.body;
    const result = await dataService.updateShipmentStatus(id, status);
    res.json(result);
  }));

  // API 404 Handler
  app.use("/api", (req, res) => {
    console.warn(`API 404: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: `API Route not found: ${req.method} ${req.originalUrl}` });
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`ERROR at ${req.method} ${req.url}:`, err);
    
    // If it's an API request, return JSON
    if (req.url.startsWith('/api')) {
      return res.status(err.status || 500).json({ 
        error: err.message || "Internal Server Error",
        path: req.url
      });
    }
    
    // Otherwise, let it fall through or handle as needed
    next(err);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Initialize Schema and Seed on Start
  console.log("Starting database bootstrap...");
  dataService.initSchema()
    .then(() => {
        console.log("Schema initialized. Starting seed...");
        return dataService.seedDatabase();
    })
    .then(() => console.log("Database bootstrap completed successfully."))
    .catch(err => {
        console.error("CRITICAL: Database bootstrap failed!");
        console.error(err);
    });

  const server = http.createServer(app);
  initSocket(server);

  console.log(`Attempting to start server on port ${PORT}...`);
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`SUCCESS: Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
    console.error("FATAL: Server failed to start!");
    console.error(err);
});
