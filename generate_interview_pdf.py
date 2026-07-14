import sys
import os
from fpdf import FPDF

class InterviewPreparationPDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return  # No header on cover page
        
        # Header banner (Deep Berry #5A1846)
        self.set_fill_color(90, 24, 70)
        self.rect(0, 0, 210, 15, "F")
        
        self.set_y(4)
        self.set_text_color(255, 255, 255)
        self.set_font("helvetica", "B", 9)
        self.cell(0, 5, "SAKHI BAZAAR  |  TECHNICAL INTERVIEW PREPARATION GUIDE", align="C")
        self.ln(12)
        
    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.set_text_color(127, 127, 127)
        self.cell(0, 10, f"Page {self.page_no()} of {{nb}}", align="C")
        
        # Bottom decorative gold bar (#D4AF37)
        self.set_fill_color(212, 175, 55)
        self.rect(0, 292, 210, 5, "F")

def create_pdf():
    pdf = InterviewPreparationPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.alias_nb_pages()
    
    # Color definitions
    COLOR_PRIMARY = (90, 24, 70)       # Deep Berry
    COLOR_ACCENT = (212, 175, 55)      # Warm Gold
    COLOR_TEXT = (44, 62, 80)          # Charcoal
    COLOR_MUTED = (110, 110, 110)      # Gray
    COLOR_BG_LIGHT = (253, 251, 247)   # Cream background for cover page
    
    # ----------------------------------------------------
    # COVER PAGE
    # ----------------------------------------------------
    pdf.add_page()
    pdf.set_fill_color(*COLOR_BG_LIGHT)
    pdf.rect(0, 0, 210, 297, "F")
    
    # Left vertical colored bars
    pdf.set_fill_color(*COLOR_PRIMARY)
    pdf.rect(0, 0, 8, 297, "F")
    pdf.set_fill_color(*COLOR_ACCENT)
    pdf.rect(8, 0, 2, 297, "F")
    
    # Title
    pdf.set_y(60)
    pdf.set_font("helvetica", "B", 34)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(15)
    pdf.cell(0, 15, "Sakhi Bazaar", new_x="LMARGIN", new_y="NEXT")
    
    # Subtitle
    pdf.set_y(78)
    pdf.set_font("helvetica", "", 16)
    pdf.set_text_color(*COLOR_TEXT)
    pdf.cell(15)
    pdf.multi_cell(160, 8, "Technical Interview & Architecture Guide\nPreparing for Platform Review")
    
    # Gold Horizontal Separator
    pdf.set_y(102)
    pdf.set_fill_color(*COLOR_ACCENT)
    pdf.rect(35, 102, 70, 1.5, "F")
    
    # Context description
    pdf.set_y(120)
    pdf.cell(15)
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(0, 8, "Overview", new_x="LMARGIN", new_y="NEXT")
    
    pdf.cell(15)
    pdf.set_font("helvetica", "", 10.5)
    pdf.set_text_color(*COLOR_TEXT)
    overview_text = (
        "This preparation guide addresses the technical architecture, custom logic, "
        "and developmental frameworks implemented across the Sakhi Bazaar platform. "
        "It includes folder structures, authentication mechanisms, token-based verification flows, "
        "database entities, Gemini GenAI description workflows, local pricing aggregation pipelines, "
        "role-based authorization protocols, and production deployment schemes."
    )
    pdf.multi_cell(155, 6.5, overview_text)
    
    # Metadata block
    pdf.set_y(220)
    pdf.cell(15)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(40, 6, "Subject:")
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(*COLOR_TEXT)
    pdf.cell(0, 6, "Full-Stack System Interview", new_x="LMARGIN", new_y="NEXT")
    
    pdf.cell(15)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(40, 6, "Architecture:")
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(*COLOR_TEXT)
    pdf.cell(0, 6, "MERN (MongoDB, Express, React, Node.js)", new_x="LMARGIN", new_y="NEXT")
    
    pdf.cell(15)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(40, 6, "Date:")
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(*COLOR_TEXT)
    pdf.cell(0, 6, "July 2026", new_x="LMARGIN", new_y="NEXT")

    # ----------------------------------------------------
    # CONTENT PAGE GENERATION HELPER
    # ----------------------------------------------------
    def add_section(title, number, answer_text_blocks):
        pdf.add_page()
        
        # Section Header
        pdf.set_font("helvetica", "B", 14)
        pdf.set_text_color(*COLOR_PRIMARY)
        pdf.cell(0, 10, f"Q{number}: {title}", new_x="LMARGIN", new_y="NEXT")
        
        # Decorative divider under heading
        current_y = pdf.get_y()
        pdf.set_fill_color(*COLOR_ACCENT)
        pdf.rect(10, current_y, 190, 0.8, "F")
        pdf.ln(5)
        
        pdf.set_font("helvetica", "", 10)
        pdf.set_text_color(*COLOR_TEXT)
        
        for block in answer_text_blocks:
            if isinstance(block, tuple) and block[0] == "bullet":
                pdf.set_font("helvetica", "B", 10)
                pdf.cell(10, 6, "-") # standard ASCII bullet dash
                pdf.set_font("helvetica", "", 10)
                pdf.multi_cell(180, 6, block[1])
                pdf.ln(1)
            elif isinstance(block, tuple) and block[0] == "subheading":
                pdf.ln(2)
                pdf.set_font("helvetica", "B", 11)
                pdf.set_text_color(*COLOR_PRIMARY)
                pdf.cell(0, 6, block[1], new_x="LMARGIN", new_y="NEXT")
                pdf.set_font("helvetica", "", 10)
                pdf.set_text_color(*COLOR_TEXT)
                pdf.ln(1)
            elif isinstance(block, tuple) and block[0] == "code":
                # Draw light grey box for code block
                pdf.ln(1)
                pdf.set_fill_color(245, 245, 245)
                pdf.set_font("courier", "", 9.5)
                # Compute lines to print
                lines = block[1].strip().split('\n')
                for line in lines:
                    pdf.cell(0, 5, line, new_x="LMARGIN", new_y="NEXT", fill=True)
                pdf.set_font("helvetica", "", 10)
                pdf.ln(2)
            else:
                pdf.multi_cell(190, 6, block)
                pdf.ln(3)

    # Question 1
    add_section(
        "What is your folder structure?", 1,
        [
            "The project is structured as a monorepo containing distinct applications for the main marketplace and the administration portal:",
            ("subheading", "Key Workspaces"),
            ("bullet", "backend/ - Main Node.js/Express server defining database schemas (models), request control rules (controllers), middleware validators, routing files, and app start logic (server.js)."),
            ("bullet", "frontend/ - Main client storefront SPA designed using React 19, Tailwind CSS v4, and Vite. Includes UI views, custom state hook systems, and language/theme context hooks."),
            ("bullet", "admin/ - Standalone administrative system. Houses 'admin/backend' (Express API server mapping platform-level analytical metrics) and 'admin/frontend' (dashboard interface targeting platform vetting)."),
            ("subheading", "Directory Architecture:"),
            ("code", """SakhiBazaar_New/
|-- backend/
|   |-- config/             # DB & socket initializations
|   |-- controllers/        # Express handlers (Auth, Product, AI)
|   |-- models/             # MongoDB schemas
|   |-- routes/             # API routes definitions
|   |-- server.js           # Server startup script
|-- frontend/               # React / Tailwind Storefront
|   |-- src/components/     # UI elements (Navbar, Cards, Filters)
|   |-- src/pages/          # Main views (AddProduct, Cart, Chat)
|   |-- vite.config.js      # Vite compilation configurations
|-- admin/                  # Standalone Administration Area
|   |-- backend/            # Express admin server
|   |-- frontend/           # React admin panel client
|-- srs.md                  # Software Requirements Specs""")
        ]
    )

    # Question 2
    add_section(
        "How does authentication work?", 2,
        [
            "The platform implements standard credentials login and Google federated Single Sign-In (SSO) securely verified via backend token evaluation:",
            ("subheading", "1. Registration and Hash Storage"),
            ("bullet", "Sign Up (POST /api/auth/register) evaluates strict verification constraints. Phone numbers must contain exactly 10 numeric digits, and Aadhaar numbers must contain exactly 12 numeric digits."),
            ("bullet", "Passwords must satisfy strength validations (8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character)."),
            ("bullet", "Upon successful format validation, the plaintext password is cryptographically salted and hashed using bcryptjs. This hash occurs automatically inside the Mongoose pre-save middleware in User.js before being written to MongoDB."),
            ("subheading", "2. Authentication Actions"),
            ("bullet", "Credentials Login (POST /api/auth/login) checks whether the user enters a matching Email or Username, then verifies the password hash using bcryptjs."),
            ("bullet", "Google Social Authentication (POST /api/auth/google-login) takes Firebase authenticated token credentials. If the email doesn't exist, it registers a user profile automatically using a strong random password."),
            ("bullet", "OTP Resets (POST /api/auth/forgot-password) generates a 6-digit numeric verification OTP, registers it in MongoDB, and expires it in 10 minutes. Users reset the password securely after OTP confirmation."),
            ("subheading", "3. Authorization Middleware"),
            ("bullet", "After authentication, a JWT is signed with the user's ID. The client attaches this to the header of subsequent requests: Authorization: Bearer <token>. The protect middleware parses, decodes, and populates the user object on req.user.")
        ]
    )

    # Question 3
    add_section(
        "Which JWT flow do you use?", 3,
        [
            "The application utilizes a stateless, token-based Bearer Token flow handled through standard HTTP request headers:",
            ("subheading", "1. Generation Step"),
            ("bullet", "When a user logs in, registers, or authenticates via Google login, the server triggers generateToken(user._id)."),
            ("bullet", "This generates a JWT signed with a secret key (JWT_SECRET) with a 30-day expiration period, containing the user's MongoDB ID as the payload."),
            ("subheading", "2. Storage Step"),
            ("bullet", "The server sends the token as part of the JSON response payload. The client intercepts the response and persists the JWT in localStorage or in-memory React context state."),
            ("subheading", "3. Request and Validation Step"),
            ("bullet", "For all protected operations, the client appends the token to the HTTP request headers: Authorization: Bearer <token>."),
            ("bullet", "The server's protect middleware extracts this header, verifies the token's validity, and fetches the associated user from the database. Since sessions are stored in the token itself, the backend remains stateless and highly scalable.")
        ]
    )

    # Question 4
    add_section(
        "Which APIs have you created?", 4,
        [
            "The platform includes two API servers running concurrently to partition buyer/seller operations from admin moderation tasks:",
            ("subheading", "1. Main REST API Router (/api/ prefix)"),
            ("bullet", "Auth & Profiles (/api/auth) - Post register, login, google-login, logout, get/update user profile, change system preferences (theme, language), and trigger OTP forgot-password flows."),
            ("bullet", "Products Catalog (/api/products) - Create listings (Sellers only; handles uploads), edit details, delete items, list active products, search by keywords, filter attributes, and post product reviews."),
            ("bullet", "Generative AI Assist (/api/ai) - Generate storytelling product descriptions and WhatsApp/Instagram captions using Google Gemini API."),
            ("bullet", "Market Metrics (/api/market) - Pull commodity raw materials benchmarks and market trends statistics."),
            ("bullet", "Cart & Transactions (/api/cart, /api/orders, /api/payments) - Manage shopping cart items, record purchases, create payment intents (Stripe), and track shipment progress."),
            ("bullet", "Interactions (/api/chat, /api/wishlist, /api/bookmarks, /api/reviews) - Handles real-time messaging, wishlists, bookmarks, and user reviews."),
            ("subheading", "2. Standalone Admin REST API (/api/admin/ prefix)"),
            ("bullet", "Auth (POST /auth/register, /auth/login) - Admin credentials management."),
            ("bullet", "Seller & Listing Vetting - Approve/suspend seller profiles, flag inappropriate products, list transactions, and compile analytics (total users, listings, sales volume, platform commission).")
        ]
    )

    # Question 5
    add_section(
        "Which MongoDB collections do you have?", 5,
        [
            "The platform's database structure uses Mongoose schemas to represent the following collections:",
            ("bullet", "users: User records (name, email, password hash, role, approval status, preferences)."),
            ("bullet", "products: Listing details (title, category, price, images, SKU, stock quantity), seller reference, and embedded reviews schema."),
            ("bullet", "carts: Current shopping carts, containing product references, quantities, and saved items."),
            ("bullet", "categories: Standardized categories taxonomy (e.g. Clothing, Handmade, Food)."),
            ("bullet", "conversations: Messaging threads between buyer and seller accounts."),
            ("bullet", "messages: Chat logs containing message text, sender, and conversation link."),
            ("bullet", "notifications: User alerts for orders, chat messages, and portal approvals."),
            ("bullet", "orders: Purchase details, customer reference, items, pricing, and fulfillment state."),
            ("bullet", "payments: Auditing logs for Stripe/Razorpay transactions."),
            ("bullet", "shipments: Courier delivery updates, tracking codes, and recipient links."),
            ("bullet", "bookmarks: User bookmarked selections."),
            ("bullet", "marketprices: Seeded commodities pricing data (Pashmina wool, wild honey, clay)."),
            ("bullet", "markettrends: Category demand indicators and popular products lists.")
        ]
    )

    # Question 6
    add_section(
        "How exactly does Gemini generate descriptions?", 6,
        [
            "Generative AI descriptions are managed by the Express aiController backend using the Google Gemini SDK:",
            ("subheading", "1. Generation Triggers"),
            ("bullet", "Sellers request description generation by sending product title, category, and optional keywords to POST /api/ai/generate-description."),
            ("subheading", "2. Context and Prompting"),
            ("bullet", "The server builds a prompt specifying persona, context, and formatting rules:"),
            ("code", """You are an expert marketing copywriter for 'Sakhi Bazaar', an online marketplace
that empowers women entrepreneurs. Write a highly compelling, professional,
and warm product description for a product with the following details:
- Title: [Product Title]
- Category: [Category]
[Optional Keywords]

Rules:
1. Write in a warm, professional, storytelling style.
2. Keep the description between 80 to 120 words.
3. Return ONLY the plain text description itself. No intro, labels, or markdown."""),
            ("subheading", "3. Robustness and Model Fallbacks"),
            ("bullet", "The request runs through a retry utility callWithRetry that automatically switches between compatible fallback models (gemini-2.5-flash, gemini-3.5-flash, gemini-2.0-flash-lite, gemini-2.0-flash) in case of rate limits (HTTP 429). It uses exponential backoff to handle temporary service disruptions, returning the finalized text to the UI.")
        ]
    )

    # Question 7
    add_section(
        "How does market price analysis work?", 7,
        [
            "The platform computes and displays market pricing data on two layers to keep pricing transparent and competitive:",
            ("subheading", "1. Real-Time Platform Aggregations (Local Pricing)"),
            ("bullet", "The seller dashboard queries GET /api/products/stats/category?category=<category> to calculate price metrics based on active listings in that category."),
            ("bullet", "The backend runs a Mongoose aggregation pipeline:"),
            ("code", """const stats = await Product.aggregate([
  { $match: { category: { $regex: `^${category}$`, $options: 'i' }, status: 'active' } },
  {
    $group: {
      _id: '$category',
      avgPrice: { $avg: '$price' },
      minPrice: { $min: '$price' },
      maxPrice: { $max: '$price' },
      count: { $sum: 1 }
    }
  }
]);"""),
            ("bullet", "This returns the calculated average, minimum, and maximum prices, helping sellers price new items competitively."),
            ("subheading", "2. Commodity Benchmarks"),
            ("bullet", "The endpoints /api/market-prices and /api/market-trends return seeded data for raw materials (such as Pashmina Wool, Mulberry Silk Yarn, Terracotta Clay) to give sellers visibility into regional wholesale prices.")
        ]
    )

    # Question 8
    add_section(
        "How is role-based access implemented (Admin/Seller/Buyer)?", 8,
        [
            "Role-based access control (RBAC) is implemented across the database, routing middleware, and frontend views:",
            ("subheading", "1. Schema Definitions"),
            ("bullet", "The User model defines role ('customer', 'seller', 'admin') and status ('approved', 'pending', 'suspended') fields."),
            ("bullet", "Sellers register with a status of 'pending' and must be approved by an administrator before they can list products."),
            ("subheading", "2. Router Protection Middleware"),
            ("bullet", "Specific middlewares guard Express controllers on the backend:"),
            ("code", """// Verifies the user is logged in (populates req.user)
const protect = async (req, res, next) => { ... next(); };

// Restricts access to sellers only
const seller = (req, res, next) => {
  if (req.user && req.user.role === 'seller') { next(); }
  else { res.status(403).json({ message: 'Seller role required.' }); }
};"""),
            ("bullet", "Routes are guarded by chaining these middlewares (e.g. router.post('/', protect, seller, createProduct))."),
            ("subheading", "3. Frontend UI and Route Guards"),
            ("bullet", "React dashboards are customized by role (SellerDashboard, CustomerDashboard, AdminDashboard). Frontend routes are wrapped in a ProtectedRoute component that redirects users if their active role doesn't match the route permissions.")
        ]
    )

    # Question 9
    add_section(
        "How did you make the application responsive?", 9,
        [
            "The client application is styled with Tailwind CSS (v4), using utility classes and responsive breakpoints to adapt the layout to any screen size:",
            ("subheading", "1. Responsive Grids"),
            ("bullet", "Product listing grids scale dynamically based on screen width breakpoints: grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4. This renders 1 column on mobile, 2 on tablets, and 4 on desktop screens."),
            ("subheading", "2. Direction Scaling"),
            ("bullet", "Layout elements stack vertically on mobile screens and align horizontally on larger screens: flex flex-col md:flex-row."),
            ("subheading", "3. Fluid Paddings & Heights"),
            ("bullet", "Containers use mobile-first responsive padding classes (e.g. px-4 sm:px-6 lg:px-8) and set fluid heights to prevent content overflow on smaller devices."),
            ("subheading", "4. Conditional Visibility"),
            ("bullet", "Utility classes like hidden sm:flex or hidden lg:block hide non-essential elements on mobile screens and show them on desktop viewports, keeping the mobile interface clean.")
        ]
    )

    # Question 10
    add_section(
        "How would you deploy it?", 10,
        [
            "The application is designed for cloud-based deployment, separating static assets, backend APIs, and database hosting:",
            ("subheading", "1. Frontend SPA Deployment"),
            ("bullet", "Compile React assets using npm run build. Deploy the output 'dist/' folder to a CDN-backed hosting platform like Vercel, Netlify, or AWS S3 + CloudFront. Configure routing to redirect all subroutes to index.html to support React Router client-side routing."),
            ("subheading", "2. Backend Server Deployment"),
            ("bullet", "Deploy backend code to cloud application hosts like Render, Railway, AWS Elastic Beanstalk, or containerized within Google Cloud Run. Use PM2 on virtual machines for process monitoring, memory management, and automatic crash restarts."),
            ("subheading", "3. Database Hosting"),
            ("bullet", "Host database instances on MongoDB Atlas (managed database-as-a-service), using IP whitelisting to restrict access only to the backend server's IP address."),
            ("subheading", "4. Media & Cloud Services"),
            ("bullet", "Upload product images to Cloudinary (configured via backend middleware) to optimize images and serve them through their global CDN. Use production Google AI Studio keys for Gemini API requests."),
            ("subheading", "5. Environment Secrets and CI/CD"),
            ("bullet", "Store sensitive credentials (MONGO_URI, JWT_SECRET, GEMINI_API_KEY, etc.) securely as environment variables on the hosting platform. Set up a CI/CD pipeline using GitHub Actions to automate testing and deployment on push to the main branch.")
        ]
    )

    # Output file
    output_filename = "Sakhi_Bazaar_Interview_Preparation.pdf"
    pdf.output(output_filename)
    print(f"PDF generated successfully: {output_filename}")

if __name__ == "__main__":
    create_pdf()
