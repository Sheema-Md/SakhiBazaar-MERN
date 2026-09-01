import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_card(ax, x, y, width, height, title, body_lines, header_bg="#1B365D", body_bg="#F0F4F8", border_color="#1B365D", fontsize=8.5):
    h_height = 0.5
    # Header
    rect_h = patches.FancyBboxPatch(
        (x, y + height - h_height), width, h_height,
        boxstyle="round,pad=0.05,rounding_size=0.08",
        facecolor=header_bg, edgecolor=border_color, linewidth=1.5, zorder=4
    )
    ax.add_patch(rect_h)
    ax.text(
        x + width / 2.0, y + height - (h_height / 2.0), title,
        color="white", fontsize=fontsize + 0.5, fontweight="bold", ha="center", va="center", zorder=5
    )

    # Body
    rect_b = patches.FancyBboxPatch(
        (x, y), width, height - h_height + 0.05,
        boxstyle="round,pad=0.05,rounding_size=0.08",
        facecolor=body_bg, edgecolor=border_color, linewidth=1.5, zorder=3
    )
    ax.add_patch(rect_b)

    curr_y = y + height - h_height - 0.22
    for line in body_lines:
        ax.text(x + 0.15, curr_y, line, color="#222222", fontsize=fontsize, va="center", zorder=5)
        curr_y -= 0.26

def draw_arrow(ax, x1, y1, x2, y2, label="", color="#2C3E50", linestyle="-", lw=2.0):
    ax.annotate(
        "", xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(arrowstyle="-|>", color=color, lw=lw, ls=linestyle, mutation_scale=14),
        zorder=2
    )
    if label:
        mx, my = (x1 + x2) / 2.0, (y1 + y2) / 2.0
        bbox_props = dict(boxstyle="round,pad=0.25", fc="#FFFFFF", ec=color, lw=1.2)
        ax.text(mx, my, label, fontsize=8, color=color, fontweight="bold", ha="center", va="center", bbox=bbox_props, zorder=6)

# ---------------------------------------------------------
# 1. ENHANCED SYSTEM ARCHITECTURE
# ---------------------------------------------------------
def create_system_architecture():
    fig, ax = plt.subplots(figsize=(14, 9.5), dpi=300)
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9.5)
    ax.axis("off")
    ax.add_patch(patches.Rectangle((0, 0), 14, 9.5, facecolor="#FAFCFF"))

    plt.title("Sakhi Bazaar - System Architecture Diagram", fontsize=16, fontweight="bold", pad=20, color="#1B365D")

    # Tier 1: Client Tier
    rect_client = patches.FancyBboxPatch((0.5, 6.4), 13.0, 2.4, boxstyle="round,pad=0.1", facecolor="#EBF5FB", edgecolor="#2980B9", lw=1.8, ls="--")
    ax.add_patch(rect_client)
    ax.text(0.8, 8.5, "CLIENT TIER (React 19 / Tailwind CSS v4)", fontsize=11, fontweight="bold", color="#1B365D")

    draw_card(ax, 0.8, 6.7, 3.8, 1.6, "Buyer Storefront", ["▪ Product Search & Filter", "▪ Shopping Cart Workflow", "▪ Real-Time Seller Chat"], header_bg="#1B365D", body_bg="#FFFFFF", border_color="#1B365D")
    draw_card(ax, 5.1, 6.7, 3.8, 1.6, "Seller Dashboard", ["▪ Product Listing Form", "▪ Gemini AI Story Copilot", "▪ Price Benchmark Widget"], header_bg="#006633", body_bg="#FFFFFF", border_color="#006633")
    draw_card(ax, 9.4, 6.7, 3.8, 1.6, "Admin Control Portal", ["▪ Seller Verification", "▪ Listing Moderation", "▪ Platform Analytics"], header_bg="#C0392B", body_bg="#FFFFFF", border_color="#C0392B")

    # Protocol Arrows
    draw_arrow(ax, 2.7, 6.7, 2.7, 5.2, "HTTPS / REST", color="#1B365D")
    draw_arrow(ax, 7.0, 6.7, 7.0, 5.2, "WSS / WebSockets", color="#006633")
    draw_arrow(ax, 11.3, 6.7, 11.3, 5.2, "HTTPS / REST", color="#C0392B")

    # Tier 2: Application Backend Tier
    rect_backend = patches.FancyBboxPatch((0.5, 3.4), 13.0, 1.8, boxstyle="round,pad=0.1", facecolor="#F4F6F6", edgecolor="#34495E", lw=1.8)
    ax.add_patch(rect_backend)
    ax.text(0.8, 4.9, "APPLICATION BACKEND TIER (Node.js / Express REST API)", fontsize=11, fontweight="bold", color="#2C3E50")

    draw_card(ax, 0.8, 3.6, 2.8, 1.1, "Auth Middleware", ["▪ JWT Verification", "▪ Role Checks"], header_bg="#34495E", body_bg="#FFFFFF", border_color="#34495E", fontsize=8)
    draw_card(ax, 3.9, 3.6, 3.0, 1.1, "Product Controller", ["▪ Catalog CRUD", "▪ MongoDB Aggregation"], header_bg="#34495E", body_bg="#FFFFFF", border_color="#34495E", fontsize=8)
    draw_card(ax, 7.2, 3.6, 3.0, 1.1, "Gemini AI Controller", ["▪ Prompt Engineering", "▪ Structured JSON Copy"], header_bg="#00838F", body_bg="#FFFFFF", border_color="#00838F", fontsize=8)
    draw_card(ax, 10.5, 3.6, 2.7, 1.1, "Socket.IO Gateway", ["▪ Room Connection", "▪ Live Message Broadcast"], header_bg="#C0392B", body_bg="#FFFFFF", border_color="#C0392B", fontsize=8)

    # Connecting Arrows to Cloud Tier
    draw_arrow(ax, 2.2, 3.6, 1.8, 2.2, color="#34495E")
    draw_arrow(ax, 5.4, 3.6, 5.2, 2.2, color="#34495E")
    draw_arrow(ax, 8.7, 3.6, 8.7, 2.2, color="#00838F")
    draw_arrow(ax, 11.8, 3.6, 12.0, 2.2, color="#E65100")

    # Tier 3: Data & Cloud Services Tier
    rect_cloud = patches.FancyBboxPatch((0.5, 0.4), 13.0, 1.8, boxstyle="round,pad=0.1", facecolor="#EFEBE9", edgecolor="#6D4C41", lw=1.8, ls="--")
    ax.add_patch(rect_cloud)
    ax.text(0.8, 1.9, "DATA & CLOUD SERVICES TIER", fontsize=11, fontweight="bold", color="#4E342E")

    draw_card(ax, 0.8, 0.6, 3.0, 1.1, "MongoDB Atlas", ["▪ User & Product DB", "▪ Message Logs"], header_bg="#4E342E", body_bg="#FFFFFF", border_color="#4E342E", fontsize=8)
    draw_card(ax, 4.1, 0.6, 3.0, 1.1, "Cloudinary CDN", ["▪ Photo Uploads", "▪ WebP Optimization"], header_bg="#006064", body_bg="#FFFFFF", border_color="#006064", fontsize=8)
    draw_card(ax, 7.4, 0.6, 3.0, 1.1, "Google Gemini AI", ["▪ Generative LLM SDK", "▪ Copy writing Engine"], header_bg="#1565C0", body_bg="#FFFFFF", border_color="#1565C0", fontsize=8)
    draw_card(ax, 10.7, 0.6, 2.5, 1.1, "Firebase Auth", ["▪ Google SSO", "▪ Token Identity"], header_bg="#E65100", body_bg="#FFFFFF", border_color="#E65100", fontsize=8)

    plt.tight_layout()
    plt.savefig("system_architecture.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Enhanced system_architecture.png generated!")

# ---------------------------------------------------------
# 2. ENHANCED USE CASE DIAGRAM
# ---------------------------------------------------------
def create_use_case_diagram():
    fig, ax = plt.subplots(figsize=(13, 9.5), dpi=300)
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 9.5)
    ax.axis("off")
    ax.add_patch(patches.Rectangle((0, 0), 13, 9.5, facecolor="#FAFCFF"))

    plt.title("Sakhi Bazaar - Use Case Diagram", fontsize=16, fontweight="bold", pad=20, color="#1B365D")

    # System Boundary Box
    rect_sys = patches.FancyBboxPatch((3.4, 0.5), 6.2, 8.2, boxstyle="round,pad=0.1", facecolor="#FFFFFF", edgecolor="#1B365D", lw=2.2)
    ax.add_patch(rect_sys)
    ax.text(6.5, 8.4, "SAKHI BAZAAR SYSTEM BOUNDARY", fontsize=12, fontweight="bold", color="#1B365D", ha="center")

    # Actors
    # Buyer Actor Box
    draw_card(ax, 0.4, 6.2, 2.4, 1.8, "BUYER (Customer)", ["▪ Browse Catalog", "▪ Filter & Search", "▪ Initiate Chat"], header_bg="#1B365D", body_bg="#EBF5FB", border_color="#1B365D", fontsize=8)

    # Seller Actor Box
    draw_card(ax, 0.4, 1.8, 2.4, 2.0, "SELLER (Entrepreneur)", ["▪ Create Listing", "▪ Use AI Copilot", "▪ View Pricing Widget", "▪ Reply Buyer Chat"], header_bg="#006633", body_bg="#E8F5E9", border_color="#006633", fontsize=8)

    # Admin Actor Box
    draw_card(ax, 10.2, 4.0, 2.4, 1.8, "ADMINISTRATOR", ["▪ Vet Seller Profile", "▪ Moderate Listings", "▪ Financial Analytics"], header_bg="#C0392B", body_bg="#FDEDEC", border_color="#C0392B", fontsize=8)

    # Use Cases (Ellipses)
    use_cases = [
        (6.5, 7.5, "UC-1: Browse & Search Products"),
        (6.5, 6.3, "UC-2: View Price Benchmark Transparency"),
        (6.5, 5.1, "UC-3: Real-Time Buyer-Seller Chat"),
        (6.5, 3.9, "UC-4: Create Listing with Gemini AI"),
        (6.5, 2.7, "UC-5: View Market Pricing Analytics"),
        (6.5, 1.3, "UC-6: Vet Sellers & Moderate Listings")
    ]

    for x, y, label in use_cases:
        ellipse = patches.Ellipse((x, y), 5.4, 0.85, facecolor="#F4F6F6", edgecolor="#2C3E50", lw=1.8, zorder=3)
        ax.add_patch(ellipse)
        ax.text(x, y, label, fontsize=9, fontweight="bold", color="#2C3E50", ha="center", va="center", zorder=4)

    # Connectors
    draw_arrow(ax, 2.8, 7.0, 3.8, 7.5, color="#1B365D")
    draw_arrow(ax, 2.8, 7.0, 3.8, 6.3, color="#1B365D")
    draw_arrow(ax, 2.8, 7.0, 3.8, 5.1, color="#1B365D")

    draw_arrow(ax, 2.8, 2.8, 3.8, 5.1, color="#006633")
    draw_arrow(ax, 2.8, 2.8, 3.8, 3.9, color="#006633")
    draw_arrow(ax, 2.8, 2.8, 3.8, 2.7, color="#006633")

    draw_arrow(ax, 10.2, 4.9, 9.2, 1.3, color="#C0392B")

    plt.tight_layout()
    plt.savefig("use_case_diagram.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Enhanced use_case_diagram.png generated!")

# ---------------------------------------------------------
# 3. ENHANCED ACTIVITY DIAGRAM
# ---------------------------------------------------------
def create_activity_diagram():
    fig, ax = plt.subplots(figsize=(11, 10), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 10)
    ax.axis("off")
    ax.add_patch(patches.Rectangle((0, 0), 11, 10, facecolor="#FAFCFF"))

    plt.title("Sakhi Bazaar - Product Listing Activity Diagram", fontsize=16, fontweight="bold", pad=15, color="#1B365D")

    # Start Node
    c_start = patches.Circle((5.5, 9.4), 0.22, facecolor="#1B365D", zorder=4)
    ax.add_patch(c_start)
    ax.text(5.5, 9.75, "Start Workflow", fontsize=9, fontweight="bold", color="#1B365D", ha="center")
    draw_arrow(ax, 5.5, 9.18, 5.5, 8.5)

    # Activity 1
    draw_card(ax, 3.5, 7.6, 4.0, 0.9, "1. Open Seller Dashboard", ["▪ Click 'Add New Product' Button"], header_bg="#1B365D", body_bg="#FFFFFF", border_color="#1B365D", fontsize=8)
    draw_arrow(ax, 5.5, 7.6, 5.5, 6.9)

    # Activity 2
    draw_card(ax, 3.5, 6.0, 4.0, 0.9, "2. Input Product Metadata", ["▪ Title, Category, Base Price (₹)"], header_bg="#1B365D", body_bg="#FFFFFF", border_color="#1B365D", fontsize=8)
    draw_arrow(ax, 5.5, 6.0, 5.5, 5.3)

    # Decision Diamond
    diamond = patches.Polygon([[5.5, 5.3], [6.8, 4.75], [5.5, 4.2], [4.2, 4.75]], facecolor="#FFFDE7", edgecolor="#B78103", lw=2.0, zorder=3)
    ax.add_patch(diamond)
    ax.text(5.5, 4.75, "Use Gemini AI\nCopilot?", fontsize=8.5, fontweight="bold", color="#B78103", ha="center", va="center", zorder=4)

    # YES Branch (Left)
    draw_arrow(ax, 4.2, 4.75, 2.5, 4.75, label="YES", color="#006633")
    draw_card(ax, 0.6, 3.3, 3.8, 1.1, "3A. Invoke Gemini LLM", ["▪ Auto-Generate Story Copy", "▪ Emoji Social Captions & Tags"], header_bg="#006633", body_bg="#E8F5E9", border_color="#006633", fontsize=8)
    draw_arrow(ax, 2.5, 3.3, 4.2, 2.3, color="#006633")

    # NO Branch (Right)
    draw_arrow(ax, 6.8, 4.75, 8.5, 4.75, label="NO", color="#795548")
    draw_card(ax, 6.6, 3.3, 3.8, 1.1, "3B. Enter Text Manually", ["▪ Type Story Description", "▪ Format Custom Tags"], header_bg="#795548", body_bg="#FFFDE7", border_color="#795548", fontsize=8)
    draw_arrow(ax, 8.5, 3.3, 6.8, 2.3, color="#795548")

    # Merge Activity
    draw_card(ax, 3.5, 1.5, 4.0, 0.9, "4. Upload Product Photos", ["▪ Cloudinary CDN WebP Conversion"], header_bg="#00838F", body_bg="#E0F7FA", border_color="#00838F", fontsize=8)
    draw_arrow(ax, 5.5, 1.5, 5.5, 0.8)

    # Final Save
    draw_card(ax, 3.5, 0.2, 4.0, 0.6, "5. Save to MongoDB", ["▪ Publish Listing to Marketplace"], header_bg="#1B365D", body_bg="#F0F4F8", border_color="#1B365D", fontsize=8)

    plt.tight_layout()
    plt.savefig("activity_diagram.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Enhanced activity_diagram.png generated!")

# ---------------------------------------------------------
# 4. ENHANCED SEQUENCE DIAGRAM
# ---------------------------------------------------------
def create_sequence_diagram():
    fig, ax = plt.subplots(figsize=(13, 9.5), dpi=300)
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 9.5)
    ax.axis("off")
    ax.add_patch(patches.Rectangle((0, 0), 13, 9.5, facecolor="#FAFCFF"))

    plt.title("Sakhi Bazaar - Sequence Diagram (AI Generation & WebSocket Chat)", fontsize=16, fontweight="bold", pad=20, color="#1B365D")

    # Lifelines
    lifelines = [
        (1.8, "Seller Client\n(React 19)", "#1B365D"),
        (5.0, "Express Server\n(API Gateway)", "#2C3E50"),
        (8.2, "Google Gemini AI\n(LLM API)", "#00838F"),
        (11.4, "Socket.IO Server\n(WebSocket)", "#C0392B")
    ]

    for x, label, color in lifelines:
        draw_card(ax, x - 1.2, 8.2, 2.4, 0.8, label, [], header_bg=color, body_bg="#FFFFFF", border_color=color, fontsize=8.5)
        ax.plot([x, x], [0.8, 8.2], color="#AAAAAA", linestyle="--", lw=1.5, zorder=1)

    # Sequence Messages
    # AI Copy Flow
    draw_arrow(ax, 1.8, 7.5, 5.0, 7.5, label="1. POST /api/ai/generate-description", color="#1B365D")
    draw_arrow(ax, 5.0, 6.7, 8.2, 6.7, label="2. generateContent(prompt)", color="#00838F")
    draw_arrow(ax, 8.2, 5.9, 5.0, 5.9, label="3. Return Story Copy & Captions (JSON)", color="#00838F", linestyle="--")
    draw_arrow(ax, 5.0, 5.1, 1.8, 5.1, label="4. 200 OK (Render on Dashboard)", color="#1B365D", linestyle="--")

    # Separator Line
    ax.plot([0.8, 12.2], [4.3, 4.3], color="#C0392B", linestyle="-", lw=1.5)
    ax.text(6.5, 4.45, "REAL-TIME SOCKET.IO CHAT SEQUENCE", fontsize=9.5, fontweight="bold", color="#C0392B", ha="center")

    # Chat Flow
    draw_arrow(ax, 1.8, 3.6, 11.4, 3.6, label="5. socket.emit('join_room', { convoId })", color="#C0392B")
    draw_arrow(ax, 1.8, 2.7, 11.4, 2.7, label="6. socket.emit('send_message', payload)", color="#C0392B")
    draw_arrow(ax, 11.4, 1.8, 5.0, 1.8, label="7. Save Message to MongoDB", color="#2C3E50")
    draw_arrow(ax, 11.4, 1.0, 1.8, 1.0, label="8. io.to(room).emit('receive_message')", color="#C0392B", linestyle="--")

    plt.tight_layout()
    plt.savefig("sequence_diagram.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Enhanced sequence_diagram.png generated!")

# ---------------------------------------------------------
# 5. ENHANCED CLASS DIAGRAM
# ---------------------------------------------------------
def create_class_diagram():
    fig, ax = plt.subplots(figsize=(14, 9.5), dpi=300)
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9.5)
    ax.axis("off")
    ax.add_patch(patches.Rectangle((0, 0), 14, 9.5, facecolor="#FAFCFF"))

    plt.title("Sakhi Bazaar - Core Class Diagram", fontsize=16, fontweight="bold", pad=20, color="#1B365D")

    # Class 1: User
    u_lines = ["[PK] _id : ObjectId", "▪ name : String", "▪ email : String", "▪ passwordHash : String", "▪ role : String", "▪ isVerified : Boolean", "-----------------------", "+ register()", "+ login()"]
    draw_card(ax, 0.6, 5.2, 3.6, 3.4, "User", u_lines, header_bg="#1B365D", body_bg="#F0F4F8", border_color="#1B365D")

    # Class 2: Product
    p_lines = ["[PK] _id : ObjectId", "[FK] seller : ObjectId", "▪ title : String", "▪ price : Number", "▪ category : String", "▪ aiCaption : String", "-----------------------", "+ createProduct()", "+ updateProduct()"]
    draw_card(ax, 5.2, 5.2, 3.6, 3.4, "Product", p_lines, header_bg="#006633", body_bg="#E8F5E9", border_color="#006633")

    # Class 3: Category
    c_lines = ["[PK] _id : ObjectId", "▪ name : String", "▪ slug : String", "-----------------------", "+ getStats()"]
    draw_card(ax, 9.8, 6.4, 3.6, 2.2, "Category", c_lines, header_bg="#B78103", body_bg="#FFFDE7", border_color="#B78103")

    # Class 4: Order
    o_lines = ["[PK] _id : ObjectId", "[FK] buyer : ObjectId", "▪ items : Array", "▪ totalAmount : Number", "▪ status : String", "-----------------------", "+ processCheckout()"]
    draw_card(ax, 0.6, 0.6, 3.6, 3.2, "Order", o_lines, header_bg="#2C3E50", body_bg="#EBF5FB", border_color="#2C3E50")

    # Class 5: Message
    m_lines = ["[PK] _id : ObjectId", "[FK] sender : ObjectId", "▪ text : String", "▪ read : Boolean", "▪ createdAt : Date", "-----------------------", "+ sendMessage()"]
    draw_card(ax, 5.2, 0.6, 3.6, 3.2, "Message", m_lines, header_bg="#C0392B", body_bg="#FDEDEC", border_color="#C0392B")

    # Class 6: MarketPrice
    mp_lines = ["[PK] _id : ObjectId", "▪ category : String", "▪ minPrice : Number", "▪ maxPrice : Number", "▪ avgPrice : Number", "-----------------------", "+ computeBenchmark()"]
    draw_card(ax, 9.8, 0.6, 3.6, 3.2, "MarketPrice", mp_lines, header_bg="#00838F", body_bg="#E0F7FA", border_color="#00838F")

    # Associations
    draw_arrow(ax, 4.2, 7.2, 5.2, 7.2, label="1 : N  (Owns)", color="#1B365D")
    draw_arrow(ax, 8.8, 7.2, 9.8, 7.2, label="N : 1", color="#B78103")
    draw_arrow(ax, 2.4, 5.2, 2.4, 3.8, label="1 : N  (Places)", color="#2C3E50")
    draw_arrow(ax, 4.2, 2.2, 5.2, 2.2, label="1 : N", color="#C0392B")
    draw_arrow(ax, 4.2, 6.0, 5.2, 3.0, label="N : M", color="#8E44AD")
    draw_arrow(ax, 8.8, 6.0, 9.8, 2.2, label="Aggregates", color="#00838F")

    plt.tight_layout()
    plt.savefig("class_diagram.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Enhanced class_diagram.png generated!")

# ---------------------------------------------------------
# 6. ENHANCED SYSTEM FLOWCHART
# ---------------------------------------------------------
def create_system_flowchart():
    fig, ax = plt.subplots(figsize=(11, 10), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 10)
    ax.axis("off")
    ax.add_patch(patches.Rectangle((0, 0), 11, 10, facecolor="#FAFCFF"))

    plt.title("Sakhi Bazaar - System Execution Flowchart", fontsize=16, fontweight="bold", pad=15, color="#1B365D")

    # Start
    e_start = patches.Ellipse((5.5, 9.3), 2.2, 0.6, facecolor="#1B365D", zorder=4)
    ax.add_patch(e_start)
    ax.text(5.5, 9.3, "START", fontsize=10, fontweight="bold", color="white", ha="center", va="center", zorder=5)
    draw_arrow(ax, 5.5, 9.0, 5.5, 8.3)

    # Process 1: Access Web App
    draw_card(ax, 3.5, 7.4, 4.0, 0.9, "1. Access Sakhi Bazaar", ["▪ Load React Storefront"], header_bg="#1B365D", body_bg="#FFFFFF", border_color="#1B365D", fontsize=8)
    draw_arrow(ax, 5.5, 7.4, 5.5, 6.7)

    # Decision 1: Logged in?
    d1 = patches.Polygon([[5.5, 6.7], [6.8, 6.15], [5.5, 5.6], [4.2, 6.15]], facecolor="#FFFDE7", edgecolor="#B78103", lw=2.0, zorder=3)
    ax.add_patch(d1)
    ax.text(5.5, 6.15, "User Logged In?", fontsize=8.5, fontweight="bold", color="#B78103", ha="center", va="center", zorder=4)

    # NO -> Guest Storefront
    draw_arrow(ax, 6.8, 6.15, 8.5, 6.15, label="NO", color="#795548")
    draw_card(ax, 7.5, 4.0, 3.0, 1.2, "Guest Public View", ["▪ Browse Marketplace", "▪ Search & Filter"], header_bg="#795548", body_bg="#FFFDE7", border_color="#795548", fontsize=8)

    # YES -> Evaluate Role
    draw_arrow(ax, 5.5, 5.6, 5.5, 4.8, label="YES", color="#006633")
    draw_card(ax, 3.5, 3.9, 4.0, 0.9, "2. Evaluate User Role", ["▪ Buyer vs. Seller vs. Admin"], header_bg="#006633", body_bg="#E8F5E9", border_color="#006633", fontsize=8)

    # Role Branches
    draw_arrow(ax, 3.5, 4.35, 1.8, 2.9, label="SELLER", color="#006633")
    draw_card(ax, 0.4, 1.7, 2.8, 1.2, "Seller Dashboard", ["▪ Add Product with AI", "▪ View Price Analytics"], header_bg="#006633", body_bg="#FFFFFF", border_color="#006633", fontsize=8)

    draw_arrow(ax, 5.5, 3.9, 5.5, 2.9, label="BUYER", color="#1B365D")
    draw_card(ax, 4.1, 1.7, 2.8, 1.2, "Buyer Storefront", ["▪ Add to Cart & Checkout", "▪ Real-Time Seller Chat"], header_bg="#1B365D", body_bg="#FFFFFF", border_color="#1B365D", fontsize=8)

    draw_arrow(ax, 7.5, 4.0, 9.2, 2.9, label="ADMIN", color="#C0392B")
    draw_card(ax, 7.8, 1.7, 2.8, 1.2, "Admin Portal", ["▪ Vet Seller Credentials", "▪ Moderate Listings"], header_bg="#C0392B", body_bg="#FFFFFF", border_color="#C0392B", fontsize=8)

    # End Node
    draw_arrow(ax, 1.8, 1.7, 5.5, 0.8)
    draw_arrow(ax, 5.5, 1.7, 5.5, 0.8)
    draw_arrow(ax, 9.2, 1.7, 5.5, 0.8)

    e_end = patches.Ellipse((5.5, 0.5), 2.0, 0.5, facecolor="#1B365D", zorder=4)
    ax.add_patch(e_end)
    ax.text(5.5, 0.5, "END", fontsize=10, fontweight="bold", color="white", ha="center", va="center", zorder=5)

    plt.tight_layout()
    plt.savefig("system_flowchart.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Enhanced system_flowchart.png generated!")

# ---------------------------------------------------------
# 7. ENHANCED DFD DIAGRAM
# ---------------------------------------------------------
def create_dfd_diagram():
    fig, ax = plt.subplots(figsize=(14, 9.5), dpi=300)
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9.5)
    ax.axis("off")
    ax.add_patch(patches.Rectangle((0, 0), 14, 9.5, facecolor="#FAFCFF"))

    plt.title("Sakhi Bazaar - Data Flow Diagram (DFD Level 0 & Level 1)", fontsize=16, fontweight="bold", pad=20, color="#1B365D")

    # Level 0 Context Diagram (Top Section)
    ax.text(7.0, 8.8, "LEVEL 0: CONTEXT DATA FLOW DIAGRAM", fontsize=11, fontweight="bold", color="#1B365D", ha="center")

    draw_card(ax, 0.6, 7.3, 2.6, 1.2, "BUYER", ["▪ Search & Order Data", "▪ Chat Messages"], header_bg="#1B365D", body_bg="#FFFFFF", border_color="#1B365D", fontsize=8)
    draw_card(ax, 10.8, 7.3, 2.6, 1.2, "SELLER", ["▪ Product Details", "▪ AI Copy Request"], header_bg="#006633", body_bg="#FFFFFF", border_color="#006633", fontsize=8)

    c_sys = patches.Circle((7.0, 7.9), 0.75, facecolor="#F0F4F8", edgecolor="#1B365D", lw=2.2, zorder=3)
    ax.add_patch(c_sys)
    ax.text(7.0, 7.9, "0.0\nSAKHI BAZAAR\nSYSTEM", fontsize=8.5, fontweight="bold", color="#1B365D", ha="center", va="center", zorder=4)

    draw_arrow(ax, 3.2, 7.9, 6.25, 7.9, label="Orders/Queries", color="#1B365D")
    draw_arrow(ax, 10.8, 7.9, 7.75, 7.9, label="Product/AI Copy", color="#006633")

    ax.plot([0.5, 13.5], [6.5, 6.5], color="#CCCCCC", linestyle="-", lw=1.5)

    # Level 1 DFD (Bottom Section)
    ax.text(7.0, 6.0, "LEVEL 1: DETAILED SYSTEM PROCESS FLOW", fontsize=11, fontweight="bold", color="#1B365D", ha="center")

    processes = [
        (2.0, 4.3, "1.0 Auth Process", "#34495E"),
        (5.3, 4.3, "2.0 Product & AI Copywriter", "#006633"),
        (8.7, 4.3, "3.0 Price Benchmarking", "#00838F"),
        (12.0, 4.3, "4.0 Socket.IO Messaging", "#C0392B")
    ]
    for x, y, label, col in processes:
        c_proc = patches.Circle((x, y), 0.7, facecolor="#FFFFFF", edgecolor=col, lw=2.0, zorder=3)
        ax.add_patch(c_proc)
        ax.text(x, y, label, fontsize=8, fontweight="bold", color=col, ha="center", va="center", zorder=4)

    stores = [
        (2.0, 1.4, "D1: User DB", "#34495E"),
        (5.3, 1.4, "D2: Product DB", "#006633"),
        (8.7, 1.4, "D3: Chat DB", "#C0392B")
    ]
    for x, y, label, col in stores:
        rect_store = patches.FancyBboxPatch((x - 1.2, y - 0.4), 2.4, 0.8, boxstyle="round,pad=0.05", facecolor="#FFFDE7", edgecolor=col, lw=1.8, zorder=3)
        ax.add_patch(rect_store)
        ax.text(x, y, label, fontsize=8.5, fontweight="bold", color=col, ha="center", va="center", zorder=4)

    draw_arrow(ax, 2.0, 3.6, 2.0, 2.2, label="User Data", color="#34495E")
    draw_arrow(ax, 5.3, 3.6, 5.3, 2.2, label="Catalog Copy", color="#006633")
    draw_arrow(ax, 8.7, 3.6, 5.3, 2.2, label="Pricing Query", color="#00838F")
    draw_arrow(ax, 12.0, 3.6, 8.7, 2.2, label="Chat Log", color="#C0392B")

    plt.tight_layout()
    plt.savefig("dfd_diagram.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Enhanced dfd_diagram.png generated!")

if __name__ == "__main__":
    create_system_architecture()
    create_use_case_diagram()
    create_activity_diagram()
    create_sequence_diagram()
    create_class_diagram()
    create_system_flowchart()
    create_dfd_diagram()
    print("All 7 system design diagrams successfully enhanced!")
