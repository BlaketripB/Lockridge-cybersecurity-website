#!/usr/bin/env python3
"""
LockRidge Cybersecurity — Premium Business Card v4
3.5" × 2"  |  Page 1 = Front  |  Page 2 = Back
"""
import sys, os

try:
    from reportlab.lib.pagesizes import inch
    from reportlab.pdfgen import canvas as rl_canvas
    from reportlab.lib.colors import HexColor, Color
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfbase.pdfmetrics import stringWidth
except ImportError:
    print("pip3 install reportlab"); sys.exit(1)

try:
    from PIL import Image
    import qrcode
except ImportError:
    print("pip3 install pillow qrcode"); sys.exit(1)

# ── Palette ────────────────────────────────────────────────
BG       = HexColor('#0b0b12')      # near-black base
WHITE    = HexColor('#f0f4ff')      # brightest — name only
WHITE_2  = HexColor('#d8e0f0')      # company name / contact text
BLUE     = HexColor('#5b9cf6')      # title only — sole accent
BLUE_DIM = HexColor('#2e5080')      # hairline rule color
MUTED    = HexColor('#5a6175')      # tagline / scan label
DIM      = HexColor('#1a1e2a')      # barely-there elements

W = 3.5 * inch
H = 2.0 * inch
CX = W / 2          # card horizontal center

BASE     = "/Users/blakebutler/Library/Mobile Documents/com~apple~CloudDocs/Lockridge cyber website- claude"
LOGO_SRC = "/tmp/logo.svg.png"
LOGO_PNG = "/tmp/logo_clean.png"
QR_PNG   = "/tmp/lockridge_qr.png"
OUT_PATH = os.path.join(BASE, "LockRidge_BusinessCard.pdf")
WEBSITE  = "https://LockridgeCyber.com"
LM       = 22        # left margin (back)


# ── Asset prep ─────────────────────────────────────────────
def prepare_logo():
    if not os.path.exists(LOGO_SRC):
        return False
    img = Image.open(LOGO_SRC).convert("RGBA")
    cleaned = []
    for r, g, b, a in img.getdata():
        cleaned.append((r, g, b, 0) if (r > 225 and g > 225 and b > 225) else (r, g, b, a))
    img.putdata(cleaned)
    img.save(LOGO_PNG, "PNG")
    print("  Logo cleaned.")
    return True

def prepare_qr():
    qr = qrcode.QRCode(
        version=2,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=5,
        border=1,
    )
    qr.add_data(WEBSITE)
    qr.make(fit=True)
    # Slightly lighter modules for better scannability + premium look
    img = qr.make_image(fill_color="#96bcd6", back_color="#0b0b12")
    img.save(QR_PNG, "PNG")
    print("  QR code generated.")


# ── Helpers ────────────────────────────────────────────────
def a(color, alpha):
    """Color with alpha."""
    return Color(color.red, color.green, color.blue, alpha)

def centered_text(c, text, font, size, color, x, y, char_space=0):
    """Draw text centered at x, with optional char spacing."""
    txt = c.beginText()
    txt.setFont(font, size)
    txt.setFillColor(color)
    txt.setCharSpace(char_space)
    raw_w = stringWidth(text, font, size)
    total_w = raw_w + char_space * max(0, len(text) - 1)
    txt.setTextOrigin(x - total_w / 2, y)
    txt.textLine(text)
    c.drawText(txt)

def draw_bg(c, ox, oy):
    """Dark background with very subtle top-edge shadow."""
    c.saveState()
    c.setFillColor(BG)
    c.rect(ox, oy, W, H, fill=1, stroke=0)
    # Faint top vignette — 8 thin strips
    for i in range(8):
        alpha = 0.045 * (1 - i / 8)
        c.setFillColor(Color(0, 0, 0, alpha))
        strip_h = H / 8
        c.rect(ox, oy + H - strip_h * (i + 1), W, strip_h, fill=1, stroke=0)
    c.restoreState()

def draw_dot_grid(c, ox, oy):
    """Barely visible blue dot matrix — depth without distraction."""
    c.saveState()
    spacing = 13
    r = 0.55
    alpha = 0.048
    cols = int(W / spacing) + 2
    rows = int(H / spacing) + 2
    c.setFillColor(a(BLUE, alpha))
    for col in range(cols):
        for row in range(rows):
            x = ox + col * spacing + spacing / 2
            y = oy + row * spacing + spacing / 2
            if ox < x < ox + W and oy < y < oy + H:
                c.circle(x, y, r, fill=1, stroke=0)
    c.restoreState()


# ── Front ──────────────────────────────────────────────────
def draw_front(c, ox, oy):
    c.saveState()
    draw_bg(c, ox, oy)
    draw_dot_grid(c, ox, oy)

    # ── Logo — transparent, centered, upper half ────────────
    logo_h = 44
    logo_y = oy + H / 2 + 8
    if os.path.exists(LOGO_PNG):
        try:
            img = ImageReader(LOGO_PNG)
            iw, ih = img.getSize()
            scale = logo_h / ih
            lw = iw * scale
            c.drawImage(img, ox + CX - lw / 2, logo_y,
                        width=lw, height=logo_h, mask='auto')
            name_y = logo_y - 16
        except:
            name_y = oy + H / 2 - 4
    else:
        name_y = oy + H / 2 - 4

    # ── Company name — hierarchy level 2 ───────────────────
    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(WHITE_2)
    c.drawCentredString(ox + CX, name_y, "LockRidge Cybersecurity")

    # ── Hairline rule ──────────────────────────────────────
    rule_y = name_y - 9
    rule_w = 108
    c.setLineWidth(0.35)
    c.setStrokeColor(a(BLUE_DIM, 0.6))
    c.line(ox + CX - rule_w / 2, rule_y, ox + CX + rule_w / 2, rule_y)

    # ── Tagline — hierarchy level 3 ────────────────────────
    # Letter-spaced small caps feel; precisely centered
    tagline = "LOCKED IN.  RUNNING SMOOTH."
    centered_text(c, tagline, "Helvetica", 6.8, a(MUTED, 0.95),
                  ox + CX, rule_y - 13, char_space=2.4)

    c.restoreState()


# ── Back ───────────────────────────────────────────────────
def draw_back(c, ox, oy):
    c.saveState()
    draw_bg(c, ox, oy)
    draw_dot_grid(c, ox, oy)

    lx = ox + LM

    # ── Name — hierarchy level 1: brightest, largest ───────
    name_y = oy + H - 31
    c.setFont("Helvetica-Bold", 15.5)
    c.setFillColor(WHITE)                      # full brightness — dominant
    c.drawString(lx, name_y, "Blake Butler")

    # ── Blue rule — sole accent mark ──────────────────────
    rule_y = name_y - 9
    c.setLineWidth(0.55)
    c.setStrokeColor(a(BLUE, 0.5))
    c.line(lx, rule_y, lx + 108, rule_y)

    # ── Title — hierarchy level 2: blue only ──────────────
    title_y = rule_y - 17                      # +3pt more breathing room
    c.setFont("Helvetica", 8.5)
    c.setFillColor(BLUE)                       # blue here, nowhere else
    c.drawString(lx, title_y, "IT & Cybersecurity Specialist")

    # ── Contact — hierarchy level 3 ───────────────────────
    CONTACTS = [
        "385-985-8976",
        "Contact@Lockridgecyber.com",
        "LockridgeCyber.com",
    ]

    contact_y = title_y - 22                   # +4pt gap from title
    c.setFont("Helvetica", 8)
    for line in CONTACTS:
        c.setFillColor(a(WHITE_2, 0.92))       # was 0.78 — much more readable
        c.drawString(lx, contact_y, line)
        contact_y -= 15                        # +1pt leading vs before

    # ── QR code — bottom right ─────────────────────────────
    qr_size = 44
    qr_x = ox + W - qr_size - 13
    qr_y = oy + 10

    # "Scan for website" label above QR
    scan_label = "Scan for website"
    scan_y = qr_y + qr_size + 8
    centered_text(c, scan_label, "Helvetica", 6.2, a(WHITE_2, 0.80),
                  qr_x + qr_size / 2, scan_y, char_space=0.4)

    if os.path.exists(QR_PNG):
        try:
            qr_img = ImageReader(QR_PNG)
            c.drawImage(qr_img, qr_x, qr_y, width=qr_size, height=qr_size,
                        mask='auto')
        except Exception as e:
            print(f"  QR err: {e}")

    c.restoreState()


# ── Build ──────────────────────────────────────────────────
def main():
    print("Preparing assets...")
    prepare_logo()
    prepare_qr()

    print(f"Building: {OUT_PATH}")
    c = rl_canvas.Canvas(OUT_PATH, pagesize=(W, H))
    draw_front(c, 0, 0)
    c.showPage()
    draw_back(c, 0, 0)
    c.showPage()
    c.save()
    print("Done — LockRidge_BusinessCard.pdf")

if __name__ == "__main__":
    main()
