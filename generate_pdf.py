import sys
from fpdf import FPDF

class SakhiBazaarPDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return  # No header on title page
        
        # Header banner (Deep Berry)
        self.set_fill_color(90, 24, 70)  # #5A1846
        self.rect(0, 0, 210, 15, "F")
        
        self.set_y(4)
        self.set_text_color(255, 255, 255)
        self.set_font("helvetica", "B", 9)
        self.cell(0, 5, "SAKHI BAZAAR  |  TECHNICAL SPECIFICATION & DEVELOPMENT ROADMAP", align="C")
        self.ln(12)
        
    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.set_text_color(127, 127, 127)
        self.cell(0, 10, f"Page {self.page_no()} of {{nb}}", align="C")
        
        # Bottom decorative gold bar
        self.set_fill_color(212, 175, 55)  # #D4AF37
        self.rect(0, 292, 210, 5, "F")

def build_pdf():
    pdf = SakhiBazaarPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.alias_nb_pages()
    
    # Custom Palette
    COLOR_PRIMARY = (90, 24, 70)       # Deep Berry
    COLOR_ACCENT = (212, 175, 55)      # Warm Gold
    COLOR_TEXT = (44, 62, 80)          # Charcoal
    COLOR_BG_GRAY = (245, 245, 245)    # Muted light gray
    COLOR_SUCCESS = (39, 174, 96)      # Implemented green
    COLOR_PENDING = (230, 126, 34)     # Planned orange
    
    # ----------------------------------------------------
    # PAGE 1: TITLE PAGE
    # ----------------------------------------------------
    pdf.add_page()
    
    # Elegant Cover Background Color
    pdf.set_fill_color(253, 251, 247)  # Cream background
    pdf.rect(0, 0, 210, 297, "F")
    
    # Side Decorative Pillars
    pdf.set_fill_color(*COLOR_PRIMARY)
    pdf.rect(0, 0, 8, 297, "F")
    pdf.set_fill_color(*COLOR_ACCENT)
    pdf.rect(8, 0, 2, 297, "F")
    
    # Title Section
    pdf.set_y(60)
    pdf.set_font("helvetica", "B", 38)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(15)  # Indent from left pillar
    pdf.cell(0, 15, "Sakhi Bazaar", ln=True)
    
    # Subtitle
    pdf.set_y(80)
    pdf.set_font("helvetica", "", 16)
    pdf.set_text_color(*COLOR_TEXT)
    pdf.cell(15)
    pdf.multi_cell(160, 8, "AI-Enabled Marketplace for Women Entrepreneurs\nTechnical Specifications & Development Roadmap")
    
    # Accent Line
    pdf.set_y(105)
    pdf.set_fill_color(*COLOR_ACCENT)
    pdf.rect(35, 105, 80, 1.5, "F")
    
    # Project Summary Block
    pdf.set_y(125)
    pdf.cell(15)
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(0, 10, "Document Purpose & Context", ln=True)
    
    pdf.cell(15)
    pdf.set_font("helvetica", "", 10.5)
    pdf.set_text_color(*COLOR_TEXT)
    summary_text = (
        "This document details the functional requirement modules and implementation milestones "
        "for the Sakhi Bazaar platform. It serves as the companion specification sheet to the "
        "project review presentation, providing comprehensive tracking of completed features and "
        "upcoming database, administrative, and payment integration pipelines."
    )
    pdf.multi_cell(155, 6, summary_text)
    
    # Metadata Block
    pdf.set_y(210)
    pdf.cell(15)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(40, 6, "Platform Version:")
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(*COLOR_TEXT)
    pdf.cell(0, 6, "v1.0 (MVP Completed, Phase 2 Active)", ln=True)
    
    pdf.cell(15)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(40, 6, "Architecture Stack:")
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(*COLOR_TEXT)
    pdf.cell(0, 6, "MERN (MongoDB, Express, React 19, Node.js)", ln=True)
    
    pdf.cell(15)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(40, 6, "Integrations:")
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(*COLOR_TEXT)
    pdf.cell(0, 6, "Google Gemini API, Firebase Authentication, Cloudinary CDN", ln=True)
    
    pdf.cell(15)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(40, 6, "Date generated:")
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(*COLOR_TEXT)
    pdf.cell(0, 6, "July 2026", ln=True)

    # ----------------------------------------------------
    # PAGE 2: FUNCTIONAL MODULES LISTING
    # ----------------------------------------------------
    pdf.add_page()
    pdf.set_y(20)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.set_font("helvetica", "B", 18)
    pdf.cell(0, 10, "1. Functional Requirement Modules", ln=True)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(*COLOR_TEXT)
    intro_modules = (
        "Below are the structured modules representing the complete functional footprint of "
        "Sakhi Bazaar. Each requirement maps to a specific user role and indicates current "
        "implementation status."
    )
    pdf.multi_cell(0, 6, intro_modules)
    pdf.ln(4)
    
    # Helper to draw module header
    def draw_module_header(m_title):
        pdf.set_font("helvetica", "B", 12)
        pdf.set_text_color(*COLOR_PRIMARY)
        pdf.cell(0, 8, m_title, ln=True)
        pdf.ln(1)
        
    # Helper to draw table rows
    def render_table(headers, col_widths, rows):
        # Header Row
        pdf.set_font("helvetica", "B", 9)
        pdf.set_text_color(255, 255, 255)
        pdf.set_fill_color(*COLOR_PRIMARY)
        
        for i, header in enumerate(headers):
            pdf.cell(col_widths[i], 7, header, border=1, align="C", fill=True)
        pdf.ln()
        
        # Data Rows
        pdf.set_font("helvetica", "", 8.5)
        pdf.set_text_color(*COLOR_TEXT)
        
        for r_index, row in enumerate(rows):
            # Calculate heights for wrapping text
            # We use multi_cell styling, but for simplicity, we keep descriptions brief
            pdf.set_fill_color(*(COLOR_BG_GRAY if r_index % 2 == 0 else (255, 255, 255)))
            
            # Row fields
            req_id, desc, role, status = row
            
            # Status colors
            status_text = status
            if status == "Implemented":
                pdf.set_text_color(*COLOR_SUCCESS)
            else:
                pdf.set_text_color(*COLOR_PENDING)
                
            # Print Cells (manual layout to support multi-line descriptions if needed, but here simple cells)
            pdf.cell(col_widths[0], 8, req_id, border=1, align="C", fill=True)
            
            # Reset text color for description
            pdf.set_text_color(*COLOR_TEXT)
            pdf.cell(col_widths[1], 8, desc, border=1, fill=True)
            pdf.cell(col_widths[2], 8, role, border=1, align="C", fill=True)
            
            # Re-apply status color
            if status == "Implemented":
                pdf.set_text_color(*COLOR_SUCCESS)
            else:
                pdf.set_text_color(*COLOR_PENDING)
            pdf.cell(col_widths[3], 8, status_text, border=1, align="C", fill=True)
            pdf.ln()
            pdf.set_text_color(*COLOR_TEXT)
        pdf.ln(6)

    # Table columns definition
    headers = ["Req ID", "Description", "Role", "Status"]
    widths = [20, 100, 30, 35]
    
    # Module 1
    draw_module_header("Module 1: Authentication & Onboarding")
    m1_rows = [
        ["FR-1.1", "Email/Password Registration and Login", "All", "Implemented"],
        ["FR-1.2", "Google Authentication via Firebase SSO", "All", "Implemented"],
        ["FR-1.3", "Role Assignment (customer vs. seller at signup)", "All", "Implemented"],
        ["FR-1.4", "JWT Generation & HTTPOnly Cookie Token Management", "All", "Implemented"],
        ["FR-1.5", "Seller Profile Completion (Store details, contact info)", "Seller", "Planned"]
    ]
    render_table(headers, widths, m1_rows)

    # Module 2
    draw_module_header("Module 2: Buyer Storefront & Browsing")
    m2_rows = [
        ["FR-2.1", "Public landing page displaying recently added products", "Buyer", "Implemented"],
        ["FR-2.2", "Real-time text search (searches title & description)", "Buyer", "Implemented"],
        ["FR-2.3", "Category-based filters (Clothing, Handmade, Food)", "Buyer", "Implemented"],
        ["FR-2.4", "Detailed product view page with seller contact information", "Buyer", "Implemented"],
        ["FR-2.5", "Shopping cart (add, remove, adjust quantities)", "Buyer", "Planned"]
    ]
    render_table(headers, widths, m2_rows)

    # Module 3
    draw_module_header("Module 3: Seller Product Management")
    m3_rows = [
        ["FR-3.1", "List a new product (title, price, category, images)", "Seller", "Implemented"],
        ["FR-3.2", "Secure product image uploads to Cloudinary storage", "Seller", "Implemented"],
        ["FR-3.3", "Update existing product details and change images", "Seller", "Implemented"],
        ["FR-3.4", "Delete listed products (removes from marketplace)", "Seller", "Implemented"],
        ["FR-3.5", "Seller Dashboard listing only products created by seller", "Seller", "Implemented"]
    ]
    render_table(headers, widths, m3_rows)

    # ----------------------------------------------------
    # PAGE 3: MODULES CONTINUED & ROADMAP
    # ----------------------------------------------------
    pdf.add_page()
    pdf.set_y(20)
    
    # Module 4
    draw_module_header("Module 4: Generative AI Assistant (Gemini API)")
    m4_rows = [
        ["FR-4.1", "AI Description: Storytelling copy writing from titles", "Seller", "Implemented"],
        ["FR-4.2", "AI Caption: Emoji-rich captions for social promotion", "Seller", "Implemented"],
        ["FR-4.3", "One-click copy to clipboard functionality", "Seller", "Implemented"]
    ]
    render_table(headers, widths, m4_rows)

    # Module 5
    draw_module_header("Module 5: Market Price Awareness")
    m5_rows = [
        ["FR-5.1", "Local Platform Metrics: Min, max, and avg category pricing", "Seller", "Planned"],
        ["FR-5.2", "AI Valuation: Gemini recommendations during entry", "Seller", "Planned"],
        ["FR-5.3", "Price Comparison Widget for customer transparency", "Buyer", "Planned"]
    ]
    render_table(headers, widths, m5_rows)

    # Module 6
    draw_module_header("Module 6: Payment Gateway Integration")
    m6_rows = [
        ["FR-6.1", "Checkout System: Initiate purchase request from cart", "Buyer", "Planned"],
        ["FR-6.2", "Stripe/Razorpay API Integration: Credit/debit/UPI payments", "Buyer", "Planned"],
        ["FR-6.3", "Webhook Handler: Verify transactions on the backend", "System", "Planned"],
        ["FR-6.4", "Payment Confirmation: Digital receipts & status updates", "Buyer/Seller", "Planned"]
    ]
    render_table(headers, widths, m6_rows)

    # Module 7
    draw_module_header("Module 7: Administrative Portal")
    m7_rows = [
        ["FR-7.1", "Admin Role Access: Dedicated database administrator key", "Admin", "Planned"],
        ["FR-7.2", "Vetting Dashboard: Review and approve business credentials", "Admin", "Planned"],
        ["FR-7.3", "Product Moderation: Suspend/flag inappropriate listings", "Admin", "Planned"],
        ["FR-7.4", "Financial Metrics: Track platform sales volumes & commission", "Admin", "Planned"]
    ]
    render_table(headers, widths, m7_rows)

    # ----------------------------------------------------
    # PAGE 4: DEVELOPMENT CHECKLIST
    # ----------------------------------------------------
    pdf.add_page()
    pdf.set_y(20)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.set_font("helvetica", "B", 18)
    pdf.cell(0, 10, "2. Development Roadmap & Tracking Checklist", ln=True)
    pdf.ln(3)
    
    # Helper to draw checkbox item
    def draw_checkbox(checked, text):
        pdf.set_font("zapfdingbats", "", 12)
        pdf.set_text_color(*COLOR_PRIMARY)
        if checked:
            pdf.cell(8, 6, chr(52), align="C") # checkmark in zapfdingbats
        else:
            pdf.cell(8, 6, chr(111), align="C") # open circle/square
            
        pdf.set_font("helvetica", "", 10)
        pdf.set_text_color(*COLOR_TEXT)
        pdf.multi_cell(0, 6, text)
        pdf.ln(2)

    # Phase 1
    pdf.set_font("helvetica", "B", 13)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(0, 8, "Phase 1: MERN Foundation & AI Integration (MVP) - COMPLETED", ln=True)
    pdf.ln(1)
    
    draw_checkbox(True, "Initialize backend Node/Express server and setup Mongoose models.")
    draw_checkbox(True, "Design initial MongoDB schemas for User, Product, and Chat logs.")
    draw_checkbox(True, "Implement JWT Authentication and bcrypt password encryption.")
    draw_checkbox(True, "Design responsive public web layouts using Tailwind CSS.")
    draw_checkbox(True, "Implement buyer login, registration, and seller dashboards on React client.")
    draw_checkbox(True, "Connect Cloudinary upload middleware to secure product image uploads.")
    draw_checkbox(True, "Program backend Gemini routes for AI Description & Caption Generation.")
    draw_checkbox(True, "Integrate one-click copy-to-clipboard elements on merchant dashboard.")
    pdf.ln(4)

    # Phase 2
    pdf.set_font("helvetica", "B", 13)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(0, 8, "Phase 2: Market Price Awareness & Payments - ACTIVE DEVELOPMENT", ln=True)
    pdf.ln(1)
    
    draw_checkbox(False, "Create backend API endpoint /api/products/stats/category to fetch pricing metrics.")
    draw_checkbox(False, "Render price benchmark stats inside seller AddProduct/EditProduct dashboards.")
    draw_checkbox(False, "Integrate secure payment gateway checkout routes (/api/payments/checkout).")
    draw_checkbox(False, "Embed Stripe Elements or Razorpay Modal inside buyer checkout pages.")
    draw_checkbox(False, "Program secure webhook endpoints on backend to verify merchant success.")
    pdf.ln(4)

    # Phase 3
    pdf.set_font("helvetica", "B", 13)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(0, 8, "Phase 3: Administrative Control & Portal - UPCOMING", ln=True)
    pdf.ln(1)
    
    draw_checkbox(False, "Extend User database schema to support specific Admin security access.")
    draw_checkbox(False, "Secure backend admin API routes with validation middleware (isAdmin).")
    draw_checkbox(False, "Construct Admin Dashboard React panel to monitor global products and buyers.")
    draw_checkbox(False, "Add Deactivate Account and Flag Product moderation elements.")
    draw_checkbox(False, "Implement transaction graphs showing platform sales volume.")

    # Save PDF
    pdf.output("Sakhi_Bazaar_Modules_Roadmap.pdf")
    print("PDF saved successfully as 'Sakhi_Bazaar_Modules_Roadmap.pdf'")

if __name__ == "__main__":
    build_pdf()
