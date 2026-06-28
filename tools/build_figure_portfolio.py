from pathlib import Path
import re

from PIL import Image, ImageOps
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "public" / "assets"
OUT_DIR = ROOT / "output" / "pdf"
CACHE_DIR = ROOT / "tmp" / "pdfs" / "portfolio-cache"
OUT = OUT_DIR / "aadit-kannan-figure-robotics-portfolio.pdf"

W, H = landscape(letter)
M = 42

BG = colors.HexColor("#fbfbfa")
INK = colors.HexColor("#111111")
TEXT = colors.HexColor("#333333")
MUTED = colors.HexColor("#777777")
LINE = colors.HexColor("#d8d8d4")
SOFT = colors.HexColor("#eeeeeb")
PAPER = colors.HexColor("#ffffff")
ACCENT = colors.HexColor("#4f5f66")


def ensure_dirs():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)


def clean(text):
    return re.sub(r"\s+", " ", text).strip()


def fit_image(src, w_pt, h_pt, mode="cover", bg=(251, 251, 250), scale=2.6):
    src = Path(src)
    out = CACHE_DIR / f"case-{src.stem}-{int(w_pt)}x{int(h_pt)}-{mode}.jpg"
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

    img.save(out, "JPEG", quality=91, optimize=True)
    return out


def font(c, name="Helvetica", size=9, color=INK):
    c.setFont(name, size)
    c.setFillColor(color)


def rule(c, x1, y1, x2, y2, color=LINE):
    c.setStrokeColor(color)
    c.setLineWidth(0.55)
    c.line(x1, y1, x2, y2)


def wrap(c, text, width, name="Helvetica", size=8):
    words = clean(text).split(" ")
    lines = []
    cur = ""
    for word in words:
        trial = word if not cur else cur + " " + word
        if c.stringWidth(trial, name, size) <= width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def paragraph(c, text, x, y, width, size=8.0, leading=10.1, color=TEXT, max_lines=None):
    font(c, "Helvetica", size, color)
    count = 0
    for para in text.split("\n"):
        para = para.strip()
        if not para:
            y -= leading * 0.45
            continue
        for line in wrap(c, para, width, "Helvetica", size):
            if max_lines is not None and count >= max_lines:
                c.drawString(x, y, "...")
                return y - leading
            c.drawString(x, y, line)
            y -= leading
            count += 1
        y -= leading * 0.18
    return y


def bullets(c, items, x, y, width, size=7.6, leading=9.6, max_lines=None):
    used = 0
    for item in items:
        lines = wrap(c, item, width - 12, "Helvetica", size)
        for i, line in enumerate(lines):
            if max_lines is not None and used >= max_lines:
                font(c, "Helvetica", size, TEXT)
                c.drawString(x + 12, y, "...")
                return y - leading
            if i == 0:
                font(c, "Helvetica", size, ACCENT)
                c.drawString(x, y, "-")
            font(c, "Helvetica", size, TEXT)
            c.drawString(x + 12, y, line)
            y -= leading
            used += 1
        y -= 1.6
    return y


def small_label(c, text, x, y):
    font(c, "Helvetica-Bold", 6.6, ACCENT)
    c.drawString(x, y, text.upper())


def page_base(c, title, page, kicker="Selected Hardware Projects"):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    font(c, "Helvetica", 7.0, MUTED)
    c.drawString(M, H - 30, kicker)
    font(c, "Helvetica-Bold", 19.5, INK)
    c.drawString(M, H - 58, title)
    rule(c, M, H - 76, W - M, H - 76)
    font(c, "Helvetica", 6.8, MUTED)
    c.drawRightString(W - M, 18, f"Aadit Kannan / aaditkannan.com/projects / {page}")


def image(c, src, x, y, w, h, cap="", mode="cover", bg=(251, 251, 250)):
    c.setFillColor(PAPER)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.55)
    c.rect(x, y, w, h, fill=1, stroke=1)
    p = fit_image(ASSET / src, w, h, mode=mode, bg=bg)
    c.drawImage(ImageReader(str(p)), x, y, w, h)
    if cap:
        font(c, "Helvetica", 6.35, MUTED)
        cap_lines = wrap(c, cap, w, "Helvetica", 6.35)
        for i, line in enumerate(cap_lines[:2]):
            c.drawString(x, y - 9 - i * 7.2, line)


def field(c, label, value, x, y, width):
    rule(c, x, y + 4, x + width, y + 4, SOFT)
    small_label(c, label, x, y - 8)
    paragraph(c, value, x + 68, y - 8, width - 70, size=7.3, leading=8.6, max_lines=2)
    return y - 25


def callout(c, label, x1, y1, x2, y2, align="left"):
    c.setStrokeColor(ACCENT)
    c.setLineWidth(0.65)
    c.line(x1, y1, x2, y2)
    font(c, "Helvetica-Bold", 6.5, ACCENT)
    if align == "right":
        c.drawRightString(x1 - 4, y1 - 2, label)
    else:
        c.drawString(x1 + 4, y1 - 2, label)


def block_diagram(c, x, y, w):
    labels = [
        "Python / RP2040 trigger",
        "Driver + switching stage",
        "coax / BNC output",
        "device / probe station",
        "scope + source-measure",
    ]
    box_w = (w - 48) / 5
    box_h = 42
    for i, label in enumerate(labels):
        bx = x + i * (box_w + 12)
        c.setFillColor(PAPER)
        c.setStrokeColor(LINE)
        c.roundRect(bx, y, box_w, box_h, 4, fill=1, stroke=1)
        paragraph(c, label, bx + 7, y + 25, box_w - 14, size=6.7, leading=8.0, color=INK, max_lines=2)
        if i < len(labels) - 1:
            font(c, "Helvetica", 11, MUTED)
            c.drawString(bx + box_w + 4, y + 17, "->")


def cover(c):
    page_base(c, "Aadit Kannan", 1, "")
    font(c, "Helvetica-Bold", 17, INK)
    c.drawString(M, H - 100, "Selected Hardware Projects")
    font(c, "Helvetica", 10.5, TEXT)
    c.drawString(M, H - 123, "Mechanical design, robotics hardware, fabrication, electronics integration, and test.")

    link_y = H - 162
    small_label(c, "Links", M, link_y)
    font(c, "Helvetica", 8.0, INK)
    c.drawString(M, link_y - 20, "aaditkannan.com")
    c.linkURL("https://aaditkannan.com", (M, link_y - 24, M + 100, link_y - 8), relative=0)
    c.drawString(M + 132, link_y - 20, "aaditkannan.com/projects")
    c.linkURL("https://aaditkannan.com/projects", (M + 132, link_y - 24, M + 284, link_y - 8), relative=0)
    c.drawString(M, link_y - 42, "aaditkannan@berkeley.edu")
    c.linkURL("mailto:aaditkannan@berkeley.edu", (M, link_y - 46, M + 150, link_y - 30), relative=0)
    c.drawString(M + 182, link_y - 42, "linkedin.com/in/aaditkannan")
    c.linkURL("https://www.linkedin.com/in/aaditkannan", (M + 182, link_y - 46, M + 342, link_y - 30), relative=0)
    c.drawString(M, link_y - 64, "github.com/aaditkannan")
    c.linkURL("https://github.com/aaditkannan", (M, link_y - 68, M + 135, link_y - 52), relative=0)

    small_label(c, "Project Index", M, H - 280)
    rows = [
        ("1", "Wolfrom Compound Planetary Actuator"),
        ("2", "Formula Electric 588V Accumulator Hardware"),
        ("3", "Ramesh Lab ns/us Pulse Generator PCB"),
        ("4", "Custom Toolbox Design & Manufacturing"),
        ("5", "FIRST Robotics Hardware"),
    ]
    y = H - 306
    for num, name in rows:
        rule(c, M, y + 10, M + 365, y + 10, SOFT)
        font(c, "Helvetica-Bold", 9.0, INK)
        c.drawString(M, y - 2, num)
        font(c, "Helvetica", 9.0, INK)
        c.drawString(M + 28, y - 2, name)
        y -= 31

    image(c, "wolfrom-render-section.jpg", 464, 340, 250, 142, "Wolfrom actuator section render", "contain", bg=(255, 255, 255))
    image(c, "accumimg.png", 464, 196, 250, 112, "588V accumulator CAD", "cover")
    image(c, "ns-pulse-schematic-thumbnail.png", 464, 74, 116, 82, "ns pulse generator schematic", "contain", bg=(250, 248, 243))
    image(c, "toolbox-assembly-drawing.png", 598, 74, 116, 82, "Toolbox drawing package", "contain", bg=(250, 248, 243))
    c.showPage()


def wolfrom_architecture(c):
    page_base(c, "Wolfrom Compound Planetary Actuator", 2)
    font(c, "Helvetica", 9.5, TEXT)
    paragraph(
        c,
        "Compact 50:1 compound Wolfrom gearbox for robotic joints. The motor drives a sun gear; each compound planet meshes with a fixed internal ring on one side and an output internal ring on the other. The small tooth-count difference at the ring meshes creates high reduction in one compact axial package.",
        M,
        H - 105,
        365,
        size=8.5,
        leading=10.6,
        max_lines=6,
    )
    image(c, "wolfrom-render-section.jpg", M, 158, 420, 300, "CAD section showing the sun, compound planets, fixed ring, output ring, bearings, and output interface.", "contain", bg=(255, 255, 255))
    callout(c, "driven sun", M + 88, 442, M + 184, 354)
    callout(c, "compound planets", M + 44, 396, M + 234, 330)
    callout(c, "fixed ring", M + 380, 420, M + 298, 380, "right")
    callout(c, "output ring", M + 386, 384, M + 306, 338, "right")
    callout(c, "bearing stack", M + 382, 300, M + 278, 240, "right")
    callout(c, "output interface", M + 112, 184, M + 244, 204)

    x = 500
    small_label(c, "My Role", x, 458)
    paragraph(c, "Designed the gearbox architecture, actuator stackup, bearing support, output ring split, fastener access, and prototype assembly sequence.", x, 438, 214, size=8.0, leading=10.0)
    small_label(c, "Architecture Decisions", x, 354)
    bullets(c, [
        "Used a compound planetary Wolfrom layout instead of stacking multiple conventional stages.",
        "Kept the actuator axial package compact around the sun, carrier, rings, bearings, and output hub.",
        "Split the output ring and designed around bolt access so the prototype can be assembled and re-timed.",
        "Designed the bearing stack and output interface around printed prototypes first, then a metal revision path."
    ], x, 334, 214, size=7.4, leading=9.4)
    small_label(c, "Why It Matters For Robotic Joints", x, 176)
    paragraph(c, "The relevant tradeoff is packaging high reduction while keeping friction, reflected inertia, assembly tolerance, and output support under control. The project is still in prototype iteration; the value is the architecture and mechanical packaging work, not a finished actuator claim.", x, 156, 214, size=7.8, leading=9.8)
    c.showPage()


def wolfrom_status(c):
    page_base(c, "Wolfrom Actuator - Prototype Status", 3)
    image(c, "wolfrom-cover.jpg", M, 328, 205, 160, "Printed prototype used for gear mesh, stack height, and assembly checks.", "cover")
    image(c, "wolfrom-bench.jpg", M + 225, 328, 205, 160, "Bench assembly work: checking fit-up and hand assembly sequence.", "cover")
    image(c, "wolfrom-render-face.jpg", M, 120, 205, 150, "Top view of compound planets, output ring, and fastener pattern.", "contain", bg=(255, 255, 255))
    image(c, "wolfrom-render-side.jpg", M + 225, 120, 205, 150, "Side view of the plate stack, motor interface, and axial package.", "contain", bg=(255, 255, 255))

    x = 512
    small_label(c, "Current Design Decisions", x, 486)
    bullets(c, [
        "Rebalanced the stage split so less reduction happens in the high-loss ring differential, reducing internal power recirculation compared with a naive Wolfrom split.",
        "Targeting about 50:1 reduction; current tooth counts produce about 50.45:1.",
        "Working toward near-zero backlash through split-gear preloading rather than claiming final measured backlash.",
        "Printed prototypes are being used for gear mesh, packaging, stack height, and assembly checks."
    ], x, 466, 214, size=7.6, leading=9.6)
    small_label(c, "In Progress", x, 292)
    bullets(c, [
        "KISSsoft refinement for macro-geometry, profile shifts, and tip relief on high-load ring meshes.",
        "Next mechanical revision: CNC aluminum structure, wire-EDM rings, hardened pins, and needle bearings.",
        "Planned dyno characterization for torque, efficiency, and backdrive behavior after the metal version is built."
    ], x, 272, 214, size=7.6, leading=9.6)
    small_label(c, "Status", x, 146)
    paragraph(c, "Printed prototype built and fit-checked; metal revision, KISSsoft refinement, and dyno characterization are in progress.", x, 126, 214, size=8.0, leading=10.0)
    c.showPage()


def formula(c):
    page_base(c, "Formula Electric 588V Accumulator Hardware", 4)
    image(c, "accumimg.png", M, 314, 420, 195, "Accumulator CAD showing HV electronics attic, fans, service access, and enclosure packaging.", "cover")
    image(c, "accumsa.png", M, 120, 205, 142, "Electronics attic layout and board/connector packaging.", "cover")
    image(c, "IMG_7934.png", M + 225, 120, 205, 142, "Physical hardware packaging context for accumulator integration.", "cover")

    x = 512
    small_label(c, "My Role", x, 486)
    paragraph(c, "Designed and manufactured the HV electronics attic enclosure and busbar packaging for a 588V accumulator, focusing on insulation, sealing, access, mass, and review documentation.", x, 466, 214, size=8.0, leading=10.0)
    small_label(c, "Engineering Work", x, 374)
    bullets(c, [
        "Packaged the HV electronics attic, busbars, boards, fans, fasteners, and service interfaces inside the accumulator envelope.",
        "Preserved insulation clearances, cooling paths, board access, fastener access, and inspection access while reducing attic mass by 18%.",
        "Designed around waterproofing and high-dielectric insulation requirements for a 588V battery system.",
        "Routed busbars for 80A peak discharge and prepared design material for SES/ESF review.",
    ], x, 354, 214, size=7.55, leading=9.5)
    small_label(c, "Design Constraints", x, 160)
    paragraph(c, "The packaging problem was not just fitting electronics in a box: it had to leave room for service, cooling, inspection, sealing, high-voltage isolation, and manufacturable fastener access.", x, 140, 214, size=8.0, leading=10.0)
    c.showPage()


def pulse_overview(c):
    page_base(c, "Ramesh Lab ns/us Pulse Generator PCB", 5)
    paragraph(c, "Instrument for ferroelectric and RF characterization of BiFeO3 thin-film devices. The goal is controlled nanosecond and microsecond pulse generation with grounded lab I/O, source-measure biasing, RP2040/Python triggering, and oscilloscope validation.", M, H - 106, 440, size=8.5, leading=10.6)
    small_label(c, "System Flow", M, 424)
    block_y = 368
    labels = [
        "Python / RP2040 trigger",
        "driver + switching stage",
        "coax / BNC output",
        "device / probe station",
        "scope + source-measure capture",
    ]
    box_w = 122
    for i, txt in enumerate(labels):
        x = M + i * 138
        c.setFillColor(PAPER)
        c.setStrokeColor(LINE)
        c.roundRect(x, block_y, box_w, 48, 4, fill=1, stroke=1)
        paragraph(c, txt, x + 8, block_y + 30, box_w - 16, size=7.0, leading=8.2, color=INK, max_lines=2)
        if i < len(labels) - 1:
            font(c, "Helvetica", 12, MUTED)
            c.drawString(x + box_w + 8, block_y + 20, "->")

    image(c, "ns-pulse-schematic-thumbnail.png", M, 148, 318, 166, "Current nanosecond pulse-generator schematic.", "contain", bg=(250, 248, 243))
    image(c, "pulse-v1-physical.jpg", M + 344, 148, 170, 166, "V1 microsecond board during bench probing.", "cover")
    image(c, "pulse-v1-ltspice.png", M + 534, 148, 170, 166, "V1 timing/switching simulation used during early design work.", "contain", bg=(0, 0, 0))

    small_label(c, "Design Focus", M, 96)
    bullets(c, [
        "Separate ns and us pulse paths around the needs of thin-film switching and transport tests.",
        "Use GaN switching and clean trigger/sync routing instead of loose bench wiring.",
        "Expose grounded coax/BNC-style I/O and source-measure biasing for probe-station work.",
    ], M, 78, 665, size=7.7, leading=9.7)
    c.showPage()


def pulse_details(c):
    page_base(c, "Pulse Generator - Schematic, Layout, Test", 6)
    image(c, "ns-pulse-schematic-thumbnail.png", M, 242, 430, 260, "KiCad schematic for the current ns/us pulse generator revision.", "contain", bg=(250, 248, 243))
    callout(c, "RP2040 / trigger control", M + 30, 486, M + 72, 450)
    callout(c, "GaN switching path", M + 392, 450, M + 290, 418, "right")
    callout(c, "source-measure bias", M + 388, 322, M + 280, 338, "right")
    callout(c, "sync / range control", M + 384, 386, M + 346, 402, "right")
    callout(c, "decoupling / rails", M + 42, 292, M + 160, 308)
    image(c, "pulse-v1-us-layout.png", M, 92, 205, 98, "V1 PCB layout used to check routing, connector placement, and return paths.", "contain", bg=(20, 22, 26))
    image(c, "pulse-v1-us-render.png", M + 225, 92, 205, 98, "V1 rendered board: useful as a physical integration reference, not the current ns revision.", "contain", bg=(242, 242, 246))

    x = 512
    small_label(c, "V1 Learning Artifact", x, 486)
    paragraph(c, "The first microsecond board validated the basic bench workflow, but exposed integration issues: clip-lead power, weak lab I/O, and awkward triggering.", x, 466, 214, size=8.0, leading=10.0)
    small_label(c, "Current Revision", x, 374)
    bullets(c, [
        "Folds nanosecond and microsecond pulse generation into a cleaner instrument.",
        "Adds coax output, source-measure biasing, shared trigger/sync paths, and Python/RP2040 control.",
        "Bring-up plan: verify rails and trigger logic, validate switching into dummy loads, then move toward device fixtures.",
        "No final rise-time, jitter, amplitude stability, or device-result claims yet."
    ], x, 354, 214, size=7.55, leading=9.5)
    small_label(c, "Tools", x, 154)
    paragraph(c, "KiCad, LTspice, RP2040, Python, LabVIEW, JupyterLab, oscilloscope, source-measure equipment, coax/BNC lab interfaces.", x, 134, 214, size=7.8, leading=9.8)
    c.showPage()


def toolbox(c):
    page_base(c, "Custom Toolbox Design & Manufacturing", 7)
    image(c, "toolbox-assembly-drawing.png", M, 332, 250, 160, "Assembly drawing defining lid, latch, hinge, body, and insert interfaces.", "contain", bg=(250, 248, 243))
    image(c, "toolbox-bottom-walls-drawing.png", M + 270, 332, 250, 160, "Part drawing with datum references and positional tolerance callouts.", "contain", bg=(250, 248, 243))
    image(c, "toolbox-prototype-closed.png", M, 104, 250, 172, "Prototype fit-up after fabrication with hinges, latches, handle, and fasteners.", "cover")
    image(c, "toolbox-prototype-open.png", M + 270, 104, 250, 172, "Open prototype showing interior fit-up; final-version photos unavailable.", "cover")

    x = 592
    small_label(c, "My Role", x, 486)
    paragraph(c, "Used the toolbox as a controlled manufacturing exercise: model the assembly, define functional datums, create buildable drawings, fabricate parts, and inspect fit-up instead of relying on hand-fitting.", x, 466, 150, size=7.7, leading=9.7)
    small_label(c, "Engineering Work", x, 328)
    bullets(c, [
        "Created production-style drawings using ASME Y14.5-2018 GD&T conventions.",
        "Specified datums, position tolerances, fastener clearances, and lid/hinge/latch interfaces.",
        "Designed around laser-cut plywood panels, FDM inserts, and fastened joints visible in the prototype.",
        "Checked fit-up using calipers, fasteners/gauge pins, squareness, lid closure, and hinge/latch alignment."
    ], x, 308, 150, size=7.25, leading=9.2)
    c.showPage()


def first(c):
    page_base(c, "FIRST Robotics Hardware", 8)
    image(c, "newiamge.png", M, 322, 278, 176, "INTO THE DEEP robot CAD and subsystem packaging.", "cover")
    image(c, "intake.png", M + 300, 322, 190, 176, "High-iteration intake mechanism CAD.", "cover")
    image(c, "Deja_Vu_Bot_Assemble_Version_1_v4_v1112.png", M, 110, 232, 156, "CENTERSTAGE robot CAD assembly.", "cover")
    image(c, "deja1.png", M + 254, 110, 236, 156, "Linkage and end-effector packaging detail.", "contain", bg=(255, 255, 255))

    x = 560
    small_label(c, "My Role", x, 486)
    paragraph(c, "Hardware Lead for FTC #13216 and captain/founder work across FIRST teams. Focus here is mechanism design, reliability, serviceability, and iteration under match constraints.", x, 466, 170, size=7.8, leading=9.8)
    small_label(c, "Engineering Work", x, 350)
    bullets(c, [
        "Designed 8 robots and 500+ part CAD assemblies across drivetrain, intake, transfer, arm/lift, end effector, and hang systems.",
        "Used FEA to guide custom aluminum and printed components for stress and weight.",
        "Built with printed parts, laser-cut plates, CNC-machined aluminum, and shop-fabricated hardware.",
        "Wrote Java TeleOp for field-centric mecanum drive, PID loops, mechanism sequencing, and driver feedback.",
        "Won Robot Design Award 3 times; mentored 30+ members in CAD and Java."
    ], x, 330, 170, size=7.2, leading=9.1)
    c.showPage()


def tools_methods(c):
    page_base(c, "Tools + Methods", 9)
    cols = [
        ("CAD / Mechanical", ["SolidWorks", "Onshape", "GD&T", "DFM/DFA", "FEA", "mechanism packaging"]),
        ("Manufacturing", ["mill", "lathe", "waterjet", "laser cutter", "TIG", "FDM/SLA", "fastener fit-up"]),
        ("Electronics / Test", ["KiCad", "LTspice", "oscilloscope", "source-measure", "RP2040/Python", "coax/BNC interfaces"]),
        ("Analysis / Software", ["KISSsoft", "MATLAB/Simulink", "Python", "JupyterLab", "LabVIEW", "data logging"]),
    ]
    x_positions = [M, M + 185, M + 370, M + 555]
    for x, (title, items) in zip(x_positions, cols):
        font(c, "Helvetica-Bold", 11.5, INK)
        c.drawString(x, 448, title)
        rule(c, x, 432, x + 145, 432)
        bullets(c, items, x, 410, 145, size=8.0, leading=10.4)

    image(c, "wolfrom-internals.jpg", M, 122, 170, 120, "Actuator stackup prototype", "cover")
    image(c, "pulse-v1-ltspice.png", M + 190, 122, 170, 120, "Pulse simulation workflow", "contain", bg=(0, 0, 0))
    image(c, "deja1.png", M + 380, 122, 170, 120, "Mechanism packaging", "contain", bg=(255, 255, 255))

    x = M + 585
    small_label(c, "Links", x, 218)
    font(c, "Helvetica", 8.2, INK)
    c.drawString(x, 196, "aaditkannan.com")
    c.linkURL("https://aaditkannan.com", (x, 192, x + 105, 208), relative=0)
    c.drawString(x, 174, "aaditkannan.com/projects")
    c.linkURL("https://aaditkannan.com/projects", (x, 170, x + 160, 186), relative=0)
    c.drawString(x, 152, "github.com/aaditkannan")
    c.linkURL("https://github.com/aaditkannan", (x, 148, x + 138, 164), relative=0)
    c.drawString(x, 130, "linkedin.com/in/aaditkannan")
    c.linkURL("https://www.linkedin.com/in/aaditkannan", (x, 126, x + 166, 142), relative=0)
    c.showPage()


def build():
    ensure_dirs()
    c = canvas.Canvas(str(OUT), pagesize=landscape(letter))
    c.setTitle("Aadit Kannan - Selected Hardware Projects")
    c.setAuthor("Aadit Kannan")
    cover(c)
    wolfrom_architecture(c)
    wolfrom_status(c)
    formula(c)
    pulse_overview(c)
    pulse_details(c)
    toolbox(c)
    first(c)
    tools_methods(c)
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
