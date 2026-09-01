import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Helper function to draw rounded boxes
def draw_box(ax, x, y, width, height, text, bg_color="#1B365D", text_color="white", fontsize=10, fontweight="bold", boxstyle="round,pad=0.5"):
    p_box = patches.FancyBboxPatch(
        (x, y), width, height,
        boxstyle=boxstyle,
        facecolor=bg_color,
        edgecolor="#0D1B2A",
        linewidth=1.5,
        zorder=3
    )
    ax.add_patch(p_box)
    ax.text(
        x + width / 2.0, y + height / 2.0, text,
        color=text_color, fontsize=fontsize, fontweight=fontweight,
        ha="center", va="center", zorder=4, multialignment="center"
    )

def draw_arrow(ax, x1, y1, x2, y2, label="", color="#333333", linestyle="-", fontsize=8):
    ax.annotate(
        "", xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(arrowstyle="->", color=color, lw=1.8, ls=linestyle),
        zorder=2
    )
    if label:
        mx, my = (x1 + x2) / 2.0, (y1 + y2) / 2.0
        ax.text(mx, my + 0.15, label, fontsize=fontsize, color=color, fontweight="bold", ha="center", va="center", backgroundcolor="white", zorder=5)

# ---------------------------------------------------------
# 1. SYSTEM ARCHITECTURE DIAGRAM
# ---------------------------------------------------------
def create_system_architecture():
    fig, ax = plt.subplots(figsize=(12, 8), dpi=300)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)
    ax.axis("off")

    # Title
    plt.title("Sakhi Bazaar - System Architecture Diagram", fontsize=16, fontweight="bold", pad=20, color="#1B365D")

    # Tier Regions
    # Client Tier
    rect_client = patches.Rectangle((0.5, 5.5), 11.0, 2.0, facecolor="#EBF3FA", edgecolor="#2B547E", lw=1.5, ls="--")
    ax.add_patch(rect_client)
    ax.text(0.7, 7.2, "CLIENT TIER (React 19 / Tailwind CSS)", fontsize=11, fontweight="bold", color="#1B365D")

    draw_box(ax, 1.0, 5.8, 2.8, 1.1, "Buyer Storefront\n(Catalog Search, Cart, Chat)", bg_color="#2B547E")
    draw_box(ax, 4.6, 5.8, 2.8, 1.1, "Seller Dashboard\n(AI Copilot, Pricing Widget)", bg_color="#2B547E")
    draw_box(ax, 8.2, 5.8, 2.8, 1.1, "Admin Portal\n(Verification, Moderation)", bg_color="#2B547E")

    # Network / API Layer
    draw_arrow(ax, 2.4, 5.8, 2.4, 4.5, "HTTPS / REST")
    draw_arrow(ax, 6.0, 5.8, 6.0, 4.5, "REST / WebSockets (WSS)")
    draw_arrow(ax, 9.6, 5.8, 9.6, 4.5, "HTTPS / REST")

    # Backend Tier
    rect_backend = patches.Rectangle((0.5, 2.8), 11.0, 1.7, facecolor="#F5F5F5", edgecolor="#555555", lw=1.5, ls="-")
    ax.add_patch(rect_backend)
    ax.text(0.7, 4.2, "APPLICATION BACKEND TIER (Node.js / Express Server)", fontsize=11, fontweight="bold", color="#333333")

    draw_box(ax, 1.0, 3.1, 2.4, 0.9, "Auth Middleware\n(JWT & Firebase Admin)", bg_color="#4A6572")
    draw_box(ax, 3.7, 3.1, 2.4, 0.9, "Core REST API\n(Products, Orders, Users)", bg_color="#4A6572")
    draw_box(ax, 6.4, 3.1, 2.2, 0.9, "AI Controller\n(Gemini SDK Handler)", bg_color="#4A6572")
    draw_box(ax, 8.9, 3.1, 2.3, 0.9, "Socket.IO Gateway\n(Real-Time Engine)", bg_color="#4A6572")

    # Services / Database Tier
    draw_arrow(ax, 2.2, 3.1, 1.5, 1.7)
    draw_arrow(ax, 4.9, 3.1, 4.2, 1.7)
    draw_arrow(ax, 7.5, 3.1, 7.5, 1.7)
    draw_arrow(ax, 10.0, 3.1, 10.5, 1.7)

    rect_db = patches.Rectangle((0.5, 0.3), 11.0, 1.6, facecolor="#EFEBE9", edgecolor="#8D6E63", lw=1.5, ls="--")
    ax.add_patch(rect_db)
    ax.text(0.7, 1.6, "DATA & CLOUD SERVICES TIER", fontsize=11, fontweight="bold", color="#4E342E")

    draw_box(ax, 0.8, 0.5, 2.2, 0.9, "MongoDB Atlas\n(Product/User Schemas)", bg_color="#3E2723")
    draw_box(ax, 3.3, 0.5, 2.3, 0.9, "Google Gemini AI\n(LLM Copywriting)", bg_color="#0D47A1")
    draw_box(ax, 6.0, 0.5, 2.5, 0.9, "Cloudinary CDN\n(Image Storage & WebP)", bg_color="#006064")
    draw_box(ax, 8.8, 0.5, 2.4, 0.9, "Firebase Auth\n(Google SSO Identity)", bg_color="#E65100")

    plt.tight_layout()
    plt.savefig("system_architecture.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Generated system_architecture.png")

# ---------------------------------------------------------
# 2. USE CASE DIAGRAM
# ---------------------------------------------------------
def create_use_case_diagram():
    fig, ax = plt.subplots(figsize=(12, 8), dpi=300)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)
    ax.axis("off")

    plt.title("Sakhi Bazaar - Use Case Diagram", fontsize=16, fontweight="bold", pad=20, color="#1B365D")

    # System Boundary
    rect_sys = patches.Rectangle((3.0, 0.5), 6.0, 7.0, facecolor="#FAFAFA", edgecolor="#1B365D", lw=2)
    ax.add_patch(rect_sys)
    ax.text(6.0, 7.2, "SAKHI BAZAAR SYSTEM", fontsize=12, fontweight="bold", color="#1B365D", ha="center")

    # Actors
    # Buyer
    ax.text(1.2, 5.8, "BUYER\n(Customer)", fontsize=11, fontweight="bold", color="#1B365D", ha="center")
    # Draw stick figure head & body
    circle_b = patches.Circle((1.2, 6.6), 0.25, facecolor="#1B365D")
    ax.add_patch(circle_b)
    ax.plot([1.2, 1.2], [6.05, 6.35], color="#1B365D", lw=2)

    # Seller
    ax.text(1.2, 2.2, "SELLER\n(Women Entrepreneur)", fontsize=11, fontweight="bold", color="#006633", ha="center")
    circle_s = patches.Circle((1.2, 3.0), 0.25, facecolor="#006633")
    ax.add_patch(circle_s)
    ax.plot([1.2, 1.2], [2.45, 2.75], color="#006633", lw=2)

    # Admin
    ax.text(10.8, 4.0, "ADMINISTRATOR", fontsize=11, fontweight="bold", color="#CC0000", ha="center")
    circle_a = patches.Circle((10.8, 4.8), 0.25, facecolor="#CC0000")
    ax.add_patch(circle_a)
    ax.plot([10.8, 10.8], [4.25, 4.55], color="#CC0000", lw=2)

    # Use Cases (Ellipses)
    use_cases = [
        (6.0, 6.3, "Browse & Search Marketplace"),
        (6.0, 5.3, "View Category Pricing Transparency Widget"),
        (6.0, 4.3, "Real-Time Buyer-Seller Chat"),
        (6.0, 3.3, "Create Listing & Gemini AI Copywriter"),
        (6.0, 2.3, "View Market Price Analytics"),
        (6.0, 1.3, "Moderate Listings & Vet Sellers")
    ]

    for x, y, label in use_cases:
        ellipse = patches.Ellipse((x, y), 4.2, 0.7, facecolor="#EBF3FA", edgecolor="#2B547E", lw=1.5, zorder=3)
        ax.add_patch(ellipse)
        ax.text(x, y, label, fontsize=9, fontweight="bold", color="#1B365D", ha="center", va="center", zorder=4)

    # Connecting Lines
    # Buyer connections
    draw_arrow(ax, 1.5, 6.2, 3.9, 6.3, color="#1B365D")
    draw_arrow(ax, 1.5, 6.2, 3.9, 5.3, color="#1B365D")
    draw_arrow(ax, 1.5, 6.2, 3.9, 4.3, color="#1B365D")

    # Seller connections
    draw_arrow(ax, 1.5, 2.6, 3.9, 4.3, color="#006633")
    draw_arrow(ax, 1.5, 2.6, 3.9, 3.3, color="#006633")
    draw_arrow(ax, 1.5, 2.6, 3.9, 2.3, color="#006633")

    # Admin connection
    draw_arrow(ax, 10.1, 4.2, 8.1, 1.3, color="#CC0000")

    plt.tight_layout()
    plt.savefig("use_case_diagram.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Generated use_case_diagram.png")

# ---------------------------------------------------------
# 3. ACTIVITY DIAGRAM
# ---------------------------------------------------------
def create_activity_diagram():
    fig, ax = plt.subplots(figsize=(10, 9), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis("off")

    plt.title("Sakhi Bazaar - Product Listing Activity Diagram", fontsize=15, fontweight="bold", pad=15, color="#1B365D")

    # Initial State
    start_circle = patches.Circle((5.0, 9.3), 0.25, facecolor="#1B365D")
    ax.add_patch(start_circle)
    ax.text(5.0, 9.7, "Start", fontsize=10, fontweight="bold", ha="center")

    draw_arrow(ax, 5.0, 9.05, 5.0, 8.3)

    # Activity 1
    draw_box(ax, 3.2, 7.6, 3.6, 0.7, "Open Seller Dashboard\n& Click 'Add Product'", bg_color="#2B547E")
    draw_arrow(ax, 5.0, 7.6, 5.0, 6.85)

    # Activity 2
    draw_box(ax, 3.2, 6.15, 3.6, 0.7, "Enter Title, Category\n& Initial Base Price", bg_color="#2B547E")
    draw_arrow(ax, 5.0, 6.15, 5.0, 5.4)

    # Decision Diamond
    diamond = patches.Polygon([[5.0, 5.4], [6.0, 4.9], [5.0, 4.4], [4.0, 4.9]], facecolor="#FFF9C4", edgecolor="#FBC02D", lw=1.8, zorder=3)
    ax.add_patch(diamond)
    ax.text(5.0, 4.9, "Use AI Copilot?", fontsize=9, fontweight="bold", color="#333333", ha="center", va="center", zorder=4)

    # Branch YES (to left)
    draw_arrow(ax, 4.0, 4.9, 2.5, 4.9, "YES")
    draw_box(ax, 1.0, 3.5, 3.0, 0.9, "Invoke Gemini AI API\n(Generate Story Copy\n& Social Captions)", bg_color="#006633")
    draw_arrow(ax, 2.5, 3.5, 4.0, 2.6)

    # Branch NO (to right)
    draw_arrow(ax, 6.0, 4.9, 7.5, 4.9, "NO")
    draw_box(ax, 6.0, 3.5, 3.0, 0.9, "Enter Product Description\n& Tags Manually", bg_color="#795548")
    draw_arrow(ax, 7.5, 3.5, 6.0, 2.6)

    # Merge Activity
    draw_box(ax, 3.5, 2.0, 3.0, 0.7, "Upload Product Images\n(Cloudinary Transformation)", bg_color="#006064")
    draw_arrow(ax, 5.0, 2.0, 5.0, 1.3)

    # Save Activity
    draw_box(ax, 3.5, 0.7, 3.0, 0.6, "Save Listing to MongoDB\n& Publish to Store", bg_color="#1B365D")
    draw_arrow(ax, 5.0, 0.7, 5.0, 0.35)

    # Final State
    end_outer = patches.Circle((5.0, 0.2), 0.2, facecolor="white", edgecolor="#1B365D", lw=2)
    end_inner = patches.Circle((5.0, 0.2), 0.12, facecolor="#1B365D")
    ax.add_patch(end_outer)
    ax.add_patch(end_inner)
    ax.text(5.5, 0.2, "Published", fontsize=9, fontweight="bold", va="center")

    plt.tight_layout()
    plt.savefig("activity_diagram.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Generated activity_diagram.png")

# ---------------------------------------------------------
# 4. SEQUENCE DIAGRAM
# ---------------------------------------------------------
def create_sequence_diagram():
    fig, ax = plt.subplots(figsize=(11, 8), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 8)
    ax.axis("off")

    plt.title("Sakhi Bazaar - Sequence Diagram (AI Copy Generation & Chat)", fontsize=15, fontweight="bold", pad=15, color="#1B365D")

    # Lifelines (Actors / Components)
    lifelines = [
        (1.5, "Seller Client\n(React)"),
        (4.0, "Express Server\n(API Backend)"),
        (6.5, "Gemini AI\n(Google API)"),
        (9.0, "Socket.IO Gateway\n(Buyer Chat)")
    ]

    for x, label in lifelines:
        draw_box(ax, x - 0.9, 7.0, 1.8, 0.7, label, bg_color="#1B365D", fontsize=9)
        ax.plot([x, x], [0.8, 7.0], color="#888888", linestyle="--", lw=1.2, zorder=1)

    # Interaction Steps
    # Step 1: POST /api/ai/generate
    draw_arrow(ax, 1.5, 6.2, 4.0, 6.2, "1. POST /api/ai/generate-description", color="#2B547E")
    # Step 2: Call Gemini API
    draw_arrow(ax, 4.0, 5.5, 6.5, 5.5, "2. generateContent(prompt)", color="#006633")
    # Step 3: Return Generated Text
    draw_arrow(ax, 6.5, 4.8, 4.0, 4.8, "3. Return AI Description & Captions", color="#006633", linestyle="--")
    # Step 4: JSON Response to Client
    draw_arrow(ax, 4.0, 4.1, 1.5, 4.1, "4. 200 OK Response (JSON Copy)", color="#2B547E", linestyle="--")

    # Separator Line for Chat Interaction
    ax.plot([0.5, 10.5], [3.4, 3.4], color="#CCCCCC", linestyle="-", lw=1.0)
    ax.text(5.5, 3.5, "Real-Time WebSocket Chat Flow", fontsize=9, fontweight="bold", color="#CC0000", ha="center")

    # Step 5: Join Room
    draw_arrow(ax, 1.5, 2.8, 9.0, 2.8, "5. socket.emit('join_room', { convoId })", color="#CC0000")
    # Step 6: Send Message
    draw_arrow(ax, 1.5, 2.1, 9.0, 2.1, "6. socket.emit('send_message', payload)", color="#CC0000")
    # Step 7: Broadcast to Buyer
    draw_arrow(ax, 9.0, 1.4, 1.5, 1.4, "7. socket.to(room).emit('receive_message')", color="#CC0000", linestyle="--")

    plt.tight_layout()
    plt.savefig("sequence_diagram.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Generated sequence_diagram.png")

# ---------------------------------------------------------
# 5. CLASS DIAGRAM
# ---------------------------------------------------------
def create_class_diagram():
    fig, ax = plt.subplots(figsize=(12, 8), dpi=300)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)
    ax.axis("off")

    plt.title("Sakhi Bazaar - Core Database Class Diagram", fontsize=16, fontweight="bold", pad=15, color="#1B365D")

    # Class Boxes
    # User Class
    user_text = "User\n------------------\n+ _id: ObjectId\n+ name: String\n+ email: String\n+ passwordHash: String\n+ role: String\n+ isVerified: Boolean\n------------------\n+ register()\n+ login()"
    draw_box(ax, 0.5, 4.2, 3.0, 3.2, user_text, bg_color="#1B365D", fontsize=8.5, boxstyle="square,pad=0.4")

    # Product Class
    product_text = "Product\n------------------\n+ _id: ObjectId\n+ sellerId: ObjectId\n+ title: String\n+ price: Number\n+ category: String\n+ aiCaption: String\n------------------\n+ createProduct()\n+ updateProduct()"
    draw_box(ax, 4.5, 4.2, 3.0, 3.2, product_text, bg_color="#006633", fontsize=8.5, boxstyle="square,pad=0.4")

    # Category Class
    cat_text = "Category\n------------------\n+ _id: ObjectId\n+ name: String\n+ slug: String\n------------------\n+ getStats()"
    draw_box(ax, 8.5, 5.0, 3.0, 2.4, cat_text, bg_color="#795548", fontsize=8.5, boxstyle="square,pad=0.4")

    # Order Class
    order_text = "Order\n------------------\n+ _id: ObjectId\n+ buyerId: ObjectId\n+ totalAmount: Number\n+ status: String\n------------------\n+ processPayment()"
    draw_box(ax, 0.5, 0.5, 3.0, 2.8, order_text, bg_color="#4A6572", fontsize=8.5, boxstyle="square,pad=0.4")

    # Message Class
    msg_text = "Message\n------------------\n+ _id: ObjectId\n+ senderId: ObjectId\n+ text: String\n+ createdAt: Date\n------------------\n+ sendMessage()"
    draw_box(ax, 4.5, 0.5, 3.0, 2.8, msg_text, bg_color="#CC0000", fontsize=8.5, boxstyle="square,pad=0.4")

    # MarketPrice Class
    mp_text = "MarketPrice\n------------------\n+ category: String\n+ minPrice: Number\n+ maxPrice: Number\n+ avgPrice: Number\n------------------\n+ computeBenchmark()"
    draw_box(ax, 8.5, 0.5, 3.0, 2.8, mp_text, bg_color="#006064", fontsize=8.5, boxstyle="square,pad=0.4")

    # Relationships
    draw_arrow(ax, 3.5, 5.8, 4.5, 5.8, "1 .. * (owns)")
    draw_arrow(ax, 7.5, 6.2, 8.5, 6.2, "* .. 1")
    draw_arrow(ax, 2.0, 4.2, 2.0, 3.3, "1 .. * (places)")
    draw_arrow(ax, 3.5, 1.9, 4.5, 1.9, "1 .. *")
    draw_arrow(ax, 6.0, 4.2, 6.0, 3.3, "1 .. *")
    draw_arrow(ax, 7.5, 1.9, 8.5, 1.9, "aggregates")

    plt.tight_layout()
    plt.savefig("class_diagram.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Generated class_diagram.png")

# ---------------------------------------------------------
# 6. DFD DIAGRAM (Level 0 & Level 1)
# ---------------------------------------------------------
def create_dfd_diagram():
    fig, ax = plt.subplots(figsize=(12, 8), dpi=300)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)
    ax.axis("off")

    plt.title("Sakhi Bazaar - Data Flow Diagram (DFD Level 0 & Level 1)", fontsize=15, fontweight="bold", pad=15, color="#1B365D")

    # Level 0 Context Diagram (Top Box)
    ax.text(6.0, 7.4, "LEVEL 0: CONTEXT DIAGRAM", fontsize=11, fontweight="bold", color="#1B365D", ha="center")
    
    # External Entities
    draw_box(ax, 0.8, 6.2, 2.2, 0.8, "BUYER", bg_color="#1B365D")
    draw_box(ax, 9.0, 6.2, 2.2, 0.8, "SELLER", bg_color="#006633")

    # Central Process
    circle_p = patches.Circle((6.0, 6.6), 0.65, facecolor="#F5F5F5", edgecolor="#1B365D", lw=2)
    ax.add_patch(circle_p)
    ax.text(6.0, 6.6, "0.0\nSAKHI BAZAAR\nSYSTEM", fontsize=8.5, fontweight="bold", color="#1B365D", ha="center", va="center")

    draw_arrow(ax, 3.0, 6.6, 5.35, 6.6, "Queries/Orders")
    draw_arrow(ax, 9.0, 6.6, 6.65, 6.6, "Products/AI Copy")

    ax.plot([0.5, 11.5], [5.3, 5.3], color="#DDDDDD", linestyle="-", lw=1.2)

    # Level 1 DFD (Bottom Section)
    ax.text(6.0, 5.0, "LEVEL 1: DETAILED DATA FLOW", fontsize=11, fontweight="bold", color="#1B365D", ha="center")

    # Processes (Circles)
    p_nodes = [
        (2.0, 3.6, "1.0\nAuthentication"),
        (5.0, 3.6, "2.0\nProduct & AI\nCopywriter"),
        (8.0, 3.6, "3.0\nPrice\nBenchmarking"),
        (10.2, 2.0, "4.0\nSocket.IO\nMessaging")
    ]
    for x, y, label in p_nodes:
        c = patches.Circle((x, y), 0.6, facecolor="#EBF3FA", edgecolor="#2B547E", lw=1.5)
        ax.add_patch(c)
        ax.text(x, y, label, fontsize=8, fontweight="bold", color="#1B365D", ha="center", va="center")

    # Data Stores (Open Boxes)
    d_stores = [
        (2.0, 1.2, "D1: User DB"),
        (5.0, 1.2, "D2: Product DB"),
        (8.0, 1.2, "D3: Chat/Message DB")
    ]
    for x, y, label in d_stores:
        rect = patches.Rectangle((x - 1.0, y - 0.3), 2.0, 0.6, facecolor="#FFF9C4", edgecolor="#FBC02D", lw=1.5)
        ax.add_patch(rect)
        ax.text(x, y, label, fontsize=8.5, fontweight="bold", color="#333333", ha="center", va="center")

    # Data Flow Arrows
    draw_arrow(ax, 2.0, 3.0, 2.0, 1.5, "User Data")
    draw_arrow(ax, 5.0, 3.0, 5.0, 1.5, "Product Copy")
    draw_arrow(ax, 8.0, 3.0, 5.0, 1.5, "Category Query")
    draw_arrow(ax, 10.2, 1.4, 9.0, 1.2, "Log Chat")

    plt.tight_layout()
    plt.savefig("dfd_diagram.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Generated dfd_diagram.png")

# ---------------------------------------------------------
# 7. SYSTEM FLOWCHART
# ---------------------------------------------------------
def create_system_flowchart():
    fig, ax = plt.subplots(figsize=(9, 9), dpi=300)
    ax.set_xlim(0, 9)
    ax.set_ylim(0, 9)
    ax.axis("off")

    plt.title("Sakhi Bazaar - Overall System Flowchart", fontsize=15, fontweight="bold", pad=15, color="#1B365D")

    # Start
    ellipse_start = patches.Ellipse((4.5, 8.4), 2.0, 0.6, facecolor="#1B365D")
    ax.add_patch(ellipse_start)
    ax.text(4.5, 8.4, "START", fontsize=10, fontweight="bold", color="white", ha="center", va="center")

    draw_arrow(ax, 4.5, 8.1, 4.5, 7.4)

    # Input: Access Portal
    draw_box(ax, 3.0, 6.7, 3.0, 0.7, "Access Sakhi Bazaar\nWeb Portal", bg_color="#2B547E")
    draw_arrow(ax, 4.5, 6.7, 4.5, 6.0)

    # Decision: Authenticated?
    diamond = patches.Polygon([[4.5, 6.0], [5.7, 5.4], [4.5, 4.8], [3.3, 5.4]], facecolor="#FFF9C4", edgecolor="#FBC02D", lw=1.8, zorder=3)
    ax.add_patch(diamond)
    ax.text(4.5, 5.4, "Logged In?", fontsize=9, fontweight="bold", color="#333333", ha="center", va="center", zorder=4)

    # NO -> Guest Storefront
    draw_arrow(ax, 5.7, 5.4, 7.2, 5.4, "NO")
    draw_box(ax, 6.6, 3.6, 2.0, 0.8, "Guest Storefront\n(Browse & Search)", bg_color="#795548")
    draw_arrow(ax, 7.6, 3.6, 7.6, 1.2)

    # YES -> Check Role
    draw_arrow(ax, 4.5, 4.8, 4.5, 4.2, "YES")
    draw_box(ax, 3.0, 3.5, 3.0, 0.7, "Evaluate Role\n(Buyer / Seller / Admin)", bg_color="#4A6572")

    # Branching Roles
    draw_arrow(ax, 3.0, 3.85, 1.5, 2.7, "SELLER")
    draw_box(ax, 0.3, 1.8, 2.4, 0.9, "Seller Dashboard\n- AI Story Copilot\n- Price Analytics", bg_color="#006633")

    draw_arrow(ax, 4.5, 3.5, 4.5, 2.7, "BUYER")
    draw_box(ax, 3.3, 1.8, 2.4, 0.9, "Buyer Dashboard\n- Cart & Checkout\n- Socket.IO Chat", bg_color="#006064")

    draw_arrow(ax, 6.0, 3.85, 7.5, 2.7, "ADMIN")
    draw_box(ax, 6.3, 1.8, 2.4, 0.9, "Admin Portal\n- Seller Verification\n- Moderation", bg_color="#CC0000")

    # Merge to End
    draw_arrow(ax, 1.5, 1.8, 4.5, 0.8)
    draw_arrow(ax, 4.5, 1.8, 4.5, 0.8)
    draw_arrow(ax, 7.5, 1.8, 4.5, 0.8)

    ellipse_end = patches.Ellipse((4.5, 0.5), 1.8, 0.5, facecolor="#1B365D")
    ax.add_patch(ellipse_end)
    ax.text(4.5, 0.5, "END", fontsize=10, fontweight="bold", color="white", ha="center", va="center")

    plt.tight_layout()
    plt.savefig("system_flowchart.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Generated system_flowchart.png")

if __name__ == "__main__":
    create_system_architecture()
    create_use_case_diagram()
    create_activity_diagram()
    create_sequence_diagram()
    create_class_diagram()
    create_dfd_diagram()
    create_system_flowchart()
    print("All 7 system design diagrams generated successfully!")
