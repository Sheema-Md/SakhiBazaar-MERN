import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_box(ax, x, y, width, height, text, bg_color="#1B365D", text_color="white", fontsize=9, fontweight="normal", align="center", boxstyle="round,pad=0.3", edgecolor="#0D1B2A"):
    p_box = patches.FancyBboxPatch(
        (x, y), width, height,
        boxstyle=boxstyle,
        facecolor=bg_color,
        edgecolor=edgecolor,
        linewidth=1.2,
        zorder=3
    )
    ax.add_patch(p_box)
    tx = x + width / 2.0 if align == "center" else x + 0.2
    ty = y + height / 2.0 if align == "center" else y + height - 0.3
    ha = "center" if align == "center" else "left"
    va = "center" if align == "center" else "top"
    ax.text(
        tx, ty, text,
        color=text_color, fontsize=fontsize, fontweight=fontweight,
        ha=ha, va=va, zorder=4, multialignment=ha
    )

def draw_arrow(ax, x1, y1, x2, y2, label="", color="#333333", linestyle="-", fontsize=8):
    ax.annotate(
        "", xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(arrowstyle="->", color=color, lw=1.5, ls=linestyle),
        zorder=2
    )
    if label:
        mx, my = (x1 + x2) / 2.0, (y1 + y2) / 2.0
        ax.text(mx, my + 0.12, label, fontsize=fontsize, color=color, fontweight="bold", ha="center", va="center", backgroundcolor="white", zorder=5)

# ---------------------------------------------------------
# 1. DATABASE ER DIAGRAM
# ---------------------------------------------------------
def create_database_er_diagram():
    fig, ax = plt.subplots(figsize=(13, 9), dpi=300)
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 9)
    ax.axis("off")

    plt.title("Sakhi Bazaar - Database ER Diagram (Entity-Relationship)", fontsize=16, fontweight="bold", pad=20, color="#1B365D")

    # USER Table
    u_text = "USER (Collection)\n----------------------\n* _id: ObjectId (PK)\n  name: String\n  email: String [Unique]\n  passwordHash: String\n  role: String ('seller'|'buyer')\n  storeName: String\n  isVerified: Boolean\n  createdAt: Date"
    draw_box(ax, 0.5, 5.0, 3.4, 3.4, u_text, bg_color="#1B365D", fontsize=8.5, align="left", boxstyle="square,pad=0.4")

    # PRODUCT Table
    p_text = "PRODUCT (Collection)\n----------------------\n* _id: ObjectId (PK)\n  seller: ObjectId (FK -> User)\n  title: String\n  description: String\n  price: Number\n  category: String\n  images: Array[String]\n  aiCaption: String\n  stock: Number"
    draw_box(ax, 4.8, 5.0, 3.4, 3.4, p_text, bg_color="#006633", fontsize=8.5, align="left", boxstyle="square,pad=0.4")

    # CATEGORY Table
    c_text = "CATEGORY (Collection)\n----------------------\n* _id: ObjectId (PK)\n  name: String [Unique]\n  slug: String\n  description: String"
    draw_box(ax, 9.1, 6.2, 3.4, 2.2, c_text, bg_color="#795548", fontsize=8.5, align="left", boxstyle="square,pad=0.4")

    # ORDER Table
    o_text = "ORDER (Collection)\n----------------------\n* _id: ObjectId (PK)\n  buyer: ObjectId (FK -> User)\n  items: Array[{productId, qty, price}]\n  totalAmount: Number\n  paymentStatus: String\n  orderStatus: String"
    draw_box(ax, 0.5, 0.6, 3.4, 3.2, o_text, bg_color="#4A6572", fontsize=8.5, align="left", boxstyle="square,pad=0.4")

    # MESSAGE & CONVERSATION Table
    m_text = "MESSAGE / CHAT (Collection)\n----------------------\n* _id: ObjectId (PK)\n  conversationId: ObjectId\n  sender: ObjectId (FK -> User)\n  text: String\n  read: Boolean\n  createdAt: Date"
    draw_box(ax, 4.8, 0.6, 3.4, 3.2, m_text, bg_color="#CC0000", fontsize=8.5, align="left", boxstyle="square,pad=0.4")

    # MARKET_PRICE Table
    mp_text = "MARKET_PRICE (Collection)\n----------------------\n* _id: ObjectId (PK)\n  category: String\n  minPrice: Number\n  maxPrice: Number\n  avgPrice: Number\n  updatedAt: Date"
    draw_box(ax, 9.1, 0.6, 3.4, 3.2, mp_text, bg_color="#006064", fontsize=8.5, align="left", boxstyle="square,pad=0.4")

    # ER Relationships
    draw_arrow(ax, 3.9, 6.7, 4.8, 6.7, "1 : N (owns)")
    draw_arrow(ax, 8.2, 6.7, 9.1, 6.7, "N : 1 (belongs to)")
    draw_arrow(ax, 2.2, 5.0, 2.2, 3.8, "1 : N (places)")
    draw_arrow(ax, 3.9, 2.2, 4.8, 2.2, "1 : N (contains)")
    draw_arrow(ax, 3.9, 5.5, 4.8, 2.8, "N : M (chats)")
    draw_arrow(ax, 8.2, 5.5, 9.1, 2.2, "aggregates")

    plt.tight_layout()
    plt.savefig("database_er_diagram.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Generated database_er_diagram.png")

# ---------------------------------------------------------
# 2. INPUT SCREEN 1: PRODUCT CREATION & AI FORM
# ---------------------------------------------------------
def create_input_screen_product_form():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.5)
    ax.axis("off")

    # Browser Frame
    rect_browser = patches.Rectangle((0.2, 0.2), 9.6, 6.1, facecolor="#F8F9FA", edgecolor="#2B547E", lw=2)
    ax.add_patch(rect_browser)

    # Top Navbar
    rect_nav = patches.Rectangle((0.2, 5.6), 9.6, 0.7, facecolor="#1B365D", edgecolor="#1B365D")
    ax.add_patch(rect_nav)
    ax.text(0.5, 5.95, "Sakhi Bazaar  |  Seller Portal - Add New Product", fontsize=11, fontweight="bold", color="white", va="center")

    # Form Container
    draw_box(ax, 0.6, 0.6, 8.8, 4.7, "", bg_color="white", edgecolor="#CCCCCC", boxstyle="square,pad=0.2")

    # Form Header
    ax.text(0.9, 4.9, "INPUT SCREEN: Add New Product Listing", fontsize=12, fontweight="bold", color="#1B365D")

    # Input Fields
    ax.text(0.9, 4.4, "Product Title:", fontsize=9, fontweight="bold")
    draw_box(ax, 0.9, 4.0, 4.0, 0.35, "Handcrafted Kalamkari Cotton Saree", bg_color="#FFFFFF", text_color="#333333", align="left", edgecolor="#AAAAAA")

    ax.text(5.2, 4.4, "Category:", fontsize=9, fontweight="bold")
    draw_box(ax, 5.2, 4.0, 3.8, 0.35, "Clothing & Apparel  v", bg_color="#FFFFFF", text_color="#333333", align="left", edgecolor="#AAAAAA")

    ax.text(0.9, 3.6, "Selling Price (₹):", fontsize=9, fontweight="bold")
    draw_box(ax, 0.9, 3.2, 4.0, 0.35, "2499", bg_color="#FFFFFF", text_color="#333333", align="left", edgecolor="#AAAAAA")

    ax.text(5.2, 3.6, "Stock Quantity:", fontsize=9, fontweight="bold")
    draw_box(ax, 5.2, 3.2, 3.8, 0.35, "15", bg_color="#FFFFFF", text_color="#333333", align="left", edgecolor="#AAAAAA")

    ax.text(0.9, 2.8, "Upload Images (Cloudinary CDN):", fontsize=9, fontweight="bold")
    draw_box(ax, 0.9, 2.0, 8.1, 0.7, "[ Drag & Drop Photos Here or Click to Browse ]\n(Formats: JPG, PNG, WebP)", bg_color="#EBF3FA", text_color="#2B547E", edgecolor="#2B547E")

    # AI Generator Trigger Button
    draw_box(ax, 0.9, 1.0, 4.0, 0.6, "✨ Auto-Generate AI Description\n(Powered by Google Gemini)", bg_color="#006633", text_color="white", fontsize=9.5, fontweight="bold")

    draw_box(ax, 5.2, 1.0, 3.8, 0.6, "Publish Listing to Storefront", bg_color="#1B365D", text_color="white", fontsize=9.5, fontweight="bold")

    plt.tight_layout()
    plt.savefig("input_screen_product_form.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Generated input_screen_product_form.png")

# ---------------------------------------------------------
# 3. INPUT SCREEN 2: GEMINI AI COPILOT PROMPT MODAL
# ---------------------------------------------------------
def create_input_screen_ai_copilot():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.5)
    ax.axis("off")

    # Darkened Backdrop
    rect_bg = patches.Rectangle((0, 0), 10, 6.5, facecolor="#333333", alpha=0.5)
    ax.add_patch(rect_bg)

    # Modal Container
    draw_box(ax, 1.5, 0.8, 7.0, 4.9, "", bg_color="white", edgecolor="#006633", boxstyle="square,pad=0.2")

    # Modal Header
    rect_mhead = patches.Rectangle((1.5, 5.0), 7.0, 0.7, facecolor="#006633")
    ax.add_patch(rect_mhead)
    ax.text(1.8, 5.35, "INPUT SCREEN: Gemini AI Copywriter Prompt Modal", fontsize=11, fontweight="bold", color="white", va="center")

    # Inputs inside modal
    ax.text(1.8, 4.6, "Product Keywords & Unique Features:", fontsize=9, fontweight="bold")
    draw_box(ax, 1.8, 3.9, 6.4, 0.6, "Natural organic vegetable dyes, hand-block printed, pure cotton fabric, festive gift packaging", bg_color="#FAFAFA", text_color="#333333", align="left", edgecolor="#CCCCCC")

    ax.text(1.8, 3.5, "Target Audience:", fontsize=9, fontweight="bold")
    draw_box(ax, 1.8, 3.0, 3.0, 0.4, "Festive & Ethnic Fashion Buyers", bg_color="#FAFAFA", text_color="#333333", align="left", edgecolor="#CCCCCC")

    ax.text(5.1, 3.5, "Tone of Copy:", fontsize=9, fontweight="bold")
    draw_box(ax, 5.1, 3.0, 3.1, 0.4, "Warm, Storytelling, Traditional", bg_color="#FAFAFA", text_color="#333333", align="left", edgecolor="#CCCCCC")

    ax.text(1.8, 2.5, "Select Output Features:", fontsize=9, fontweight="bold")
    draw_box(ax, 1.8, 1.8, 6.4, 0.5, "[x] Storytelling Description    [x] Social Captions (Instagram/WhatsApp)    [x] Trending Hashtags", bg_color="#E8F5E9", text_color="#1B5E20", align="left", edgecolor="#81C784")

    # Generate Button
    draw_box(ax, 2.5, 1.0, 5.0, 0.5, "🚀 Generate Copy with Google Gemini API", bg_color="#006633", text_color="white", fontweight="bold", fontsize=10)

    plt.tight_layout()
    plt.savefig("input_screen_ai_copilot.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Generated input_screen_ai_copilot.png")

# ---------------------------------------------------------
# 4. OUTPUT SCREEN 1: PUBLIC BUYER MARKETPLACE
# ---------------------------------------------------------
def create_output_screen_marketplace():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.5)
    ax.axis("off")

    # Browser Frame
    rect_browser = patches.Rectangle((0.2, 0.2), 9.6, 6.1, facecolor="#F5F7FA", edgecolor="#1B365D", lw=2)
    ax.add_patch(rect_browser)

    # Top Navbar
    rect_nav = patches.Rectangle((0.2, 5.5), 9.6, 0.8, facecolor="#1B365D")
    ax.add_patch(rect_nav)
    ax.text(0.5, 5.9, "Sakhi Bazaar", fontsize=14, fontweight="bold", color="#D4AF37", va="center")

    # Search Bar
    draw_box(ax, 2.5, 5.7, 4.5, 0.4, "🔍 Search handcrafted saree, pottery, organic foods...", bg_color="white", text_color="#666666", align="left", edgecolor="#CCCCCC")

    # Nav Links
    ax.text(7.3, 5.9, "Cart (2)  |  Login  |  Seller Portal", fontsize=9, color="white", fontweight="bold", va="center")

    # Category Pills
    categories = ["All Products", "Clothing & Apparel", "Handmade Crafts", "Organic Foods", "Jewelry"]
    for i, cat in enumerate(categories):
        bg = "#006633" if i == 0 else "#FFFFFF"
        tc = "white" if i == 0 else "#333333"
        draw_box(ax, 0.5 + (i * 1.8), 5.0, 1.6, 0.35, cat, bg_color=bg, text_color=tc, fontsize=7.5, edgecolor="#CCCCCC")

    ax.text(0.5, 4.6, "OUTPUT SCREEN: Public Buyer Marketplace Feed", fontsize=11, fontweight="bold", color="#1B365D")

    # Product Cards Grid (3 cards)
    cards = [
        ("Kalamkari Silk Saree", "Meera Handicrafts (Verified)", "₹2,499", "#EBF3FA"),
        ("Hand-Painted Terracotta Vase", "EarthArt Artisans", "₹850", "#FFF3E0"),
        ("Homemade Organic Pickles", "Grandma's Spices", "₹350", "#E8F5E9")
    ]

    for i, (title, seller, price, card_bg) in enumerate(cards):
        cx = 0.5 + (i * 3.1)
        draw_box(ax, cx, 0.5, 2.9, 3.9, "", bg_color="white", edgecolor="#CCCCCC", boxstyle="square,pad=0.1")

        # Image placeholder box
        draw_box(ax, cx + 0.15, 2.3, 2.6, 1.9, f"[ Product Photo ]\n{title}", bg_color=card_bg, text_color="#333333", fontsize=8.5)

        ax.text(cx + 0.2, 2.0, title, fontsize=9, fontweight="bold", color="#1B365D")
        ax.text(cx + 0.2, 1.7, f"By {seller}", fontsize=7.5, color="#006633")
        ax.text(cx + 0.2, 1.35, price, fontsize=11, fontweight="bold", color="#CC0000")

        draw_box(ax, cx + 0.2, 0.7, 1.2, 0.4, "Add to Cart", bg_color="#1B365D", text_color="white", fontsize=7.5)
        draw_box(ax, cx + 1.5, 0.7, 1.2, 0.4, "💬 Chat", bg_color="#006633", text_color="white", fontsize=7.5)

    plt.tight_layout()
    plt.savefig("output_screen_marketplace.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Generated output_screen_marketplace.png")

# ---------------------------------------------------------
# 5. OUTPUT SCREEN 2: AI-GENERATED STORY & SOCIAL CAPTIONS
# ---------------------------------------------------------
def create_output_screen_ai_generated():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.5)
    ax.axis("off")

    # Header
    draw_box(ax, 0.4, 5.6, 9.2, 0.6, "OUTPUT SCREEN: AI-Generated Product Storytelling & Social Captions", bg_color="#006633", text_color="white", fontsize=11, fontweight="bold")

    # Left Box: AI Storytelling Description
    draw_box(ax, 0.4, 0.6, 4.4, 4.8, "", bg_color="#FAFAFA", edgecolor="#2B547E", boxstyle="square,pad=0.2")
    ax.text(0.6, 5.1, "📖 Gemini AI Storytelling Description:", fontsize=9.5, fontweight="bold", color="#1B365D")

    story_text = (
        "Immerse yourself in the timeless heritage of Andhra artistry "
        "with our handcrafted Kalamkari Cotton Saree. Lovingly hand-block "
        "printed by female artisans using 100% organic vegetable dyes, "
        "each motif weaves a story of cultural elegance and sustainable fashion.\n\n"
        "• Fabric: 100% Breathable Pure Cotton\n"
        "• Print: Traditional Hand-Block Floral Kalamkari\n"
        "• Craft Origin: Nellore District Artisans\n"
        "• Care: Gentle hand wash in cold water"
    )
    ax.text(0.6, 4.7, story_text, fontsize=8, color="#333333", va="top")

    draw_box(ax, 0.6, 0.8, 4.0, 0.4, "📋 Copy Description to Clipboard", bg_color="#2B547E", text_color="white", fontsize=8, fontweight="bold")

    # Right Box: Social Media Caption Creator
    draw_box(ax, 5.2, 0.6, 4.4, 4.8, "", bg_color="#FAFAFA", edgecolor="#E65100", boxstyle="square,pad=0.2")
    ax.text(5.4, 5.1, "✨ Gemini AI Social Caption & Tags:", fontsize=9.5, fontweight="bold", color="#E65100")

    caption_text = (
        "✨ Grace meets tradition! 🧵 Elevate your festive wardrobe "
        "with our handcrafted Kalamkari Cotton Saree, created with love "
        "by our artisan sisters in Nellore.\n\n"
        "🛍️ Shop directly on Sakhi Bazaar & empower women micro-entrepreneurs!\n\n"
        "🏷️ Tags:\n"
        "#SakhiBazaar #HandmadeSaree #KalamkariLove #WomenEntrepreneurs "
        "#VocalForLocal #EmpowerWomen #EthicalFashion"
    )
    ax.text(5.4, 4.7, caption_text, fontsize=8, color="#333333", va="top")

    draw_box(ax, 5.4, 0.8, 4.0, 0.4, "📲 Copy Social Caption & Hashtags", bg_color="#E65100", text_color="white", fontsize=8, fontweight="bold")

    plt.tight_layout()
    plt.savefig("output_screen_ai_generated.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Generated output_screen_ai_generated.png")

# ---------------------------------------------------------
# 6. OUTPUT SCREEN 3: MARKET PRICE INTELLIGENCE DASHBOARD
# ---------------------------------------------------------
def create_output_screen_price_intelligence():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.5)
    ax.axis("off")

    # Header
    draw_box(ax, 0.4, 5.6, 9.2, 0.6, "OUTPUT SCREEN: Market Price Intelligence Dashboard Widget", bg_color="#006064", text_color="white", fontsize=11, fontweight="bold")

    # Main Card
    draw_box(ax, 0.4, 0.6, 9.2, 4.8, "", bg_color="white", edgecolor="#006064", boxstyle="square,pad=0.2")

    ax.text(0.7, 4.9, "Category Price Benchmark Analytics: 'Clothing & Apparel'", fontsize=11, fontweight="bold", color="#006064")

    # Stat Boxes
    draw_box(ax, 0.7, 3.4, 2.6, 1.2, "Minimum Category Price\n\n₹ 850", bg_color="#E0F7FA", text_color="#006064", fontsize=10, fontweight="bold")
    draw_box(ax, 3.7, 3.4, 2.6, 1.2, "Average Market Price\n\n₹ 2,150", bg_color="#E8F5E9", text_color="#1B5E20", fontsize=10, fontweight="bold")
    draw_box(ax, 6.7, 3.4, 2.6, 1.2, "Maximum Category Price\n\n₹ 4,500", bg_color="#FFF3E0", text_color="#E65100", fontsize=10, fontweight="bold")

    # Seller Proposed Price Bar
    ax.text(0.7, 2.8, "Your Proposed Selling Price: ₹ 2,499", fontsize=10, fontweight="bold", color="#1B365D")

    # Visual Meter Bar
    rect_bar_bg = patches.Rectangle((0.7, 2.0), 8.6, 0.4, facecolor="#E0E0E0", edgecolor="#AAAAAA")
    ax.add_patch(rect_bar_bg)

    # Filled portion up to proposed price
    rect_bar_fill = patches.Rectangle((0.7, 2.0), 4.2, 0.4, facecolor="#006633")
    ax.add_patch(rect_bar_fill)
    ax.text(4.9, 2.2, "Optimal Fair Price Zone (+16% vs Avg)", fontsize=8.5, fontweight="bold", color="white", va="center", ha="right")

    # Recommendation Message Box
    draw_box(ax, 0.7, 0.8, 8.6, 0.9, "💡 AI Valuation Insight: Your proposed price of ₹2,499 falls within the recommended fair profit range for hand-printed cotton sarees. It ensures competitive buyer demand while protecting your artisan profit margin.", bg_color="#EBF3FA", text_color="#1B365D", align="left", fontsize=8.5, edgecolor="#2B547E")

    plt.tight_layout()
    plt.savefig("output_screen_price_intelligence.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Generated output_screen_price_intelligence.png")

# ---------------------------------------------------------
# 7. OUTPUT SCREEN 4: REAL-TIME SELLER CHAT WINDOW
# ---------------------------------------------------------
def create_output_screen_chat():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.5)
    ax.axis("off")

    # Header
    draw_box(ax, 0.4, 5.6, 9.2, 0.6, "OUTPUT SCREEN: Real-Time Socket.IO Buyer-Seller Chat Interface", bg_color="#CC0000", text_color="white", fontsize=11, fontweight="bold")

    # Chat Window Container
    draw_box(ax, 1.5, 0.6, 7.0, 4.8, "", bg_color="#FAFAFA", edgecolor="#CC0000", boxstyle="square,pad=0.2")

    # Chat Header Bar
    rect_chead = patches.Rectangle((1.5, 4.7), 7.0, 0.7, facecolor="#1B365D")
    ax.add_patch(rect_chead)
    ax.text(1.8, 5.05, "💬 Chat with Meera Handicrafts (Seller)  🟢 Online", fontsize=10, fontweight="bold", color="white", va="center")

    # Chat Messages
    # Message 1 (Buyer - Left)
    draw_box(ax, 1.8, 3.8, 4.2, 0.6, "Buyer: Hello! Is custom embroidery available for the Kalamkari Saree?", bg_color="#E3F2FD", text_color="#0D47A1", align="left", fontsize=8, boxstyle="round,pad=0.2")

    # Message 2 (Seller - Right)
    draw_box(ax, 3.9, 2.9, 4.3, 0.7, "Seller: Namaste! Yes, we can customize floral motifs and color shades according to your festive requirements.", bg_color="#DCEDC8", text_color="#33691E", align="left", fontsize=8, boxstyle="round,pad=0.2")

    # Message 3 (Buyer - Left)
    draw_box(ax, 1.8, 2.1, 3.8, 0.6, "Buyer: Wonderful! How many days will delivery take to Hyderabad?", bg_color="#E3F2FD", text_color="#0D47A1", align="left", fontsize=8, boxstyle="round,pad=0.2")

    # Message 4 (Seller - Right)
    draw_box(ax, 4.2, 1.3, 4.0, 0.6, "Seller: Dispatch takes 2 business days via Express shipment!", bg_color="#DCEDC8", text_color="#33691E", align="left", fontsize=8, boxstyle="round,pad=0.2")

    # Chat Input Bar
    draw_box(ax, 1.7, 0.7, 5.2, 0.4, "Type your message here...", bg_color="white", text_color="#888888", align="left", edgecolor="#CCCCCC")
    draw_box(ax, 7.0, 0.7, 1.3, 0.4, "Send  ➤", bg_color="#006633", text_color="white", fontsize=8.5, fontweight="bold")

    plt.tight_layout()
    plt.savefig("output_screen_chat.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Generated output_screen_chat.png")

if __name__ == "__main__":
    create_database_er_diagram()
    create_input_screen_product_form()
    create_input_screen_ai_copilot()
    create_output_screen_marketplace()
    create_output_screen_ai_generated()
    create_output_screen_price_intelligence()
    create_output_screen_chat()
    print("Database ER diagram and 6 input/output screen mockups generated successfully!")
