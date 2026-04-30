# Sobi AutoParts API - Postman Routes and Sample Data

This file lists all backend routes and example request bodies you can use in Postman.

## 1) Base setup

- Base URL: http://localhost:5000
- Content-Type: application/json
- Auth header (protected routes): Authorization: Bearer <JWT_TOKEN>

Important:
- Only /api/auth is enabled by default. Buyer/Seller/Admin routes are commented out in Backend/src/index.js.
- To test those routes, uncomment them in Backend/src/index.js.

## 2) Optional seed data (for quick testing)

Run:
- npm run seed (from Backend/)

Seed users:
- buyer: zayan@example.com / buyer123
- seller: soban@example.com / seller123
- admin: admin@example.com / admin123

Note: seed.js requires MONGO_URI to be set (it does not use in-memory MongoDB).

## 3) Auth routes (enabled)

### POST /api/auth/register
Create a new user.

Request body:
```json
{
  "name": "Test Buyer",
  "email": "buyer1@example.com",
  "password": "buyer123",
  "role": "buyer"
}
```

### POST /api/auth/login
Login and get JWT.

Request body:
```json
{
  "email": "buyer1@example.com",
  "password": "buyer123"
}
```

### GET /api/auth/profile
Requires token.

Headers:
- Authorization: Bearer <JWT_TOKEN>

## 4) Buyer routes (enable in index.js)

### GET /api/buyer/products
Public. Returns live products.

### GET /api/buyer/products/:id
Public. Returns single product by id.

### POST /api/buyer/orders
Requires buyer token.

Request body:
```json
{
  "productId": "<PRODUCT_ID>",
  "method": "fixed",
  "amount": 4500
}
```

### GET /api/buyer/orders
Requires buyer token. Returns purchase history.

### POST /api/buyer/bids
Requires buyer token. Only for auction products.

Request body:
```json
{
  "productId": "<PRODUCT_ID>",
  "amount": 13000
}
```

### POST /api/buyer/offers
Requires buyer token. Only for bargain products.

Request body:
```json
{
  "productId": "<PRODUCT_ID>",
  "amount": 1900
}
```

## 5) Seller routes (enable in index.js)

### POST /api/seller/products
Requires seller token.

Request body (fixed price example):
```json
{
  "title": "Toyota Camry Headlight",
  "subtitle": "2018-2022 compatible",
  "description": "OEM headlight assembly for Toyota Camry. Left side.",
  "category": "Electrical",
  "condition": "New",
  "price": 4500,
  "type": "fixed"
}
```

Request body (auction example):
```json
{
  "title": "Honda Civic Alloy Rims",
  "subtitle": "Set of 4 - 16 inch",
  "description": "Good condition alloy rims, no cracks. Selling as set only.",
  "category": "Wheels & Tyres",
  "condition": "New",
  "price": 12800,
  "type": "auction",
  "startingPrice": 8000,
  "auctionEndTime": "2026-12-31T18:00:00.000Z"
}
```

Request body (bargain example):
```json
{
  "title": "Suzuki Alto Engine Cover",
  "subtitle": "OEM part - Used",
  "description": "Original engine cover for Suzuki Alto VXR/VXL.",
  "category": "Engine parts",
  "condition": "New",
  "price": 2200,
  "type": "bargain",
  "bargainMin": 1800,
  "bargainMax": 2200
}
```

### GET /api/seller/products
Requires seller token. Returns seller listings.

### PUT /api/seller/products/:id
Requires seller token. Update listing fields.

Request body:
```json
{
  "price": 5000,
  "status": "live"
}
```

### DELETE /api/seller/products/:id
Requires seller token. Deletes listing.

### GET /api/seller/orders
Requires seller token. Returns seller orders.

### POST /api/seller/handle-offer
Requires seller token. Accept or reject a bargain offer.

Request body:
```json
{
  "productId": "<PRODUCT_ID>",
  "offerId": "<OFFER_ID>",
  "action": "accepted"
}
```

## 6) Admin routes (enable in index.js)

### GET /api/admin/users
Requires admin token. List all users.

### PUT /api/admin/users/:id/status
Requires admin token.

Request body:
```json
{
  "isActive": false
}
```

### GET /api/admin/products
Requires admin token. List products (currently live only).

### PUT /api/admin/products/:id/approve
Requires admin token.

### PUT /api/admin/products/:id/reject
Requires admin token.

### GET /api/admin/orders
Requires admin token. List all orders.

### GET /api/admin/activities
Requires admin token. List activity feed.

## 7) Recommended Postman variables

Set these in your Postman environment:
- BASE_URL = http://localhost:5000
- BUYER_TOKEN = <token>
- SELLER_TOKEN = <token>
- ADMIN_TOKEN = <token>
- PRODUCT_ID = <id>
- OFFER_ID = <id>
- USER_ID = <id>

You can get PRODUCT_ID from GET /api/buyer/products or GET /api/seller/products.
You can get OFFER_ID from GET /api/buyer/products (bargain offers) or from the product document in MongoDB.
