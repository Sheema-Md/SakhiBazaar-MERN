import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_entity_table(ax, x, y, width, height, title, fields, header_bg="#1B365D", body_bg="#F8F9FA", border_color="#1B365D"):
    # Header Box
    h_height = 0.55
    rect_header = patches.FancyBboxPatch(
        (x, y + height - h_height), width, h_height,
        boxstyle="round,pad=0.05,rounding_size=0.1",
        facecolor=header_bg, edgecolor=border_color, linewidth=1.5, zorder=4
    )
    ax.add_patch(rect_header)
    ax.text(
        x + width / 2.0, y + height - (h_height / 2.0), title,
        color="white", fontsize=9.5, fontweight="bold", ha="center", va="center", zorder=5
    )

    # Body Box
    rect_body = patches.FancyBboxPatch(
        (x, y), width, height - h_height + 0.05,
        boxstyle="round,pad=0.05,rounding_size=0.1",
        facecolor=body_bg, edgecolor=border_color, linewidth=1.5, zorder=3
    )
    ax.add_patch(rect_body)

    # Field Items
    curr_y = y + height - h_height - 0.25
    for field_type, field_name in fields:
        if field_type == "PK":
            tag = "[PK]"
            tag_col = "#B78103" # Gold
            fw = "bold"
        elif field_type == "FK":
            tag = "[FK]"
            tag_col = "#2980B9" # Blue
            fw = "bold"
        else:
            tag = "  * "
            tag_col = "#555555"
            fw = "normal"

        ax.text(x + 0.15, curr_y, tag, color=tag_col, fontsize=8, fontweight=fw, va="center", zorder=5)
        ax.text(x + 0.75, curr_y, field_name, color="#222222", fontsize=8.5, fontweight=fw, va="center", zorder=5)
        curr_y -= 0.30

def draw_relation_arrow(ax, x1, y1, x2, y2, label="", color="#2C3E50", linestyle="-"):
    ax.annotate(
        "", xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(arrowstyle="-|>", color=color, lw=2.2, ls=linestyle, mutation_scale=14),
        zorder=2
    )
    if label:
        mx, my = (x1 + x2) / 2.0, (y1 + y2) / 2.0
        # Draw background pill for label
        bbox_props = dict(boxstyle="round,pad=0.3", fc="#FFFFFF", ec=color, lw=1.2)
        ax.text(mx, my, label, fontsize=8, color=color, fontweight="bold", ha="center", va="center", bbox=bbox_props, zorder=6)

def generate_enhanced_er_diagram():
    fig, ax = plt.subplots(figsize=(14, 9.5), dpi=300)
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9.5)
    ax.axis("off")

    # Overall Background
    rect_bg = patches.Rectangle((0, 0), 14, 9.5, facecolor="#FAFCFF")
    ax.add_patch(rect_bg)

    plt.title("Sakhi Bazaar - Enhanced Database ER Diagram", fontsize=16, fontweight="bold", pad=20, color="#1B365D")

    # 1. USER Entity
    user_fields = [
        ("PK", "_id : ObjectId"),
        ("ATT", "name : String"),
        ("ATT", "email : String [Unique]"),
        ("ATT", "passwordHash : String"),
        ("ATT", "role : Enum ('buyer'|'seller')"),
        ("ATT", "storeName : String"),
        ("ATT", "isVerified : Boolean"),
        ("ATT", "createdAt : Date")
    ]
    draw_entity_table(ax, 0.6, 5.2, 3.6, 3.4, "USER (Collection)", user_fields, header_bg="#1B365D", body_bg="#F0F4F8", border_color="#1B365D")

    # 2. PRODUCT Entity
    product_fields = [
        ("PK", "_id : ObjectId"),
        ("FK", "seller : ObjectId -> User"),
        ("ATT", "title : String [Text Index]"),
        ("ATT", "description : String"),
        ("ATT", "price : Number"),
        ("ATT", "category : String [Index]"),
        ("ATT", "images : Array[Cloudinary]"),
        ("ATT", "aiCaption : String (Gemini)"),
        ("ATT", "stock : Number")
    ]
    draw_entity_table(ax, 5.2, 5.2, 3.6, 3.6, "PRODUCT (Collection)", product_fields, header_bg="#006633", body_bg="#E8F5E9", border_color="#006633")

    # 3. CATEGORY Entity
    category_fields = [
        ("PK", "_id : ObjectId"),
        ("ATT", "name : String [Unique]"),
        ("ATT", "slug : String"),
        ("ATT", "description : String")
    ]
    draw_entity_table(ax, 9.8, 6.4, 3.6, 2.2, "CATEGORY (Collection)", category_fields, header_bg="#B78103", body_bg="#FFFDE7", border_color="#B78103")

    # 4. ORDER Entity
    order_fields = [
        ("PK", "_id : ObjectId"),
        ("FK", "buyer : ObjectId -> User"),
        ("ATT", "items : Array[{productId, qty}]"),
        ("ATT", "totalAmount : Number"),
        ("ATT", "paymentStatus : String"),
        ("ATT", "orderStatus : String")
    ]
    draw_entity_table(ax, 0.6, 0.6, 3.6, 3.2, "ORDER (Collection)", order_fields, header_bg="#2C3E50", body_bg="#EBF5FB", border_color="#2C3E50")

    # 5. CHAT / MESSAGE Entity
    chat_fields = [
        ("PK", "_id : ObjectId"),
        ("FK", "conversationId : ObjectId"),
        ("FK", "sender : ObjectId -> User"),
        ("ATT", "text : String"),
        ("ATT", "read : Boolean"),
        ("ATT", "createdAt : Date (Socket.IO)")
    ]
    draw_entity_table(ax, 5.2, 0.6, 3.6, 3.2, "CHAT_MESSAGE (Collection)", chat_fields, header_bg="#C0392B", body_bg="#FDEDEC", border_color="#C0392B")

    # 6. MARKET_PRICE Entity
    price_fields = [
        ("PK", "_id : ObjectId"),
        ("ATT", "category : String [Index]"),
        ("ATT", "minPrice : Number"),
        ("ATT", "maxPrice : Number"),
        ("ATT", "avgPrice : Number"),
        ("ATT", "productCount : Number")
    ]
    draw_entity_table(ax, 9.8, 0.6, 3.6, 3.2, "MARKET_PRICE (Collection)", price_fields, header_bg="#00838F", body_bg="#E0F7FA", border_color="#00838F")

    # Relationship Connectors & Cardinalities
    draw_relation_arrow(ax, 4.2, 7.2, 5.2, 7.2, label="1 : N  (Owns)", color="#1B365D")
    draw_relation_arrow(ax, 8.8, 7.2, 9.8, 7.2, label="N : 1  (Classifies)", color="#B78103")
    draw_relation_arrow(ax, 2.4, 5.2, 2.4, 3.8, label="1 : N  (Places)", color="#2C3E50")
    draw_relation_arrow(ax, 4.2, 2.2, 5.2, 2.2, label="1 : N  (Contains)", color="#C0392B")
    draw_relation_arrow(ax, 4.2, 6.0, 5.2, 3.0, label="N : M  (Chats)", color="#8E44AD")
    draw_relation_arrow(ax, 8.8, 6.0, 9.8, 2.2, label="Aggregates", color="#00838F")

    plt.tight_layout()
    plt.savefig("database_er_diagram.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Enhanced database_er_diagram.png generated successfully!")

if __name__ == "__main__":
    generate_enhanced_er_diagram()
