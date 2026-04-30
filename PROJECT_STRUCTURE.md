# Sobi AutoParts - Project Structure and Flow

This document explains every file and the end-to-end flows for both backend and frontend, based on the current code in this repository.

## 1. Top-level layout

- package.json
  - Root-level dependencies only (dotenv, mongodb-memory-server). No scripts are defined here.
- README.md
  - High-level product description, roles, and setup notes.
- Backend/
  - Node.js + Express API using Hexagonal Architecture.
- frontend/
  - React + Vite client using mock data.

## 2. Backend (Hexagonal Architecture)

### 2.1 Runtime entry and configuration

- Backend/package.json
  - Scripts:
    - start: node src/index.js
    - dev: nodemon src/index.js
    - seed: node src/seed.js
  - Key deps: express, mongoose, jsonwebtoken, cors, dotenv, mongodb-memory-server.

- Backend/src/index.js
  - Loads environment variables, connects to MongoDB via connectDB, and starts Express.
  - Enables CORS and JSON body parsing.
  - Registers routes:
    - /api/auth (active)
    - /api/buyer, /api/seller, /api/admin (present but commented out).
  - GET / returns a JSON health check message.
  - Attaches the global error handler last.

- Backend/src/config/db.js
  - Connects to MongoDB using MONGO_URI.
  - If MONGO_URI is missing, spins up an in-memory MongoDB via mongodb-memory-server and uses that URI.

### 2.2 Middleware

- Backend/src/adapters/middleware/authMiddleware.js
  - protect: validates Bearer token, decodes JWT, and attaches { id, name, email, role, initials } to req.user.
  - allowRoles: role gate for protected routes.

- Backend/src/adapters/middleware/errorHandler.js
  - Consistent JSON error response format.
  - Includes stack traces only when NODE_ENV=development.

### 2.3 HTTP layer (routes and controllers)

Routes are defined under Backend/src/adapters/http/routes and map to controllers.

- authRoutes.js (mounted at /api/auth)
  - POST /register -> authController.register
  - POST /login -> authController.login
  - GET /profile -> protect -> authController.getProfile

- buyerRoutes.js (mounted at /api/buyer, currently commented out in index.js)
  - GET /products -> buyerController.getProducts
  - GET /products/:id -> buyerController.getProduct
  - POST /orders -> protect + allowRoles('buyer') -> buyerController.placeOrder
  - GET /orders -> protect + allowRoles('buyer') -> buyerController.getOrders
  - POST /bids -> protect + allowRoles('buyer') -> buyerController.placeBid
  - POST /offers -> protect + allowRoles('buyer') -> buyerController.makeOffer

- sellerRoutes.js (mounted at /api/seller, currently commented out in index.js)
  - POST /products -> protect + allowRoles('seller') -> sellerController.createProduct
  - GET /products -> protect + allowRoles('seller') -> sellerController.getProducts
  - PUT /products/:id -> protect + allowRoles('seller') -> sellerController.updateProduct
  - DELETE /products/:id -> protect + allowRoles('seller') -> sellerController.deleteProduct
  - GET /orders -> protect + allowRoles('seller') -> sellerController.getOrders
  - POST /handle-offer -> protect + allowRoles('seller') -> sellerController.handleOffer

- adminRoutes.js (mounted at /api/admin, currently commented out in index.js)
  - GET /users -> protect + allowRoles('admin') -> adminController.getUsers
  - PUT /users/:id/status -> protect + allowRoles('admin') -> adminController.updateUserStatus
  - GET /products -> protect + allowRoles('admin') -> adminController.getProducts
  - PUT /products/:id/approve -> protect + allowRoles('admin') -> adminController.approveProduct
  - PUT /products/:id/reject -> protect + allowRoles('admin') -> adminController.rejectProduct
  - GET /orders -> protect + allowRoles('admin') -> adminController.getOrders
  - GET /activities -> protect + allowRoles('admin') -> adminController.getActivities

Controllers are thin and forward work to services:

- adminController.js
  - getUsers, updateUserStatus, getProducts, approveProduct, rejectProduct, getOrders, getActivities.
- authController.js
  - register, login, getProfile.
- buyerController.js
  - getProducts, getProduct, placeOrder, getOrders, placeBid, makeOffer.
- sellerController.js
  - createProduct, getProducts, updateProduct, deleteProduct, getOrders, handleOffer.

### 2.4 Application layer (services / use cases)

- activityService.js
  - log(text, type, referenceId) -> creates Activity model entries.
  - getAllActivities(limit=10) -> newest first.

- adminService.js
  - getAllUsers -> userRepository.findAll.
  - updateUserStatus -> userRepository.updateStatus.
  - getAllProducts -> productRepository.findAllLive (live products only).
  - approveProduct / rejectProduct -> productRepository.update status.
  - getAllOrders -> orderRepository.findAll.
  - getActivities -> activityService.getAllActivities.

- authService.js
  - register(userData):
    1) Build User domain entity.
    2) Check existing by email.
    3) Save via repository.
    4) Return JWT token payload (user) + token.
  - login(email, password):
    1) Find user by email.
    2) Validate password (plain-text comparison).
    3) Ensure not deactivated.
    4) Return JWT token payload (user) + token.
  - generateToken: JWT sign with JWT_SECRET or fallback 'secret'.

- buyerService.js
  - getAllProducts -> productRepository.findAllLive.
  - getProductById -> productRepository.findById with 404 if missing.
  - placeOrder:
    - Validate product and status.
    - Derive sellerId from populated or raw object.
    - Create Order domain entity.
    - Create order via repository.
    - Update product status to sold.
    - Log activity.
  - getOrderHistory -> orderRepository.findByBuyer.
  - placeBid:
    - Validate product and type=auction.
    - Enforce bid higher than currentBid or startingPrice.
    - Update product currentBid and push bid into bids[] array.
    - Log activity.
  - makeOffer:
    - Validate product and type=bargain.
    - Push offer into offers[] array.
    - Log activity.

- sellerService.js
  - addProduct: create Product domain entity -> repository.create -> log activity.
  - getMyProducts -> productRepository.findBySeller.
  - updateProduct:
    - Validate product exists.
    - Validate ownership via Product.isOwnedBy.
    - Update via repository.
  - deleteProduct:
    - Validate product exists and ownership.
    - Log activity.
    - Delete via repository.
  - getMyOrders -> orderRepository.findBySeller.
  - handleOffer:
    - Validate product exists and ownership.
    - Update embedded offer status with arrayFilters.
    - If accepted, create Order, set product status to sold, log activity.

### 2.5 Domain layer

- domain/User.js
  - Fields: id, name, email, password, role, initials, isActive, createdAt.
  - generateInitials() and isDeactivated().

- domain/Product.js
  - Fields for listing metadata, auction fields, and bargain fields.
  - isLive() and isOwnedBy(sellerId).

- domain/Order.js
  - Fields: buyerId, sellerId, productId, item, method, amount, status, createdAt.

- domain/Activity.js
  - Fields: text, type, referenceId, createdAt.

### 2.6 Ports (interfaces)

- ports/IUserRepository.js
- ports/IProductRepository.js
- ports/IOrderRepository.js

Each defines the method contract that adapters must implement.

### 2.7 Adapters (MongoDB)

Models:
- adapters/database/models/UserModel.js
  - Mongoose schema with role enum: buyer, seller, admin.
- adapters/database/models/ProductModel.js
  - Includes auction fields (startingPrice, currentBid, auctionEndTime, bids[]) and bargain fields (bargainMin, bargainMax, offers[]).
  - Condition enum values are New, Used \u2014 Good, Used \u2014 Fair.
- adapters/database/models/OrderModel.js
  - Stores buyerId, sellerId, productId, item, method, amount, status.
- adapters/database/models/ActivityModel.js
  - Activity type enum includes user_registration, auction_end, offer_accepted, new_listing, user_deactivation.

Repositories:
- adapters/database/repositories/MongoUserRepository.js
  - Implements IUserRepository.
  - Maps Mongoose docs to User domain entities.
- adapters/database/repositories/MongoProductRepository.js
  - Implements IProductRepository.
  - findAllLive, findById (populates seller), findBySeller, create, update, delete.
- adapters/database/repositories/MongoOrderRepository.js
  - Implements IOrderRepository.
  - findByBuyer, findBySeller, findAll (with population).

### 2.8 Seed script

- src/seed.js
  - Connects using MONGO_URI (no in-memory fallback here).
  - Clears User, Product, Order, Activity collections.
  - Inserts sample users (buyer, seller, admin).
  - Inserts sample products (auction, fixed, bargain).
  - Inserts a sample order and activity feed entries.

### 2.9 Backend flows (request lifecycle)

- Register flow:
  - POST /api/auth/register
  - authController.register -> authService.register -> MongoUserRepository.create -> JWT token returned.

- Login flow:
  - POST /api/auth/login
  - authController.login -> authService.login -> JWT token returned.

- Buyer purchase flow (when /api/buyer is enabled):
  - POST /api/buyer/orders
  - buyerController.placeOrder -> buyerService.placeOrder -> create Order -> update Product status -> log Activity.

- Buyer bidding flow:
  - POST /api/buyer/bids
  - buyerController.placeBid -> buyerService.placeBid -> update Product currentBid + bids[] -> log Activity.

- Buyer offer flow:
  - POST /api/buyer/offers
  - buyerController.makeOffer -> buyerService.makeOffer -> push into offers[] -> log Activity.

- Seller listing flow:
  - POST /api/seller/products
  - sellerController.createProduct -> sellerService.addProduct -> create Product -> log Activity.

- Seller offer handling flow:
  - POST /api/seller/handle-offer
  - sellerController.handleOffer -> sellerService.handleOffer -> update offer status -> if accepted, create Order and mark Product sold.

- Admin moderation flow:
  - /api/admin/users -> get all users or update status.
  - /api/admin/products -> approve or reject product status.
  - /api/admin/orders -> view all orders.
  - /api/admin/activities -> view activity feed.

## 3. Frontend (React + Vite)

### 3.1 Entry and app shell

- frontend/index.html
  - Base HTML with root div and title/meta tags.

- frontend/src/main.jsx
  - React entry point. Renders App inside StrictMode.

- frontend/src/App.jsx
  - Router setup with BrowserRouter.
  - Wraps app with AuthProvider and ToastProvider.
  - Always renders Navbar.
  - Defines routes:
    - / -> Home
    - /login -> Login
    - /register -> Register
    - /product/:id -> ProductDetail
    - /buyer/dashboard -> BuyerDashboard (ProtectedRoute: buyer)
    - /seller/dashboard -> SellerDashboard (ProtectedRoute: seller)
    - /seller/create-listing -> CreateListing (ProtectedRoute: seller)
    - /admin -> AdminPanel (ProtectedRoute: admin)
    - * -> redirect to /

### 3.2 Context providers

- src/context/AuthContext.jsx
  - Local in-memory auth state (no API calls).
  - login(email, password): finds user in demoUsers and sets state.
  - demoLogin(role): logs in predefined buyer/seller/admin.
  - register(name, email, password, role): creates a local user and logs in.
  - logout and updateProfile are local state updates.

- src/context/ToastContext.jsx
  - addToast(message, type, duration) pushes a toast and auto-removes after duration.
  - Renders a toast container at the end of the provider.

### 3.3 Shared UI components

- src/components/Navbar.jsx
  - Top navigation bar with search input, links based on role, and mobile drawer.
  - Uses useAuth for login state and role-based links.

- src/components/FilterBar.jsx
  - Simple filter pill buttons for product types plus placeholder category/price filters.

- src/components/ProductCard.jsx
  - Card that routes to /product/:id and displays price + badge.
  - Button label depends on product type.

- src/components/ProtectedRoute.jsx
  - Guards routes based on auth and role, redirects to the correct dashboard.

- src/components/TabBar.jsx
  - Generic tab selector used by dashboards.

### 3.4 Pages

- src/pages/Home.jsx
  - Uses products from mockData.
  - FilterBar controls a local type filter.
  - ProductCard grid shows filtered listings.
  - Hero CTA routes sellers to create listing (or login).

- src/pages/Login.jsx
  - Email/password login using AuthContext.
  - Demo login buttons for buyer/seller/admin.
  - Forgot password modal (UI only, no backend).

- src/pages/Register.jsx
  - Registration UI with role selector (buyer/seller).
  - Demo login buttons.

- src/pages/ProductDetail.jsx
  - Displays a single product from mockData by id.
  - Auction: place bid with minimum check.
  - Fixed: buy now (toast only).
  - Bargain: offer within range.

- src/pages/BuyerDashboard.jsx
  - Tabs: Purchases, My bids, My offers, Profile.
  - Uses purchases, buyerBids, buyerOffers from mockData.
  - Profile updates are local-only via AuthContext.updateProfile.

- src/pages/SellerDashboard.jsx
  - Tabs: My listings, Offer inbox, Auctions, Profile.
  - Uses sellerListings and sellerOffers from mockData.
  - Accept/reject offers updates local state only.

- src/pages/CreateListing.jsx
  - Listing creation form with fixed/auction/bargain modes.
  - Live preview card and a checklist UI.
  - Publish and draft actions are local (toast + navigation).

- src/pages/AdminPanel.jsx
  - Sidebar sections: Overview, Users, Listings, Auctions, Offers.
  - Uses adminStats, adminActivity, adminUsers, sellerListings from mockData.
  - User status toggles are local-only.

### 3.5 Mock data source

- src/data/mockData.js
  - demoUsers: buyer, seller, admin (used by AuthContext).
  - products: listing cards and ProductDetail data.
  - purchases, buyerBids, buyerOffers: buyer dashboard data.
  - sellerListings, sellerOffers: seller dashboard data.
  - adminStats, adminActivity, adminUsers: admin panel data.
  - categories: used by CreateListing.

### 3.6 Styling

- src/index.css
  - Global reset and design tokens (colors, shadows, radius, buttons, badges, forms, stat cards).

- Component styles:
  - src/components/FilterBar.css
  - src/components/Navbar.css
  - src/components/ProductCard.css
  - src/components/TabBar.css

- Page styles:
  - src/pages/AdminPanel.css
  - src/pages/Auth.css
  - src/pages/BuyerDashboard.jsx uses Dashboard.css
  - src/pages/CreateListing.css
  - src/pages/Dashboard.css (shared table and layout styles)
  - src/pages/Home.css
  - src/pages/ProductDetail.css

## 4. Frontend flows (UI lifecycle)

- App startup:
  - index.html -> main.jsx -> App -> AuthProvider + ToastProvider -> Navbar + Routes.

- Auth flow (client-only):
  - Login/Register pages call AuthContext actions.
  - ProtectedRoute checks AuthContext state and role before rendering pages.

- Buyer flow (client-only):
  - Home -> ProductDetail -> bid/buy/offer actions trigger toasts only.
  - BuyerDashboard renders mock purchases, bids, offers.

- Seller flow (client-only):
  - SellerDashboard renders mock listings and offers.
  - CreateListing lets user build a listing but does not send data to backend.

- Admin flow (client-only):
  - AdminPanel renders mock stats, users, and listings.
  - Actions only mutate local state and show toasts.

## 5. Integration status (important)

- Frontend does not call the backend API yet. It only uses mock data.
- Backend routes for buyer/seller/admin exist but are commented out in src/index.js.
- To enable full stack flows, you must:
  - Uncomment buyer/seller/admin route mounts in Backend/src/index.js.
  - Replace mockData usage with API calls in frontend pages and contexts.
