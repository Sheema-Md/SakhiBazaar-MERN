# Software Requirements Specification (SRS)
## Project: Sakhi Bazaar (AI-Enabled Marketplace for Women Entrepreneurs)

---

## 1. Project Overview & Scope

**Sakhi Bazaar** is an e-commerce platform designed to lower the barrier of entry for women-led micro-enterprises and independent female entrepreneurs. By combining intuitive web storefront interfaces with advanced Generative AI copywriting and real-time market pricing intelligence, the platform enables sellers to list products, create compelling marketing materials, and secure online sales with minimal technical background.

The project is built using the **MERN (MongoDB, Express.js, React, Node.js) stack**, featuring responsive frontend layouts designed with **Tailwind CSS**, cloud-hosted media management via **Cloudinary**, user authentication powered by **Firebase**, secure checkouts integrated with **Razorpay/Stripe**, and intelligent features run by the **Google Gemini API**.

---

## 2. User Roles & Access Control

The system supports three distinct user roles, each with specialized access permissions:

1. **Buyer (Customer):**
   * Can browse the public marketplace, search, and filter products.
   * Can view product details and copy AI-generated promotional captions.
   * Can add items to a shopping cart and check out securely using integrated payment gateways.
   * Can view order history and payment receipts.

2. **Seller (Women Entrepreneur):**
   * Can sign up for a dedicated Seller account.
   * Can access the **Seller Dashboard** to list, edit, and delete their own products.
   * Can use the **AI Description & Caption Generator** powered by Gemini to create listing copy.
   * Can see **Market Price Analysis** metrics to price items competitively.
   * Can monitor sales reports, revenues, and order fulfillment status.

3. **Administrator:**
   * Can log in to a dedicated admin portal.
   * Can monitor, approve, or reject new seller registrations.
   * Can flag, suspend, or delete inappropriate product listings.
   * Can view platform-wide metrics (total users, total transactions, total volume).

---

## 3. Functional Requirements & Implementation Status

### Module 1: Authentication & Onboarding
| Requirement ID | Description | Role | Status |
|---|---|---|---|
| **FR-1.1** | Email/Password Registration and Login | All | **Implemented** |
| **FR-1.2** | Federated Social Sign-in (Google Authentication via Firebase) | All | **Implemented** |
| **FR-1.3** | Role Assignment (`customer` vs. `seller` at signup) | All | **Implemented** |
| **FR-1.4** | JWT Generation & HTTPOnly Cookie Token Management | All | **Implemented** |
| **FR-1.5** | Seller profile completion (Store description, social links) | Seller | **Planned** |

### Module 2: Buyer Storefront & Browsing
| Requirement ID | Description | Role | Status |
|---|---|---|---|
| **FR-2.1** | Public landing page displaying recently added products | Buyer | **Implemented** |
| **FR-2.2** | Real-time text search (searches title and description) | Buyer | **Implemented** |
| **FR-2.3** | Category-based filters (e.g., Clothing, Handmade, Food) | Buyer | **Implemented** |
| **FR-2.4** | Detailed product view page with seller contact information | Buyer | **Implemented** |
| **FR-2.5** | Shopping cart (add, remove, adjust quantities) | Buyer | **Planned** |

### Module 3: Seller Product Management
| Requirement ID | Description | Role | Status |
|---|---|---|---|
| **FR-3.1** | List a new product (title, price, category, images) | Seller | **Implemented** |
| **FR-3.2** | Secure product image uploads to Cloudinary storage | Seller | **Implemented** |
| **FR-3.3** | Update existing product details and change images | Seller | **Implemented** |
| **FR-3.4** | Delete listed products (removes from marketplace) | Seller | **Implemented** |
| **FR-3.5** | Seller Dashboard listing only products created by logged-in seller | Seller | **Implemented** |

### Module 4: Generative AI Assistant (Gemini API)
| Requirement ID | Description | Role | Status |
|---|---|---|---|
| **FR-4.1** | **AI Description Generator:** Auto-write warm, storytelling product descriptions based on title, category, and keywords | Seller | **Implemented** |
| **FR-4.2** | **AI Caption Creator:** Create short, emoji-rich social media captions with tags for Instagram/WhatsApp/Facebook promotion | Seller | **Implemented** |
| **FR-4.3** | **One-click copy:** Copy generated descriptions and captions straight to clipboard with a single button | Seller | **Implemented** |

### Module 5: Market Price Awareness
| Requirement ID | Description | Role | Status |
|---|---|---|---|
| **FR-5.1** | **Local Platform Metrics:** Display min, max, and average prices of items in the same category on the seller's dashboard | Seller | **Planned** |
| **FR-5.2** | **AI Valuation Guide:** Prompt Gemini API to recommend a fair market value range based on item category and attributes during entry | Seller | **Planned** |
| **FR-5.3** | **Price Comparison Widget:** Show customers price ranges of similar products to establish transparency | Buyer | **Planned** |

### Module 6: Payment Gateway Integration
| Requirement ID | Description | Role | Status |
|---|---|---|---|
| **FR-6.1** | **Checkout System:** Initiate a purchase request from the buyer cart | Buyer | **Planned** |
| **FR-6.2** | **Stripe/Razorpay API Integration:** Process secure credit/debit card and UPI payments | Buyer | **Planned** |
| **FR-6.3** | **Webhook Handler:** Verify transaction receipts on the backend to prevent tampering | System | **Planned** |
| **FR-6.4** | **Payment Confirmation:** Generate digital receipts and update order status to paid | Buyer/Seller | **Planned** |

### Module 7: Administrative Portal
| Requirement ID | Description | Role | Status |
|---|---|---|---|
| **FR-7.1** | **Admin Role Access:** Create specialized Admin user account in DB schema | Admin | **Planned** |
| **FR-7.2** | **Vetting Dashboard:** Interface to view all sellers and approve business credentials | Admin | **Planned** |
| **FR-7.3** | **Product Moderation:** Remove flagged listings violating community guidelines | Admin | **Planned** |
| **FR-7.4** | **Platform Financial Metrics:** Track total commission and platform sales volume | Admin | **Planned** |

---

## 4. Technical Stack

| Layer | Component | Description |
|---|---|---|
| **Frontend** | React (v19) | Dynamic single-page client interface |
| **Styling** | Tailwind CSS (v4) | Utility-first responsive design framework |
| **Backend** | Node.js / Express | RESTful API server routing |
| **Database** | MongoDB / Mongoose | NoSQL database for flexible product metadata |
| **Auth** | Firebase Auth | Google SSO and email/password verification |
| **Media** | Cloudinary | Cloud-based image optimization and CDN |
| **AI** | Google Gemini SDK | Generative AI models for text and copy writing |
| **Payments** | Stripe or Razorpay | Secure merchant checkout SDKs |

---

## 5. Development Roadmap & Tracking Checklist

Use this checklist to track tasks and mark them complete as the application moves from MVP to production-ready:

### Phase 1: MERN Foundation & AI Integration (MVP)
* [x] Initialize backend Node/Express server and setup Mongoose connection.
* [x] Design initial MongoDB schemas for `User` and `Product`.
* [x] Implement JWT Authentication and password hashing via Bcrypt.
* [x] Design responsive public layout using Tailwind CSS.
* [x] Implement login, register, and seller dashboards on frontend.
* [x] Connect Cloudinary upload middleware to secure product images.
* [x] Program backend Gemini routes for Description and Caption Generation.
* [x] Integrate copy-to-clipboard elements for generated AI texts.

### Phase 2: Market Price Awareness & Payments (In-Progress)
* [ ] Create backend API endpoint `/api/products/stats/category` to fetch average, min, and max product prices.
* [ ] Render price benchmark statistics inside the `AddProduct` and `EditProduct` forms.
* [ ] Integrate payment gateway backend routes (`/api/payments/checkout`).
* [ ] Embed Stripe Elements or Razorpay Checkout Modal on the frontend checkout page.
* [ ] Program secure webhook endpoints on backend to listen for payment success confirmation.

### Phase 3: Administrative Control & Portal (Upcoming)
* [ ] Extend `User` DB schema to support `admin` role.
* [ ] Secure admin routes on backend with validation middleware (`isAdmin`).
* [ ] Construct Admin Dashboard React page to list all products and users.
* [ ] Add "Deactivate Account" and "Flag Product" moderation controls.
* [ ] Implement basic sales analytics graphs showing platform activity.
