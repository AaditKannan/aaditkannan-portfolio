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
M = 38

BG = colors.HexColor("#0a0a0a")
PANEL = colors.HexColor("#101010")
TEXT = colors.HexColor("#ffffff")
DIM = colors.HexColor("#a0a0a0")
MUTED = colors.HexColor("#686868")
BORDER = colors.Color(1, 1, 1, alpha=0.12)
BORDER_SOFT = colors.Color(1, 1, 1, alpha=0.07)


def ensure_dirs():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)


def clean(s):
    return re.sub(r"\s+", " ", s).strip()


def fit_image(src, w_pt, h_pt, mode="cover", bg=(10, 10, 10), scale=2.6):
    src = Path(src)
    out = CACHE_DIR / f"site-{src.stem}-{int(w_pt)}x{int(h_pt)}-{mode}.jpg"
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
    img.save(out, "JPEG", quality=90, optimize=True)
    return out


def font(c, name="Helvetica", size=9, color=TEXT):
    c.setFont(name, size)
    c.setFillColor(color)


def line(c, x1, y1, x2, y2, soft=False):
    c.setStrokeColor(BORDER_SOFT if soft else BORDER)
    c.setLineWidth(0.55)
    c.line(x1, y1, x2, y2)


def wrap(c, s, width, name="Helvetica", size=8):
    words = clean(s).split(" ")
    out, cur = [], ""
    for word in words:
        trial = word if not cur else cur + " " + word
        if c.stringWidth(trial, name, size) <= width:
            cur = trial
        else:
            if cur:
                out.append(cur)
            cur = word
    if cur:
        out.append(cur)
    return out


def paragraph(c, s, x, y, width, size=7.7, leading=10.0, color=DIM, max_lines=None):
    font(c, "Helvetica", size, color)
    used = 0
    for para in s.split("\n"):
        para = para.strip()
        if not para:
            y -= leading * 0.45
            continue
        for ln in wrap(c, para, width, "Helvetica", size):
            if max_lines is not None and used >= max_lines:
                c.drawString(x, y, "...")
                return y - leading
            c.drawString(x, y, ln)
            y -= leading
            used += 1
        y -= leading * 0.15
    return y


def bullets(c, items, x, y, width, size=7.3, leading=9.4, max_lines=None):
    used = 0
    for item in items:
        lines = wrap(c, item, width - 12, "Helvetica", size)
        for i, ln in enumerate(lines):
            if max_lines is not None and used >= max_lines:
                font(c, "Helvetica", size, DIM)
                c.drawString(x + 12, y, "...")
                return y - leading
            if i == 0:
                font(c, "Helvetica", size, MUTED)
                c.drawString(x, y, "-")
            font(c, "Helvetica", size, DIM)
            c.drawString(x + 12, y, ln)
            y -= leading
            used += 1
        y -= 1.5
    return y


def label(c, s, x, y):
    font(c, "Courier", 6.7, MUTED)
    c.drawString(x, y, s.upper())


def header(c, title, page, eyebrow="FIGURE ROBOTICS PORTFOLIO"):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    label(c, eyebrow, M, H - 30)
    font(c, "Helvetica-Bold", 22, TEXT)
    c.drawString(M, H - 61, title)
    line(c, M, H - 78, W - M, H - 78)
    font(c, "Courier", 6.5, MUTED)
    c.drawRightString(W - M, 18, f"aaditkannan.com/projects  /  {page}")


def image(c, src, x, y, w, h, cap="", mode="cover", bg=(10, 10, 10)):
    c.setFillColor(PANEL)
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.55)
    c.rect(x, y, w, h, fill=1, stroke=1)
    p = fit_image(ASSET / src, w, h, mode=mode, bg=bg)
    c.drawImage(ImageReader(str(p)), x, y, w, h)
    if cap:
        font(c, "Helvetica", 6.2, MUTED)
        c.drawString(x, y - 10, cap[:150])


def meta_rows(c, rows, x, y, w):
    for k, v in rows:
        line(c, x, y, x + w, y, soft=True)
        label(c, k, x, y - 12)
        paragraph(c, v, x + 78, y - 12, w - 82, size=7.15, leading=8.2, max_lines=2)
        y -= 29
    line(c, x, y + 7, x + w, y + 7, soft=True)
    return y


def project_page(c, page, title, subtitle, meta, problem, work, tools, status, images):
    header(c, title, page, subtitle)

    left_x = M
    left_w = 352
    right_x = M + left_w + 34
    right_w = W - right_x - M

    hero = images[0]
    image(c, hero[0], left_x, 274, left_w, 226, hero[1], hero[2], hero[3])
    thumb_w = (left_w - 18) / 2
    image(c, images[1][0], left_x, 114, thumb_w, 136, images[1][1], images[1][2], images[1][3])
    image(c, images[2][0], left_x + thumb_w + 18, 114, thumb_w, 136, images[2][1], images[2][2], images[2][3])
    if len(images) > 3:
        image(c, images[3][0], left_x, 50, left_w, 42, images[3][1], images[3][2], images[3][3])

    label(c, "Snapshot", right_x, 500)
    y = meta_rows(c, meta, right_x, 486, right_w)

    label(c, "Problem", right_x, y - 8)
    y = paragraph(c, problem, right_x, y - 23, right_w, size=7.8, leading=9.8, max_lines=7)

    label(c, "Engineering Work", right_x, y - 8)
    y = bullets(c, work, right_x, y - 23, right_w, size=7.35, leading=9.1, max_lines=15)

    label(c, "Tools", right_x, y - 8)
    y = paragraph(c, tools, right_x, y - 23, right_w, size=7.35, leading=9.1, max_lines=3)

    label(c, "Status", right_x, y - 8)
    paragraph(c, status, right_x, y - 23, right_w, size=7.35, leading=9.1, max_lines=4)
    c.showPage()


def cover(c):
    header(c, "Aadit Kannan", 1, "FIGURE ROBOTICS TARGETED HARDWARE PORTFOLIO")
    font(c, "Helvetica", 13, DIM)
    c.drawString(M, H - 96, "Robotics hardware, compact actuation, HV systems, PCB instrumentation, CAD/DFM")
    paragraph(
        c,
        "Mechanical engineering and EECS student at UC Berkeley. Selected project work reframed for robotics hardware roles: actuator packaging, electromechanical systems, PCB test hardware, manufacturing drawings, prototyping, and validation.",
        M,
        H - 128,
        430,
        size=8.2,
        leading=10.4,
        max_lines=6,
    )
    label(c, "Links", M, 372)
    font(c, "Helvetica-Bold", 8.5, TEXT)
    c.drawString(M, 352, "aaditkannan.com")
    c.linkURL("https://aaditkannan.com", (M, 348, M + 104, 363), relative=0)
    c.drawString(M + 142, 352, "aaditkannan.com/projects")
    c.linkURL("https://aaditkannan.com/projects", (M + 142, 348, M + 294, 363), relative=0)

    label(c, "Project Index", M, 300)
    rows = [
        ("01", "Compact Wolfrom Compound Planetary Actuator", "actuator CAD, gearbox packaging, printed prototype"),
        ("02", "Formula Electric 588 V Accumulator", "HV packaging, electronics attic, service/cooling constraints"),
        ("03", "Ramesh Lab Nanosecond Pulse Generator PCB", "KiCad/LTspice, GaN switching, BFO test workflow"),
        ("04", "Custom Toolbox Design & Manufacturing", "GD&T, drawing package, DFM, fit-up inspection"),
        ("05", "FIRST Robotics Hardware", "mechanism iteration, CAD/manufacturing, controls-aware design"),
    ]
    y = 278
    for n, name, detail in rows:
        line(c, M, y + 10, M + 430, y + 10, soft=True)
        font(c, "Courier-Bold", 9, TEXT)
        c.drawString(M, y - 3, n)
        font(c, "Helvetica-Bold", 8.4, TEXT)
        c.drawString(M + 36, y - 3, name)
        font(c, "Helvetica", 7.1, MUTED)
        c.drawString(M + 36, y - 16, detail)
        y -= 39

    image(c, "wolfrom-render-section.jpg", 516, 338, 208, 132, "Wolfrom compound planetary section", "cover", bg=(245, 245, 245))
    image(c, "accumimg.png", 516, 184, 208, 118, "588 V accumulator CAD", "cover")
    image(c, "ns-pulse-schematic-thumbnail.png", 516, 70, 96, 78, "Pulse generator schematic", "contain", bg=(247, 245, 238))
    image(c, "toolbox-assembly-drawing.png", 628, 70, 96, 78, "Toolbox drawing package", "contain", bg=(247, 245, 238))
    c.showPage()


def build():
    ensure_dirs()
    c = canvas.Canvas(str(OUT), pagesize=landscape(letter))
    c.setTitle("Aadit Kannan - Figure Robotics Hardware Portfolio")
    c.setAuthor("Aadit Kannan")

    cover(c)
    project_page(
        c,
        2,
        "01 / Compact Wolfrom Compound Planetary Actuator",
        "ROBOTICS ACTUATION",
        [
            ("Role", "Mechanical architecture, CAD, gearbox stackup, prototype planning"),
            ("Architecture", "Driven sun + compound planets + fixed ring + output internal ring"),
            ("Target", "Approximately 50:1 reduction in a compact axial package"),
            ("Constraints", "Gear clearance, bearing support, output ring stiffness, fastener access"),
        ],
        "Humanoid-scale joints need compact, high-ratio torque transmission without stacking bulky conventional gearbox stages.",
        [
            "Modeled sun gear, compound planet stacks, fixed ring, output ring, carrier, bearings, shafts, output hub, and housing interfaces.",
            "Iterated output ring splitting, bolt access, bearing support, axial spacing, and printability around a real assembly sequence.",
            "Built printed prototypes to evaluate gear meshing, packaging, mechanical fit, and where a later metal/SLA hybrid version needs stronger interfaces.",
        ],
        "Onshape, CAD, actuator design, gearbox packaging, bearing stackups, fastener packaging, FDM/SLA prototyping.",
        "Printed prototype iteration; not claiming production readiness or measured torque/efficiency.",
        [
            ("wolfrom-render-section.jpg", "Section view: driven sun, compound planets, fixed ring, output ring, bearing support.", "cover", (245, 245, 245)),
            ("wolfrom-cover.jpg", "Printed prototype used for gear mesh and stackup checks.", "cover", (10, 10, 10)),
            ("wolfrom-bench.jpg", "Bench assembly and fit-up workflow.", "cover", (10, 10, 10)),
            ("wolfrom-render-side.jpg", "Axial stack height and housing interfaces.", "cover", (245, 245, 245)),
        ],
    )
    project_page(
        c,
        3,
        "02 / Formula Electric 588 V Accumulator",
        "ELECTROMECHANICAL EV HARDWARE",
        [
            ("Role", "Custom accumulator and HV electronics attic packaging"),
            ("System", "High-voltage battery enclosure with electronics, fans, service interfaces"),
            ("Focus", "HV isolation, airflow, connector access, maintenance and inspection workflow"),
            ("Tools", "SolidWorks, electromechanical packaging, DFM, Formula SAE Electric"),
        ],
        "A Formula SAE electric accumulator is a dense safety-critical electromechanical package where structure, airflow, electronics, isolation, rules, and serviceability interact.",
        [
            "Packaged enclosure, electronics attic, boards, fans, fasteners, connectors, and service access in one constrained system.",
            "Balanced structural packaging, high-voltage routing/isolation, inspection access, cooling path, and vehicle-level constraints.",
            "Designed around maintainability and integration rather than treating the accumulator as a static enclosure.",
        ],
        "SolidWorks, HV packaging, accumulator design, board and connector packaging, DFM, serviceability, electromechanical integration.",
        "In active design/integration for Formula Electric at Berkeley.",
        [
            ("accumimg.png", "Full accumulator CAD with HV electronics attic and cooling/service constraints.", "cover", (10, 10, 10)),
            ("accumsa.png", "Electronics attic and enclosure-level packaging detail.", "cover", (10, 10, 10)),
            ("IMG_7934.png", "Hardware packaging view used for integration planning.", "cover", (10, 10, 10)),
        ],
    )
    project_page(
        c,
        4,
        "03 / Ramesh Lab Nanosecond Pulse Generator PCB",
        "PCB HARDWARE / LAB INSTRUMENTATION",
        [
            ("Role", "Schematic/layout direction and validation workflow"),
            ("Use Case", "BiFeO3 switching and transport characterization"),
            ("Focus", "GaN switching, trigger/sync paths, grounded coax/BNC-style interfaces"),
            ("Tools", "KiCad, LTspice, Python, LabVIEW, JupyterLab, oscilloscope"),
        ],
        "The board supports complex-oxide thin-film tests where controlled pulses help separate switching current, leakage, capacitive displacement current, and transport response.",
        [
            "Designed toward tests around the current 30 V regime before smaller-amplitude sweeps.",
            "Built from the V1 microsecond board lessons: tighter layout, cleaner sync, better grounded lab interfaces, and staged bring-up.",
            "Planned validation with dummy loads, oscilloscope captures, source-measure equipment, repeatable triggering, and Python/JupyterLab analysis.",
        ],
        "KiCad, LTspice, RF PCB layout, GaN switching, oscilloscope bring-up, Python, LabVIEW, JupyterLab, source-measure integration.",
        "Current nanosecond board is in schematic/layout and validation planning.",
        [
            ("ns-pulse-schematic-thumbnail.png", "Current nanosecond pulse-generator schematic.", "contain", (247, 245, 238)),
            ("pulse-v1-physical.jpg", "V1 microsecond board during oscilloscope probing.", "cover", (10, 10, 10)),
            ("pulse-v1-ltspice.png", "V1 LTspice timing/switching simulation.", "contain", (0, 0, 0)),
        ],
    )
    project_page(
        c,
        5,
        "04 / Custom Toolbox Design & Manufacturing",
        "GD&T / DFM / INSPECTION",
        [
            ("Role", "CAD assembly, drawings, GD&T-style tolerancing, fabrication planning"),
            ("Workflow", "CAD to drawings to fabrication to inspection to assembly"),
            ("Focus", "Datums, hole patterns, fastener alignment, lid/latch/hinge fit"),
            ("Tools", "SolidWorks, ASME Y14.5-style GD&T, laser cutting, FDM, calipers"),
        ],
        "This was a compact manufacturing exercise: communicate design intent, choose functional datums, fabricate parts, and validate fit-up with real hardware.",
        [
            "Generated production-style part and assembly drawings with datum references and positional tolerance callouts.",
            "Designed around CO2 laser-cut plywood panels, FDM inserts, fasteners, sanding/deburring, and assembly access.",
            "Validated prototype fit-up using calipers, fastener checks, squareness checks, lid closure, and latch/hinge alignment.",
        ],
        "SolidWorks, engineering drawings, GD&T principles, DFM, laser cutting, FDM printing, inspection, tolerance stackups.",
        "Prototype photos show fabrication and fit-up validation; final-version photos unavailable.",
        [
            ("toolbox-assembly-drawing.png", "Assembly drawing defining lid, latch, hinge, body, and insert interfaces.", "contain", (247, 245, 238)),
            ("toolbox-bottom-walls-drawing.png", "Part drawing with datums and positional tolerance callouts.", "contain", (247, 245, 238)),
            ("toolbox-prototype-open.png", "Prototype fit-up and hardware alignment.", "cover", (10, 10, 10)),
        ],
    )
    project_page(
        c,
        6,
        "05 / FIRST Robotics Hardware",
        "MECHANISMS / CAD / DESIGN-BUILD-TEST",
        [
            ("Role", "Hardware Lead for FTC #13216; mechanical design + TeleOp software"),
            ("Scope", "Drivetrain, intake, transfer, arm/lift, end effector, hang"),
            ("Work", "Hundreds of CAD parts; printed, laser-cut, CNC, and shop-fabricated hardware"),
            ("Tools", "SolidWorks, Java, FTC SDK, PID, mecanum kinematics, FEA"),
        ],
        "FTC compressed mechanism design, manufacturing, controls, reliability, and rapid iteration into short build cycles.",
        [
            "Iterated intakes and scoring mechanisms around game-piece behavior, reliability, driver feel, and service access.",
            "Wrote Java TeleOp code for field-centric mecanum drive, mechanism sequencing, PID loops, and driver feedback.",
            "Built competition-ready robots with minimal mechanical failures and advanced through qualification into elimination rounds.",
        ],
        "SolidWorks, FTC SDK, Java, PID control, mecanum kinematics, laser cutting, CNC, Markforged/Prusa printing, FEA.",
        "Robotics foundation work that directly informs later actuator, battery, PCB, and manufacturing projects.",
        [
            ("newiamge.png", "INTO THE DEEP robot CAD and subsystem packaging.", "cover", (10, 10, 10)),
            ("intake.png", "High-iteration intake mechanism CAD.", "cover", (10, 10, 10)),
            ("deja1.png", "Linkage and end-effector packaging detail.", "contain", (245, 245, 245)),
        ],
    )

    header(c, "Robotics Hardware Capability Summary", 7, "CAPABILITIES / CONTACT")
    cols = [
        ("Actuation + Mechanisms", ["Wolfrom compound planetary layout", "Bearing/output stackups", "Gear mesh and assembly sequence", "Controls-aware FTC mechanism design"]),
        ("Electromechanical Systems", ["588 V accumulator packaging", "HV electronics attic layout", "Board/connector/fan/service layout", "Mechanical/electrical interface tradeoffs"]),
        ("PCB + Lab Hardware", ["KiCad schematic/layout workflow", "LTspice timing/switching checks", "GaN switching and trigger/sync paths", "Oscilloscope/source-measure bring-up"]),
        ("Manufacturing + Validation", ["Production-style drawings", "GD&T principles based on ASME Y14.5-2018", "Laser/FDM prototype constraints", "Calipers, fastener checks, fit-up validation"]),
    ]
    col_w = (W - 2 * M - 28) / 2
    for i, (title, items) in enumerate(cols):
        x = M + (i % 2) * (col_w + 28)
        y = 430 - (i // 2) * 178
        font(c, "Helvetica-Bold", 12, TEXT)
        c.drawString(x, y, title)
        line(c, x, y - 12, x + col_w, y - 12)
        bullets(c, items, x, y - 32, col_w, size=7.8, leading=10.0)
    image(c, "wolfrom-internals.jpg", M, 58, 148, 84, "Actuator internal stackup", "cover", (10, 10, 10))
    image(c, "pulse-v1-ltspice.png", M + 164, 58, 148, 84, "Simulation-informed pulse workflow", "contain", (0, 0, 0))
    image(c, "deja1.png", M + 328, 58, 148, 84, "Mechanism packaging", "contain", (245, 245, 245))
    label(c, "Links", M + 515, 138)
    font(c, "Helvetica-Bold", 8.7, TEXT)
    c.drawString(M + 515, 116, "aaditkannan.com")
    c.linkURL("https://aaditkannan.com", (M + 515, 112, M + 620, 127), relative=0)
    c.drawString(M + 515, 92, "aaditkannan.com/projects")
    c.linkURL("https://aaditkannan.com/projects", (M + 515, 88, M + 680, 103), relative=0)
    paragraph(c, "Optional site projects include PLDTracker and Leitmotif; this PDF keeps the spotlight on robotics hardware, CAD, PCB instrumentation, manufacturing, and validation.", M + 515, 68, 200, size=7.0, leading=8.7)
    c.showPage()

    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
