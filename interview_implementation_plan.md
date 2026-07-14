# Implementation Plan: Technical Interview Mastery

This implementation plan outlines the study roadmap, code verification steps, and practice exercises to prepare for a technical review of the **Sakhi Bazaar** application.

---

## Goal Description
Master the architecture, endpoint structures, security patterns, data schemas, generative AI controllers, and responsive layout decisions of the Sakhi Bazaar monorepo to confidently discuss implementation details during reviews.

---

## Proposed Review Roadmap

### Component 1: Monorepo & File Configurations
Review the project layout to understand the monorepo architecture and component boundaries.

* [x] **Study Folder Layout:** Map backend controllers, models, and routes, and check how they interface with frontend Vite views.
* [ ] **Review Standalone Admin Structure:** Read the standalone administrative system under `admin/backend` and `admin/frontend`, noting how it interfaces with the same MongoDB database.

#### [MODIFY] [srs.md](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/srs.md)
* Review and compare implementation status mappings against the actual codebase features.

---

### Component 2: Cryptographic Security & Authentication Flows
Analyze the user credentials, registration constraints, Google social SSO, and OTP verification code.

* [ ] **Inspect User Registration Logic:** Trace format validations in [authController.js](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/backend/controllers/authController.js) (specifically phone verification at line 31 and Aadhaar verification at line 36).
* [ ] **Analyze Cryptographic Password Hash Hook:** Inspect how Bcrypt salting and hashing are automatically handled pre-save in [User.js](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/backend/models/User.js#L124-L131).
* [ ] **Study the JWT Bearer Flow:** Trace how the JWT payload is signed with the user ID, returned to the UI, and parsed from request headers inside the `protect` middleware in [authMiddleware.js](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/backend/middleware/authMiddleware.js#L4-L35).
* [ ] **Review OTP Lifecycle:** Walk through the generation of 6-digit numeric OTPs, database saves with 10-minute expiry windows, console logs, and reset verifications in [authController.js](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/backend/controllers/authController.js#L275-L367).

---

### Component 3: Database & Mongoose Entity Relationships
Review database models and schema relationships.

* [ ] **Study Core Entity Schemas:**
  * [User.js](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/backend/models/User.js) (Auth details, preferences, role-checking, OTP fields).
  * [Product.js](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/backend/models/Product.js) (Core listings, tags, pricing metrics, embedded reviews schema).
  * [Order.js](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/backend/models/Order.js) (Transaction history, items references, tracking, timeline checks).
* [ ] **Understand Embedded vs. Referenced Models:** Analyze why reviews are embedded within `Product.js` while messages are referenced in separate collections.

---

### Component 4: Generative AI Prompts & Retry Engine
Study how the system integrates with Google Gemini.

* [ ] **Review Prompt Constraints:** Trace custom copywriting rules and word counts (80-120 words for descriptions; under 50 words with `#SakhiBazaar` and `#WomenEntrepreneurs` hashtags for social captions) in [aiController.js](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/backend/controllers/aiController.js#L71-L82).
* [ ] **Analyze `callWithRetry` Fallback Mechanism:** Study how the system maps fallbacks between `gemini-2.5-flash`, `gemini-3.5-flash`, `gemini-2.0-flash-lite`, and `gemini-2.0-flash` with exponential backoffs to mitigate API rate limits (HTTP 429).

---

### Component 5: Market Price Analytics & Aggregation
Examine how pricing statistics are calculated.

* [ ] **Study local aggregations query:** Trace the `$match` and `$group` pipeline in [productController.js](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/backend/controllers/productController.js#L518-L529) that aggregates pricing statistics across listings in a category.
* [ ] **Analyze Commodity Price Seeds:** Inspect the mock database seeding functions in [marketController.js](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/backend/controllers/marketController.js#L4-L128) that load wholesale raw materials benchmarks (Pashmina wool, clay, honey) into MongoDB.

---

### Component 6: Enforcing Access Controls & Responsive Styles
Review route security and user experience design.

* [ ] **Verify Route Protection Chaining:** Walk through how access is restricted by chaining `protect` with `seller` or `admin` in [productRoutes.js](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/backend/routes/productRoutes.js#L31-L36) and [authRoutes.js](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/backend/routes/authRoutes.js#L37-L41).
* [ ] **Trace Mobile-First Responsive CSS:** Review layout wrappers and screen-size adapters (e.g., column wrapping, responsive padding, conditional visibility toggles) in [Navbar.jsx](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/frontend/src/components/Navbar.jsx#L20-L141).

---

## Verification Plan

### Technical Review Tasks
1. **Interactive Code Trace:**
   * Open the files listed in the roadmap to review variable structures and function inputs.
2. **Local Integration Verification:**
   * Test user flows (signup, product listing, AI generation, price aggregation, checkout) using your local development servers to verify end-to-end integration.
3. **Mock Q&A Practice:**
   * Answer the questions in [interview_questions.md](file:///c:/Users/moham/OneDrive/Desktop/SakhiBazaar_New/interview_questions.md) to check your familiarity with the technical implementation details.
