from pathlib import Path
import re

from PIL import Image, ImageOps
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "public" / "assets"
OUT_DIR = ROOT / "output" / "pdf"
CACHE_DIR = ROOT / "tmp" / "pdfs" / "portfolio-cache"
OUT = OUT_DIR / "aadit-kannan-figure-robotics-portfolio.pdf"

W, H = letter
M = 48
CONTENT_W = W - 2 * M
BOTTOM = 42

BG = colors.HexColor("#fbfbfa")
INK = colors.HexColor("#101010")
TEXT = colors.HexColor("#303030")
MUTED = colors.HexColor("#747474")
FAINT = colors.HexColor("#dadad6")
SOFT = colors.HexColor("#efefec")
ACCENT = colors.HexColor("#4b5b60")
PAPER = colors.HexColor("#ffffff")


def ensure_dirs():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)


def ascii_clean(text):
    text = text.replace("—", "-").replace("–", "-").replace("µ", "u")
    text = text.replace("₃", "3").replace("Ø", "O").replace("×", "x")
    text = text.replace("≥", ">=").replace("≤", "<=").replace("±", "+/-")
    return re.sub(r"\s+", " ", text).strip()


def dest_key(value):
    value = ascii_clean(value).lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return f"project-{value or 'page'}"


def font(c, name="Helvetica", size=8, color=TEXT):
    c.setFont(name, size)
    c.setFillColor(color)


def rule(c, x1, y1, x2, y2, color=FAINT, width=0.55):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x1, y1, x2, y2)


def wrap(c, text, width, name="Helvetica", size=8):
    words = ascii_clean(text).split(" ")
    lines, cur = [], ""
    for word in words:
        trial = word if not cur else f"{cur} {word}"
        if c.stringWidth(trial, name, size) <= width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def text(c, value, x, y, width, size=8.2, leading=10.2, color=TEXT, name="Helvetica", max_lines=None):
    font(c, name, size, color)
    used = 0
    for para in str(value).split("\n"):
        para = para.strip()
        if not para:
            y -= leading * 0.5
            continue
        for line in wrap(c, para, width, name, size):
            if max_lines is not None and used >= max_lines:
                c.drawString(x, y, "...")
                return y - leading
            c.drawString(x, y, line)
            y -= leading
            used += 1
    return y


def label(c, value, x, y, size=6.6):
    font(c, "Helvetica-Bold", size, ACCENT)
    c.drawString(x, y, ascii_clean(value).upper())


def title(c, value, x, y, width=CONTENT_W, size=20):
    lines = wrap(c, value, width, "Helvetica-Bold", size)
    font(c, "Helvetica-Bold", size, INK)
    for line in lines[:2]:
        c.drawString(x, y, line)
        y -= size + 4
    return y


def bullets(c, items, x, y, width, size=7.55, leading=9.4, max_items=None, min_y=BOTTOM):
    count = 0
    for item in items[:max_items or len(items)]:
        lines = wrap(c, item, width - 11, "Helvetica", size)
        for i, line in enumerate(lines):
            if y < min_y:
                font(c, "Helvetica", size, MUTED)
                c.drawString(x + 11, y, "...")
                return y - leading
            if i == 0:
                font(c, "Helvetica", size, ACCENT)
                c.drawString(x, y, "-")
            font(c, "Helvetica", size, TEXT)
            c.drawString(x + 11, y, line)
            y -= leading
        y -= 1.5
        count += 1
    return y


def section(c, heading, body, x, y, width, size=7.65, min_y=BOTTOM):
    label(c, heading, x, y)
    y -= 17
    if isinstance(body, str):
        return text(c, body, x, y, width, size=size, leading=size + 2.2, min_lines=None if False else None)
    return bullets(c, body, x, y, width, size=size, leading=size + 1.9, min_y=min_y)


def fit_image(src, w_pt, h_pt, mode="cover", bg=(251, 251, 250), scale=2.7):
    src = Path(src)
    key = re.sub(r"[^A-Za-z0-9_.-]", "_", src.stem)
    out = CACHE_DIR / f"portrait-{key}-{int(w_pt)}x{int(h_pt)}-{mode}.jpg"
    if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
        return out

    target_w = max(1, int(w_pt * scale))
    target_h = max(1, int(h_pt * scale))
    img = Image.open(src)
    img = ImageOps.exif_transpose(img)
    if img.mode in ("RGBA", "LA"):
        base = Image.new("RGB", img.size, bg)
        base.paste(img, mask=img.split()[-1])
        img = base
    else:
        img = img.convert("RGB")

    if mode == "contain":
        img.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)
        base = Image.new("RGB", (target_w, target_h), bg)
        base.paste(img, ((target_w - img.width) // 2, (target_h - img.height) // 2))
        img = base
    else:
        sr = img.width / img.height
        dr = target_w / target_h
        if sr > dr:
            nw = int(img.height * dr)
            left = (img.width - nw) // 2
            img = img.crop((left, 0, left + nw, img.height))
        else:
            nh = int(img.width / dr)
            top = (img.height - nh) // 2
            img = img.crop((0, top, img.width, top + nh))
        img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    img.save(out, "JPEG", quality=92, optimize=True)
    return out


def image(c, src, x, y, w, h, caption="", mode="cover", bg=(251, 251, 250), border=False):
    if not src or not (ASSET / src).exists():
        c.setFillColor(SOFT)
        c.rect(x, y, w, h, fill=1, stroke=0)
        font(c, "Helvetica", 7.5, MUTED)
        c.drawCentredString(x + w / 2, y + h / 2, "visual unavailable")
    else:
        if border:
            c.setStrokeColor(FAINT)
            c.setLineWidth(0.5)
            c.rect(x, y, w, h, fill=0, stroke=1)
        p = fit_image(ASSET / src, w, h, mode=mode, bg=bg)
        c.drawImage(ImageReader(str(p)), x, y, w, h)
    if caption:
        cap_y = y - 9
        font(c, "Helvetica", 6.45, MUTED)
        for line in wrap(c, caption, w, "Helvetica", 6.45)[:2]:
            c.drawString(x, cap_y, line)
            cap_y -= 7.0


def pills(c, items, x, y, width, size=6.8):
    font(c, "Helvetica", size, MUTED)
    line = ""
    lines = []
    for item in items:
        trial = item if not line else f"{line} / {item}"
        if c.stringWidth(trial, "Helvetica", size) <= width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = item
    if line:
        lines.append(line)
    for line in lines[:3]:
        c.drawString(x, y, line)
        y -= size + 3
    return y


def page_header(c, page, section_name="Selected Hardware Projects"):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    font(c, "Helvetica", 6.8, MUTED)
    c.drawString(M, H - 28, section_name)
    c.drawRightString(W - M, H - 28, f"Aadit Kannan / {page}")
    rule(c, M, H - 42, W - M, H - 42)


def finish(c):
    c.showPage()


def project_title(c, page, name, date, category, subtitle, bookmark_label=None):
    key = dest_key(bookmark_label or name)
    c.bookmarkPage(key)
    try:
        c.addOutlineEntry(ascii_clean(bookmark_label or name), key, level=0, closed=False)
    except ValueError:
        pass
    page_header(c, page)
    y = title(c, name, M, H - 70, CONTENT_W, size=19.5)
    font(c, "Helvetica", 7.4, MUTED)
    c.drawString(M, y - 3, f"{date} / {category}")
    y -= 30
    y = text(c, subtitle, M, y, CONTENT_W, size=8.4, leading=10.4, max_lines=4)
    return y - 8


def callout(c, label_text, x1, y1, x2, y2, right=False):
    c.setStrokeColor(ACCENT)
    c.setLineWidth(0.55)
    c.line(x1, y1, x2, y2)
    font(c, "Helvetica-Bold", 6.2, ACCENT)
    if right:
        c.drawRightString(x1 - 4, y1 - 1, ascii_clean(label_text))
    else:
        c.drawString(x1 + 4, y1 - 1, ascii_clean(label_text))


def two_text_columns(c, left_title, left_items, right_title, right_items, y_top=232):
    gutter = 26
    col_w = (CONTENT_W - gutter) / 2
    label(c, left_title, M, y_top)
    bullets(c, left_items, M, y_top - 18, col_w, size=7.4, leading=9.15, min_y=BOTTOM)
    label(c, right_title, M + col_w + gutter, y_top)
    bullets(c, right_items, M + col_w + gutter, y_top - 18, col_w, size=7.4, leading=9.15, min_y=BOTTOM)


def cover(c):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    font(c, "Helvetica-Bold", 27, INK)
    c.drawString(M, H - 86, "Aadit Kannan")
    font(c, "Helvetica-Bold", 15, INK)
    c.drawString(M, H - 120, "Selected Hardware Projects")
    text(c, "Actuators, HV accumulator hardware, PCB test instrumentation, GD&T/manufacturing, and robot mechanisms. Full portfolio at aaditkannan.com/projects.", M, H - 146, 372, size=9.2, leading=11.2)
    image(c, "photo.jpg", W - M - 92, H - 178, 92, 92, "", "cover")

    contact_y = H - 222
    label(c, "Contact", M, contact_y)
    rows = [
        ("website", "aaditkannan.com", "https://aaditkannan.com"),
        ("projects", "aaditkannan.com/projects", "https://aaditkannan.com/projects"),
        ("email", "aaditkannan[at]berkeley[dot]edu", "https://aaditkannan.com"),
        ("github", "github.com/aaditkannan", "https://github.com/aaditkannan"),
        ("linkedin", "linkedin.com/in/aaditkannan", "https://www.linkedin.com/in/aaditkannan"),
    ]
    x_positions = [M, M + 170, M + 340]
    y = contact_y - 22
    for i, (k, v, url) in enumerate(rows):
        x = x_positions[i % 3]
        yy = y - 28 * (i // 3)
        font(c, "Helvetica-Bold", 6.2, MUTED)
        c.drawString(x, yy + 12, k.upper())
        font(c, "Helvetica", 8.1, INK)
        c.drawString(x, yy, v)
        c.linkURL(url, (x, yy - 3, x + 150, yy + 11), relative=0)

    idx_y = H - 332
    label(c, "Portfolio Contents", M, idx_y)
    projects = [
        ("Wolfrom Architecture", 2),
        ("Wolfrom Prototype + Metal Revision", 3),
        ("Formula Electric 588V Accumulator", 4),
        ("Accumulator Materials + Validation", 5),
        ("HV Nanosecond Pulse Generator PCB", 6),
        ("Pulse Generator V1 Learning", 7),
        ("Custom Toolbox Design + Manufacturing", 8),
        ("FIRST Robotics Hardware", 9),
        ("Tools + Methods", 10),
    ]
    col_w = 244
    split = 5
    for i, (name, page_no) in enumerate(projects):
        col = 0 if i < split else 1
        row = i if i < split else i - split
        x = M + col * (col_w + 28)
        yy = idx_y - 28 - row * 28
        rule(c, x, yy + 10, x + col_w, yy + 10, SOFT)
        font(c, "Helvetica-Bold", 7.7, INK)
        c.drawString(x, yy, f"{page_no:02d}")
        font(c, "Helvetica", 7.9, INK)
        c.drawString(x + 27, yy, name)
        c.linkRect("", dest_key(name), (x, yy - 5, x + col_w, yy + 12), relative=0, thickness=0)

    image(c, "wolfrom-render-section.jpg", M, 74, 154, 88, "Actuator section render", "contain", bg=(255, 255, 255))
    image(c, "accumimg.png", M + 181, 74, 154, 88, "Accumulator attic CAD", "cover")
    image(c, "ns-pulse-schematic-thumbnail.png", M + 362, 74, 154, 88, "Pulse-generator schematic", "contain", bg=(250, 248, 243))
    finish(c)


def wolfrom_architecture(c):
    y = project_title(
        c, 2, "Wolfrom Compound Planetary Actuator", "May 2026 - Present", "Robotics Hardware",
        "3-stage 50:1 compound Wolfrom actuator for backdrivable robotic joints, built around compact packaging, reduced circulating power losses, split-gear preloading, and prototype-to-metal validation.",
        bookmark_label="Wolfrom Architecture"
    )
    img_y, img_h = 306, 310
    image(c, "wolfrom-render-section.jpg", M, img_y, CONTENT_W, img_h, "CAD section showing the compact axial stack: pre-reduction stage, compound planets, fixed ring, output ring, bearing support, output hub, and motor interface.", "contain", bg=(255, 255, 255))
    two_text_columns(
        c,
        "Designed",
        [
            "Full actuator stackup: sun, compound planets, fixed ring, output ring, carrier, bearings, shafts, and output hub.",
            "3-stage compound layout in one compact axial package instead of stacking multiple conventional planetary gearboxes.",
            "Split output ring, bolt access, dowel alignment, bearing support, preload strategy, and assembly order.",
            "Built FDM prototypes to validate meshing, stack height, bearing placement, and assembly before moving into metal hardware.",
        ],
        "Gearbox Notes",
        [
            "Current tooth counts give 555/11, or about 50.45:1 reduction.",
            "Maximized pre-reduction to reduce circulating power losses in the Wolfrom differential stage.",
            "Targeting 80% efficiency and near-zero backlash through friction reduction, bearing/mesh choices, and split-gear preloading.",
            "Primary loss paths are ring-mesh friction, planet bearing drag, load sharing, and rough printed tooth surfaces.",
        ],
        y_top=266,
    )
    finish(c)


def wolfrom_status(c):
    y = project_title(
        c, 3, "Wolfrom Compound Planetary Actuator", "May 2026 - Present", "Robotics Hardware / Prototype + Metal Revision",
        "FDM prototypes are being used to validate meshing, stack height, bearing support, output-ring splitting, and assembly sequence while the CNC aluminum / wire-EDM revision and dyno setup are developed.",
        bookmark_label="Wolfrom Prototype + Metal Revision"
    )
    image(c, "wolfrom-cover.jpg", M, 486, 248, 164, "Printed prototype used for gear mesh, bearing placement, and stack-height checks.", "cover")
    image(c, "wolfrom-bench.jpg", M + 268, 486, 248, 164, "Bench assembly and fit-checking during gear timing and stackup validation.", "cover")
    image(c, "wolfrom-render-face.jpg", M, 286, 248, 144, "Top view: three compound planets, output ring, fastener pattern, and center sun.", "contain", bg=(255, 255, 255))
    image(c, "wolfrom-render-side.jpg", M + 268, 286, 248, 144, "Side view: plate stack, motor interface, standoffs, and axial package.", "contain", bg=(255, 255, 255))
    two_text_columns(
        c,
        "Current Prototype",
        [
            "Built and fit-checked FDM actuator prototypes for gear meshing, assembly access, and stack alignment.",
            "Working on split-gear preload to reduce backlash; no final backlash number yet.",
            "Printed gears are being used for geometry and assembly validation, not final load-rated actuator performance.",
        ],
        "Metal Revision + Test",
        [
            "Simulating gear macro-geometry in KISSsoft, including profile shifts and tip relief.",
            "Manufacturing CNC aluminum structure with wire-EDM ring gears for the next hardware revision.",
            "Building dyno setup for torque, efficiency, breakaway torque, backdrive feel, and load-behavior testing.",
        ],
        y_top=228,
    )
    finish(c)


def formula_packaging(c):
    project_title(
        c, 4, "Formula Electric 588V Accumulator", "Sep 2025 - Present", "High-Voltage Packaging",
        "Accumulator attic and enclosure work for Berkeley Formula Electric, integrating HV electronics, busbars, insulation, cooling, water sealing, and service access inside a constrained pack volume."
    )
    image(c, "accumimg.png", M, 372, CONTENT_W, 220, "588V accumulator CAD showing the HV electronics attic, fan wall, service access, and enclosure packaging.", "contain", bg=(255, 255, 255))
    image(c, "accumsa.png", M, 204, 248, 112, "Electronics attic layout: board, connector, busbar, and mechanical interface packaging.", "contain", bg=(255, 255, 255))
    image(c, "img3.png", M + 268, 204, 248, 112, "Internal attic CAD view with board/connector access and enclosure clearances.", "contain", bg=(255, 255, 255))
    two_text_columns(
        c,
        "Built",
        [
            "Packaged the HV attic: boards, busbars, fans, fasteners, service interfaces, and inspection access.",
            "Cut attic mass by 18% while keeping clearances, cooling paths, and fastener access workable.",
            "Designed around a 588V pack, water sealing, dielectric isolation, and SES/ESF review needs.",
        ],
        "Constraints",
        [
            "Busbar material and package design for 80A peak discharge without making the attic impossible to service.",
            "FSAE load cases, HV isolation, rain-test sealing, airflow, and board access all compete for the same space.",
            "Transparent/inspectable surfaces matter because serviceability is part of safety.",
        ],
        y_top=154,
    )
    finish(c)


def formula_validation(c):
    project_title(
        c, 5, "Formula Electric 588V Accumulator", "Sep 2025 - Present", "High-Voltage Packaging / Materials + Validation",
        "Materials, manufacturing methods, and validation checks for turning the accumulator CAD into hardware that can meet competition inspection and reliability requirements.",
        bookmark_label="Accumulator Materials + Validation"
    )
    image(c, "accumimg.png", M, 492, 248, 156, "Overall accumulator CAD context: attic, enclosure, service access, and internal packaging.", "contain", bg=(255, 255, 255))
    image(c, "img2.png", M + 268, 492, 248, 156, "Top-down attic CAD view used to check electronics layout and access.", "contain", bg=(255, 255, 255))
    image(c, "accumsa.png", M, 282, CONTENT_W, 154, "Detailed accumulator subassembly view for board, connector, and internal support packaging.", "contain", bg=(255, 255, 255))
    two_text_columns(
        c,
        "Manufacturing Plan",
        [
            "Laser-cut aluminum panels, TIG welded structure, waterjet polycarbonate floor, and waterjet neoprene gasket.",
            "Polycarbonate floor gives electrical isolation and visual inspection without disassembling the pack.",
            "Nomex 410 for dielectric strength, temperature margin, and flame resistance near HV components.",
        ],
        "Checks",
        [
            "FEA against 40g lateral, 40g longitudinal, and 20g vertical load cases.",
            "Checked gasket compression, water ingress, dielectric margin, service access, fastener access, and fan airflow together.",
            "Target gates include 1500V AC dielectric testing and IP65-style water ingress testing before event use.",
        ],
        y_top=232,
    )
    finish(c)


def ramesh_lab(c, page=6):
    project_title(
        c, page, "Ramesh Lab: Complex-Oxide Thin Films", "Jan 2026 - Present", "Research",
        "Research context for my Ramesh Lab work: BiFeO3 and related complex-oxide thin films for memory/logic devices beyond conventional DRAM and CMOS."
    )
    image(c, "IMG_4508.JPG", M, 460, 160, 156, "Lab/growth workflow context.", "cover")
    image(c, "IMG_4507.JPG", M + 178, 460, 160, 156, "Thin-film process and sample handling context.", "cover")
    image(c, "IMG_4509.JPG", M + 356, 460, 160, 156, "Experimental hardware context from lab work.", "cover")
    two_text_columns(
        c,
        "Learning + Growth Work",
        [
            "Reading Lines and Glass for the physics base: polarization, domains, coercive fields, hysteresis, dielectric response, strain, and defects.",
            "Learning substrate prep, solvent cleaning, annealing, step-terrace control, PLD growth, and RHEED monitoring.",
            "Practicing the deposition workflow with Donald's guidance: oxygen pressure, plume shape, target/substrate geometry, and temperature stability.",
            "Connecting growth choices to post-growth film and electrical characterization results.",
        ],
        "Connected Projects",
        [
            "HV Nanosecond Pulse Generator PCB: hardware for fast electrical characterization of oxide devices after fabrication.",
            "PLDTracker: data tool linking deposition conditions to characterization data and lab documentation.",
            "The larger loop is simple: grow films, track how they were grown, then measure how the devices switch.",
        ],
        y_top=394,
    )
    label(c, "Why It Matters", M, 136)
    text(c, "Strain, interfaces, atomic stacking order, and oxygen vacancies can create switching behavior that does not exist in a single bulk material. I am mainly trying to understand how process choices show up later in device behavior.", M, 118, CONTENT_W, size=7.8, leading=9.8, max_lines=5)
    finish(c)


def pulse_system(c, page=7):
    project_title(
        c, page, "HV Nanosecond Pulse Generator PCB", "May 2026 - Present", "Research Hardware / PCB",
        "Board for fast electrical testing of BiFeO3 devices in Ramesh Lab. The current design is moving from a first-generation microsecond pulser toward cleaner ns/us triggering, grounded coax/BNC I/O, and repeatable scope/SMU measurements."
    )
    image(c, "ns-pulse-schematic-thumbnail.png", M, 392, CONTENT_W, 244, "Current nanosecond pulse-generator schematic. Shown as the main artifact because it is the current board revision.", "contain", bg=(250, 248, 243))
    label(c, "Bench Interface", M, 332)
    text(c, "Python/RP2040 trigger -> driver and switching stage -> coax/BNC output -> device or probe station -> oscilloscope and source-measure capture.", M, 315, CONTENT_W, size=7.8, leading=9.8)
    two_text_columns(
        c,
        "Designed",
        [
            "Dual-range pulse architecture around current BFO testing near 30V, with future lower-voltage sweeps planned.",
            "GaN switching path, trigger/sync routing, grounded lab I/O, and source-measure bias interface.",
            "Layout organized around probe-station use, dummy-load bring-up, and scope visibility.",
        ],
        "Device-Side Notes",
        [
            "What matters is the voltage that actually lands across the BFO device, not just the connector setting.",
            "Measured current can mix polarization switching, leakage, dielectric capacitance, and fixture parasitics.",
            "No final rise-time, jitter, device result, or amplitude-stability claim yet; bring-up is still in progress.",
        ],
        y_top=270,
    )
    finish(c)


def pulse_board(c, page=8):
    project_title(
        c, page, "HV Nanosecond Pulse Generator PCB", "May 2026 - Present", "Research Hardware / Board + V1 Learning",
        "V1 microsecond hardware established the initial bench workflow. The current revision carries that learning into cleaner triggering, lab I/O, grounding, and measurement flow.",
        bookmark_label="Pulse Generator V1 Learning"
    )
    image(c, "pulse-v1-physical.jpg", M, 500, 220, 148, "V1 microsecond board during bench probing. Useful as a learning artifact, not the current ns revision.", "cover")
    image(c, "pulse-v1-us-layout.png", M + 244, 500, 272, 148, "V1 PCB layout used to inspect trace routing, connector placement, and returns.", "contain", bg=(24, 25, 29))
    image(c, "pulse-v1-us-render.png", M, 326, 220, 118, "V1 rendered PCB for physical integration reference.", "contain", bg=(242, 242, 246))
    image(c, "pulse-v1-us-schematic.png", M + 244, 326, 272, 118, "V1 microsecond schematic, included only as a predecessor to the current ns/us board.", "contain", bg=(250, 248, 243))
    two_text_columns(
        c,
        "V1 Exposed",
        [
            "Clip-lead power and weak lab I/O made the first board awkward around real bench equipment.",
            "Triggering needed to be tied into Python/RP2040 control, not treated as an isolated pulse node.",
            "LTspice transient work informed switching timing and V1 bring-up, while the current revision is documented through schematic/layout and bench validation artifacts.",
            "Grounding and connector strategy had to be designed into the instrument rather than left to bench improvisation.",
        ],
        "Current Revision Adds",
        [
            "Nanosecond and microsecond paths in one cleaner board.",
            "Coax/BNC-style outputs, shared sync/trigger handling, source-measure biasing, and clearer return paths.",
            "Bring-up order: rails, trigger logic, dummy loads, switching behavior, then device-side fixture measurements.",
        ],
        y_top=270,
    )
    finish(c)


def pldtracker(c, page=9):
    project_title(
        c, page, "PLDTracker (Ramesh Lab)", "Jan 2026 - Mar 2026", "Research Software",
        "A lab tool for keeping PLD runs, wafer position, growth parameters, images, and slide-deck analysis from getting scattered across notes and folders."
    )
    image(c, "Screenshot 2026-03-13 000052.png", M, 470, CONTENT_W, 168, "Dashboard and deposition data explorer for tracking thin-film growth records.", "contain", bg=(255, 255, 255))
    image(c, "Screenshot 2026-03-13 000118.png", M, 284, 248, 126, "Filtering and data exploration interface.", "contain", bg=(255, 255, 255))
    image(c, "Screenshot 2026-03-13 000132.png", M + 268, 284, 248, 126, "Analysis-image/document workflow tied back to deposition records.", "contain", bg=(255, 255, 255))
    two_text_columns(
        c,
        "Implemented",
        [
            "Logs substrate, target material, temperature, oxygen pressure, laser fluence, deposition time, and wafer disk position.",
            "Links characterization figures, slide-deck figures, and camera captures to specific runs.",
            "Dashboard for filtering records and plotting parameter trends with connected datapoints and fit lines.",
        ],
        "Research Value",
        [
            "Replaces scattered notes, spreadsheets, screenshots, and slide decks with searchable experiment metadata.",
            "Makes it easier to ask whether a growth-condition change explains a film-structure or device-property change.",
            "Includes a SolidWorks camera mount path for substrate-position monitoring at the PLD chamber.",
        ],
        y_top=232,
    )
    finish(c)


def toolbox(c, page=10):
    project_title(
        c, page, "Custom Toolbox Design + Manufacturing", "Jan 2026 - May 2026", "Mechanical Design",
        "Mechanical design project centered on drawings, datums, tolerances, fabrication choices, and fit-up inspection for a laser-cut/FDM toolbox assembly."
    )
    image(c, "toolbox-assembly-drawing.png", M, 516, 248, 122, "Assembly drawing defining lid, latch, hinge, body, and insert interfaces.", "contain", bg=(250, 248, 243))
    image(c, "toolbox-bottom-walls-drawing.png", M + 268, 516, 248, 122, "Bottom wall drawing with datums, critical dimensions, and positional tolerance callouts.", "contain", bg=(250, 248, 243))
    thumb_w = 158
    image(c, "toolbox-top-walls-drawing.png", M, 366, thumb_w, 94, "Top wall drawing for lid/body alignment.", "contain", bg=(250, 248, 243))
    image(c, "toolbox-bottom-walls-rev-drawing.png", M + 179, 366, thumb_w, 94, "Revised bottom wall drawing with updated hole pattern control.", "contain", bg=(250, 248, 243))
    image(c, "toolbox-gridfinity-base-drawing.png", M + 358, 366, thumb_w, 94, "Gridfinity insert drawing with pocket and fastener tolerances.", "contain", bg=(250, 248, 243))
    image(c, "toolbox-prototype-closed.png", M, 238, 248, 82, "Closed prototype fit-up with hinges, latches, handle, and fasteners.", "cover")
    image(c, "toolbox-prototype-open.png", M + 268, 238, 248, 82, "Open prototype showing interior fit-up, inserts, hinge clearance, and lid alignment.", "cover")
    two_text_columns(
        c,
        "Designed",
        [
            "Production-style drawings using ASME Y14.5-2018 GD&T conventions.",
            "Datum scheme, position tolerances, fastener clearances, hinge/latch interfaces, and lid closure.",
            "Laser-cut plywood body with FDM/Gridfinity-style inserts and visible fastened joints.",
        ],
        "Inspected",
        [
            "Fit-up checked with calipers, fasteners/gauge pins, squareness checks, lid closure, and hinge/latch alignment.",
            "Prototype used laser-cut plywood and FDM inserts; the engineering focus was drawing release, datum strategy, tolerancing, fabrication, and fit-up inspection.",
            "Prototype photos show the fabricated assembly used for hinge, latch, handle, fastener, and interior fit-up checks.",
        ],
        y_top=184,
    )
    finish(c)


def first_overview(c, page=11):
    project_title(
        c, page, "FIRST Robotics Hardware", "Aug 2021 - Jun 2025", "Robotics Hardware / Controls",
        "Four seasons of FTC hardware: 8 robots, 500+ part CAD assemblies, mechanism iteration under match constraints, Java controls, and three Robot Design Awards."
    )
    image(c, "newiamge.png", M, 478, 248, 158, "INTO THE DEEP robot CAD with drivetrain, active intake, transfer path, lift, and end effector.", "cover")
    image(c, "Deja_Vu_Bot_Assemble_Version_1_v4_v1112.png", M + 268, 478, 248, 158, "CENTERSTAGE robot CAD assembly with pixel scoring mechanisms.", "cover")
    image(c, "zensim.png", M, 290, 248, 128, "FTC bracket FEA used to check stress paths around arm/hang loading and fastener interfaces.", "contain", bg=(255, 255, 255))
    image(c, "intake.png", M + 268, 290, 248, 128, "High-iteration intake subsystem CAD from Deja Vu INTO THE DEEP.", "cover")
    two_text_columns(
        c,
        "Built Across Seasons",
        [
            "Mecanum drivetrains, active intakes, transfer paths, arms/lifts, claws, end effectors, hang mechanisms, and scoring systems.",
            "FEA on arm pivots, hang brackets, and custom aluminum/printed parts to check stress, safety factor, deflection, and fastener load paths.",
            "Parts made through printing, laser-cut plates, CNC aluminum, and normal shop fabrication.",
        ],
        "Controls-Aware Design",
        [
            "Java TeleOp with field-centric mecanum, encoder PID loops, mechanism sequencing, driver feedback, and autonomous routines.",
            "Hardware and driver code were tuned together so mechanisms remained usable under match timing, driver-control, and service constraints.",
            "Mentored 30+ members in CAD, Java, mechanism iteration, and manufacturing workflow.",
        ],
        y_top=232,
    )
    finish(c)


def generic_project(c, page, data):
    project_title(c, page, data["title"], data["date"], data["category"], data["subtitle"])
    imgs = data.get("images", [])
    if len(imgs) >= 2:
        image(c, imgs[0][0], M, 492, 248, 148, imgs[0][1], imgs[0][2], bg=imgs[0][3] if len(imgs[0]) > 3 else (251, 251, 250))
        image(c, imgs[1][0], M + 268, 492, 248, 148, imgs[1][1], imgs[1][2], bg=imgs[1][3] if len(imgs[1]) > 3 else (251, 251, 250))
    elif len(imgs) == 1:
        image(c, imgs[0][0], M, 448, CONTENT_W, 192, imgs[0][1], imgs[0][2], bg=imgs[0][3] if len(imgs[0]) > 3 else (251, 251, 250))
    else:
        label(c, "No Project Image Available", M, 610)
        text(c, "This page is included for completeness, but the website does not currently have a strong visual asset for it.", M, 592, CONTENT_W, size=8, leading=10)

    if len(imgs) >= 4:
        image(c, imgs[2][0], M, 316, 248, 116, imgs[2][1], imgs[2][2], bg=imgs[2][3] if len(imgs[2]) > 3 else (251, 251, 250))
        image(c, imgs[3][0], M + 268, 316, 248, 116, imgs[3][1], imgs[3][2], bg=imgs[3][3] if len(imgs[3]) > 3 else (251, 251, 250))
        y_top = 266
    else:
        y_top = 384 if len(imgs) <= 1 else 440

    two_text_columns(c, data["left_title"], data["left"], data["right_title"], data["right"], y_top=y_top)
    label(c, "Tools", M, 74)
    pills(c, data["tools"], M, 58, CONTENT_W, size=6.9)
    finish(c)


GENERIC_PROJECTS = [
    {
        "title": "Deja Vu - INTO THE DEEP",
        "date": "Aug 2024 - Jun 2025",
        "category": "FTC Robotics / Hardware Lead",
        "subtitle": "500+ part CAD robot for sample pickup, basket scoring, specimen scoring, and endgame hang. This was a full season of making mechanisms survive real driver practice and matches.",
        "images": [
            ("newiamge.png", "Full robot CAD with intake, transfer, lift, end effector, drivetrain, and hang packaging.", "cover"),
            ("intake.png", "High-iteration intake mechanism CAD.", "cover"),
            ("deja1.png", "End-effector/linkage packaging detail.", "contain", (255, 255, 255)),
            ("dejavubot-removebg-preview.png", "Physical robot reference for mechanism packaging and service access.", "contain", (255, 255, 255)),
        ],
        "left_title": "Designed",
        "left": [
            "Owned mechanical design, CAD management, and manufacturing coordination for FTC #13216.",
            "Four intake revisions: passive funnel, surgical-tubing roller, dual-stage roller, then a simpler high-speed roller geometry.",
            "Designed mecanum drivetrain, active intake, transfer pathway, arm/lift, end effector, and hang hardware.",
        ],
        "right_title": "Technical Work",
        "right": [
            "FEA on arm pivot and hang brackets; checked stress, safety factor, and deflection against mechanism travel.",
            "Manufactured with Markforged nylon, Prusa prototypes, laser-cut polycarbonate/Delrin, CNC aluminum, and shop tools.",
            "Wrote Java TeleOp with field-centric drive, arm/lift PID, intake sequencing, and driver rumble feedback.",
        ],
        "tools": ["SolidWorks", "FEA", "Java", "FTC SDK", "PID Control", "Mecanum Kinematics", "Laser Cutting", "Markforged"],
    },
    {
        "title": "Deja Vu - CENTERSTAGE",
        "date": "Aug 2023 - Jun 2024",
        "category": "FTC Robotics / Hardware Lead",
        "subtitle": "CENTERSTAGE robot built around dual-pixel handling, backdrop scoring, vision alignment, and driver-controlled mechanism sequencing.",
        "images": [
            ("Deja_Vu_Bot_Assemble_Version_1_v4_v1112.png", "Full robot CAD assembly for CENTERSTAGE.", "cover"),
            ("dejapp.png", "Robot/app or subsystem reference from the season.", "contain", (255, 255, 255)),
            ("IMG_2714.png", "Physical robot/build context from the season.", "cover"),
        ],
        "left_title": "Designed",
        "left": [
            "Compliant TPU claw fingers, passive spring-loaded grip, and servo-actuated release for hexagonal pixels.",
            "Dual-pixel capacity to cut cycles to the backdrop; geometry had to grip without blocking the vision workflow.",
            "Robot packaging around mecanum drive, arm presets, claw actuation, and paper-airplane endgame launcher.",
        ],
        "right_title": "Controls + Results",
        "right": [
            "AprilTag-based autonomous alignment and camera-based pixel-position feedback.",
            "Java TeleOp with speed curves, arm presets, claw control, drone launcher arming, and intake/transfer coordination.",
            "Qualified for NorCal regional championship with very few mechanical failures in matches.",
        ],
        "tools": ["SolidWorks", "Java", "FTC SDK", "AprilTags", "OpenCV", "PID Control", "Mecanum Kinematics"],
    },
    {
        "title": "Zenith - POWERPLAY",
        "date": "Aug 2022 - Jun 2023",
        "category": "FTC Robotics / Team Lead",
        "subtitle": "POWERPLAY robot built around a fast linear lift, cone-centering claw, mecanum drive, and autonomous positioning.",
        "images": [
            ("zenithbottt.png", "POWERPLAY robot CAD with lift and cone-scoring mechanism.", "contain", (255, 255, 255)),
            ("zensim.png", "Mechanism/simulation reference for the season.", "cover"),
            ("zensim22.png", "Additional CAD/simulation view.", "cover"),
            ("zenithnot-removebg-preview.png", "Robot or subsystem image from Zenith.", "contain", (255, 255, 255)),
        ],
        "left_title": "Built",
        "left": [
            "Linear lift with 30+ inches of travel, sub-1.5s extension target, and about 200g carried load.",
            "String-rigged lift using dyneema and spool geometry balanced against motor torque and cycle time.",
            "Three claw revisions, landing on internal centering guides before gripping.",
        ],
        "right_title": "Controls + Lessons",
        "right": [
            "Java TeleOp with mecanum kinematics, lift PID, and speed scaling modes.",
            "Autonomous used OpenCV signal-sleeve detection, dead-wheel odometry, and IMU heading correction.",
            "The ZenLender parts spreadsheet started here and later turned into Inventry.",
        ],
        "tools": ["Onshape", "Java", "FTC SDK", "OpenCV", "Dead-Wheel Odometry", "PID Control", "String Rigging"],
    },
    {
        "title": "Inventry",
        "date": "Jun 2025 - Dec 2025",
        "category": "Robotics Software",
        "subtitle": "Robotics-parts inventory and lending system for FTC teams. It came from the very real problem of teams needing parts faster than shipping can deliver them.",
        "images": [
            ("homepageinve.png", "Inventry landing/interface screenshot.", "contain", (255, 255, 255)),
            ("invends.png", "Inventory/product interface screenshot.", "contain", (255, 255, 255)),
        ],
        "left_title": "Implemented",
        "left": [
            "Inventory management for parts, quantities, condition, team ownership, and search.",
            "Part lending network with distance matching, urgent requests, and lender reputation.",
            "Marketplace path for robotics components, with team verification through FIRST data.",
        ],
        "right_title": "Technical Work",
        "right": [
            "React/TypeScript frontend, Node/Express backend, PostgreSQL data model, Vercel/Railway hosting.",
            "Invoice parsing with Tesseract OCR and GPT-4 structured extraction for part numbers, quantities, and prices.",
            "Weekly scrapers for GoBilda, REV, ServoCity, and AndyMark with 3,000+ SKU search data.",
        ],
        "tools": ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Tesseract OCR", "Web Scraping", "OAuth 2.0"],
    },
    {
        "title": "Pear Volunteering",
        "date": "Aug 2023 - May 2025",
        "category": "Web Platform",
        "subtitle": "Volunteer platform for students, organizers, and administrators who needed event signup and verified hour logs to stop living in spreadsheets.",
        "images": [
            ("pearpage.png", "Pear volunteer/event platform screenshot.", "contain", (255, 255, 255)),
            ("pearis.png", "Volunteer interface or organizer screen.", "contain", (255, 255, 255)),
            ("pearrr.png", "Supporting platform screenshot.", "contain", (255, 255, 255)),
            ("pearvoluyn.png", "Volunteer workflow screenshot.", "contain", (255, 255, 255)),
        ],
        "left_title": "Implemented",
        "left": [
            "Student event browsing, organizer event creation, administrator verification, and hour-log workflows.",
            "Student ID validation, schedule-conflict checks, capacity updates, organizer notifications, and QR check-in.",
            "Auto-generated verification letters as PDFs for documented service hours.",
        ],
        "right_title": "Technical Work",
        "right": [
            "Wix Velo backend logic, custom JavaScript, webhook integrations, and role-based access.",
            "Async webhook queue for high-volume signup events that could fill 50+ spots quickly.",
            "Privacy constraint: student contact data stayed protected and communication flowed through the platform.",
        ],
        "tools": ["Wix Velo", "JavaScript", "Webhook Queues", "QR Check-In", "PDF Generation", "Role-Based Access", "Data Privacy"],
    },
    {
        "title": "Leitmotif",
        "date": "Mar 2026",
        "category": "Hackathon / Accessibility Software",
        "subtitle": "YC x DeepMind hackathon winner. Real-time generative music interface that assigns musical motifs to people in a scene.",
        "images": [
            ("Screenshot 2026-03-10 172428.png", "Leitmotif web/app interface screenshot.", "contain", (255, 255, 255)),
            ("IMG_0286.jpg", "Hackathon or demo context.", "cover"),
            ("IMG_4613.jpeg", "Project/demo context from the hackathon.", "cover"),
        ],
        "left_title": "Implemented",
        "left": [
            "Camera loop sends frames to Gemini vision, extracts scene/person state, then updates the music engine.",
            "Each person gets a persistent musical motif with entry and exit cues.",
            "Crossfades emotional-state changes over 4-6 seconds so scene updates do not sound abrupt.",
        ],
        "right_title": "Architecture",
        "right": [
            "Two-server split: camera analysis and real-time music orchestration decoupled for different latency profiles.",
            "Gemini 2.5 Flash for vision/orchestration, Lyria RealTime for PCM audio generation, Supabase for persistence.",
            "React Native companion app with monitor, contacts, visualizer, and settings views.",
        ],
        "tools": ["TypeScript", "Node.js", "React Native", "Gemini API", "Lyria Realtime", "Supabase", "Computer Vision"],
    },
    {
        "title": "Atlas SMR",
        "date": "Oct 2025 - Jan 2026",
        "category": "Research / Software",
        "subtitle": "Interactive tool and AP Research capstone evaluating hybrid Small Modular Reactor plus solar feasibility for rural energy applications.",
        "images": [
            ("atmaslet.png", "Atlas SMR interface screenshot.", "contain", (255, 255, 255)),
            ("atmas.png", "Map/data visualization view for candidate sites.", "contain", (255, 255, 255)),
            ("smrbuilder.png", "Scenario builder interface.", "contain", (255, 255, 255)),
            ("smsad.png", "SMR analysis/dashboard view.", "contain", (255, 255, 255)),
        ],
        "left_title": "Implemented",
        "left": [
            "Interactive platform pulling NRC, EIA, and USGS/seismic datasets.",
            "Displays 89 operating reactors, 13 shutdown facilities, and 119 candidate sites.",
            "Timeline scrubber from 2010 to 2050 to show status shifts with license expirations.",
        ],
        "right_title": "Analysis",
        "right": [
            "Weighted site-viability scoring for population, seismic distance, cooling-water proximity, and grid capacity.",
            "Scenario builder for 50-300 MWe modules, 1-12 modules/site, deployment year, and hybrid solar contribution.",
            "Prototype visualization only; actual site selection requires EIS and NRC licensing work.",
        ],
        "tools": ["Web Dev", "GIS", "Energy Modeling", "Data Visualization", "Nuclear Policy Research"],
    },
    {
        "title": "Construction Acclimation",
        "date": "Oct 2022 - Apr 2023",
        "category": "Hardware / Data Logging",
        "subtitle": "$47 concrete-curing temperature/humidity probe and dashboard prototype. The goal was a cheaper way to log curing conditions and flag bad acclimation data.",
        "images": [
            ("IMG_0297.png", "Probe prototype hardware.", "cover"),
            ("IMG_0313.png", "Electronics/enclosure or dashboard context.", "cover"),
        ],
        "left_title": "Built",
        "left": [
            "Arduino Nano, DHT22, DS18B20, RTC, MicroSD logging, LiPo battery, fans, and PETG enclosure.",
            "Logged readings every 5 minutes with redundant temperature measurement.",
            "Client-side dashboard for CSV upload, trend plotting, out-of-range flags, and PDF reporting.",
        ],
        "right_title": "Tested",
        "right": [
            "Compared against a calibrated Humboldt H-4210 commercial unit for 14 days.",
            "Temperature deviation about +/-0.8C, humidity about +/-3.2%, and 4,028/4,032 readings captured.",
            "Presented to City of Palo Alto officials; certification, liability, and durability were still open issues.",
        ],
        "tools": ["Arduino Nano", "DHT22", "DS18B20", "RTC", "MicroSD", "Chart.js", "PETG Enclosure"],
    },
    {
        "title": "Beachsweep",
        "date": "Mar 2023",
        "category": "Hackathon / Drone Software",
        "subtitle": "24-hour concept pairing autonomous drone beach surveillance with a volunteer coordination platform.",
        "images": [
            ("beas2.png", "BeachSweep interface or drone concept view.", "contain", (255, 255, 255)),
            ("beas3.png", "Volunteer/map workflow screenshot.", "contain", (255, 255, 255)),
            ("beas4.png", "Supporting platform view.", "contain", (255, 255, 255)),
            ("beas5.png", "Additional prototype/simulation view.", "contain", (255, 255, 255)),
        ],
        "left_title": "Designed",
        "left": [
            "Custom quadcopter concept for coastal survey work with downward camera and solar charging dock idea.",
            "Computer-vision loop to detect bottles, bags, fishing nets, cigarette butts, and general litter.",
            "GPS-tagged trash map connected to cleanup-event creation and volunteer signup.",
        ],
        "right_title": "Limitations",
        "right": [
            "Initial CV accuracy around 78% on the test dataset.",
            "Concept was not deployed; real system would need FAA, local government, field validation, and more robust models.",
            "Useful project because it connected hardware concept, CV pipeline, and civic workflow in one loop.",
        ],
        "tools": ["YOLO", "Drone CAD", "GPS Mapping", "Computer Vision", "GitHub Pages", "Solar Charging Concept"],
    },
    {
        "title": "Zenith - FREIGHT FRENZY",
        "date": "Aug 2021 - Jun 2022",
        "category": "FTC Robotics / First Season",
        "subtitle": "First FTC season on Zenith #20424. This was where I learned CAD, basic manufacturing, Java control, and how robot subsystems actually go together.",
        "images": [
            ("haulrobot-removebg-preview.png", "Freight Frenzy robot image.", "contain", (255, 255, 255)),
            ("haulrobot.png", "Freight Frenzy robot CAD/build reference.", "contain", (255, 255, 255)),
        ],
        "left_title": "Learned",
        "left": [
            "Onshape constraints, simple brackets, subassemblies, and complete robot packaging basics.",
            "Drill press, bandsaw, 3D printing, hole placement, print warping, and basic shop workflow.",
            "Motor-controller wiring and basic mechanism integration through a functioning FTC robot.",
        ],
        "right_title": "Software",
        "right": [
            "Java gamepad input handling, arm/intake motor control, encoder-based autonomous moves, and carousel timing.",
            "Implemented simple encoder-based autonomous routines and mechanism controls that became the foundation for later PID/state-machine work.",
            "Robot scored freight, delivered ducks, and parked successfully in matches.",
        ],
        "tools": ["Onshape", "Java", "FTC SDK", "Encoder Autonomous", "3D Printing", "Drill Press", "Bandsaw"],
    },
    {
        "title": "Serenity - FREIGHT FRENZY",
        "date": "Aug 2021 - Jun 2022",
        "category": "FTC Robotics / Team Lead",
        "subtitle": "Led a newer FTC team while also learning on Zenith. The robot was simple, but the team-process lessons mattered.",
        "images": [
            ("View_recent_photos-removebg-preview.png", "Serenity robot/team visual asset from the website.", "contain", (255, 255, 255)),
        ],
        "left_title": "Built",
        "left": [
            "Tank-drive robot with basic arm for freight placement, passive intake with compliant wheels, and carousel spinner.",
            "Design priority was reliability and match completion rather than maximum mechanism complexity.",
            "Competed in league meets with a functioning robot for a young team.",
        ],
        "right_title": "Team Process",
        "right": [
            "Started weekly design reviews, shared CAD workspace conventions, manufacturing priority lists, and notebook assignments.",
            "Mentoring while still learning forced me to explain CAD, build, and competition decisions clearly.",
            "This was the first time I built team infrastructure, not only robot parts.",
        ],
        "tools": ["Onshape", "Robot CAD", "Manufacturing Planning", "Engineering Notebook", "Tank Drive", "Carousel Mechanism"],
    },
    {
        "title": "Friendly Fires",
        "date": "Sep 2021 - Mar 2022",
        "category": "Sensor Hardware",
        "subtitle": "Early sensor-hardware project for coal-seam fire detection: temperature, gas sensing, alerts, and a low-cost device concept.",
        "images": [
            ("friendly-fires-prototype.jpeg", "Functional prototype electronics with sensors, power, microcontroller, and breadboard wiring.", "cover"),
        ],
        "left_title": "Built",
        "left": [
            "Arduino-based sensor array for temperature, carbon monoxide, methane, and oxygen-depletion monitoring.",
            "Haptic, LED, and optional audio alerts intended for low-light mining environments.",
            "Rechargeable battery and low-power sleep-mode concept for a 12+ hour work shift.",
        ],
        "right_title": "Prototype Status",
        "right": [
            "Demonstrated controlled CO detection, temperature-gradient detection, and multi-sensor integration.",
            "Proof of concept only: no mining-environment calibration, false-positive study, dust/humidity durability, or regulatory approval.",
            "Included as an early sensor-integration project, not a deployable safety product.",
        ],
        "tools": ["Arduino", "CO Sensor", "Methane Sensor", "IR Temperature", "Haptic Alerts", "Sensor Integration"],
    },
    {
        "title": "Prototype O Flood",
        "date": "Nov 2020 - May 2021",
        "category": "IoT Hardware",
        "subtitle": "Low-cost flood-warning prototype for Jakarta using ultrasonic water-level sensing, solar power, cellular communication, and SMS alerts.",
        "images": [],
        "left_title": "Built",
        "left": [
            "Ultrasonic distance sensor mounted above water; rising water decreases measured distance.",
            "ESP32/cellular path to aggregate sensor readings and send SMS alerts for basic-phone accessibility.",
            "Solar panel plus lithium battery concept for multi-day autonomy without grid power.",
        ],
        "right_title": "Status",
        "right": [
            "Prototype demonstrated centimeter-level water measurement, cellular connectivity, solar charging, and alert triggering.",
            "Tested locally, not deployed in Jakarta; local partners and field validation would be required.",
            "Recognized with an ASCE Certificate of Achievement.",
        ],
        "tools": ["ESP32", "Ultrasonic Sensing", "Solar Charging", "Cellular SMS", "LiPo Power", "Water-Level Thresholding"],
    },
]


def tools_methods(c, page):
    project_title(
        c, page, "Tools + Methods", "Current", "Engineering Toolkit",
        "A compact map of the tools and methods that show up across the project pages."
    )
    cols = [
        ("CAD / Mechanical", ["SolidWorks", "Onshape", "Fusion 360", "GD&T", "DFM/DFA", "FEA", "mechanism packaging", "tolerance stackups"]),
        ("Manufacturing", ["mill", "lathe", "waterjet", "laser cutter", "TIG", "FDM/SLA", "Markforged", "fastener fit-up"]),
        ("Electronics / Test", ["KiCad", "LTspice", "oscilloscope", "source-measure", "RP2040/Python", "coax/BNC interfaces", "microcontrollers"]),
        ("Software / Data", ["Python", "MATLAB/Simulink", "Java", "React/TypeScript", "Node.js", "PostgreSQL", "JupyterLab", "LabVIEW"]),
    ]
    col_w = (CONTENT_W - 24) / 2
    positions = [(M, 556), (M + col_w + 24, 556), (M, 332), (M + col_w + 24, 332)]
    for (heading, items), (x, y) in zip(cols, positions):
        label(c, heading, x, y)
        rule(c, x, y - 10, x + col_w, y - 10)
        bullets(c, items, x, y - 30, col_w, size=8.0, leading=10.2)
    image(c, "wolfrom-internals.jpg", M, 86, 154, 96, "Actuator prototype", "cover")
    image(c, "ns-pulse-schematic-thumbnail.png", M + 181, 86, 154, 96, "PCB schematic", "contain", bg=(250, 248, 243))
    image(c, "toolbox-bottom-walls-drawing.png", M + 362, 86, 154, 96, "GD&T drawing", "contain", bg=(250, 248, 243))
    finish(c)


def build():
    ensure_dirs()
    c = canvas.Canvas(str(OUT), pagesize=letter)
    c.setTitle("Aadit Kannan - Selected Hardware Projects")
    c.setAuthor("Aadit Kannan")
    cover(c)
    wolfrom_architecture(c)
    wolfrom_status(c)
    formula_packaging(c)
    formula_validation(c)
    pulse_system(c, 6)
    pulse_board(c, 7)
    toolbox(c, 8)
    first_overview(c, 9)
    tools_methods(c, 10)
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()

