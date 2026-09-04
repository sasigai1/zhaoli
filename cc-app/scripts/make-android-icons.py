# Generate all Android launcher + splash assets for 日晷 Sundial from icons/icon-master-v2.jpg
# Brand: warm cream paper, ink #1C1B18, bronze #A89880.
import os
from PIL import Image, ImageDraw

RES = "android/app/src/main/res"
MASTER = "icons/icon-master-v2.jpg"

master = Image.open(MASTER).convert("RGBA")

# background tone = mean of the icon's border pixels (keeps adaptive rim + splash seamless)
edge = []
w, h = master.size
for x in range(0, w, 64):
    edge += [master.getpixel((x, 8)), master.getpixel((x, h - 9))]
for y in range(0, h, 64):
    edge += [master.getpixel((8, y)), master.getpixel((w - 9, y))]
n = len(edge)
BORDER = tuple(int(sum(p[i] for p in edge) / n) for i in range(3)) + (255,)

def sized(im, w, h=None):
    return im.resize((w, h or w), Image.LANCZOS)

# --- legacy launcher icons: full-bleed master ---
for dpi, px in {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}.items():
    d = f"{RES}/mipmap-{dpi}"
    os.makedirs(d, exist_ok=True)
    sized(master, px).save(f"{d}/ic_launcher.png")

    # round: circular crop over paper (mask edges stay paper, not transparent)
    circle = Image.new("RGBA", (px, px), BORDER)
    mask = Image.new("L", (px * 4, px * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, px * 4 - 1, px * 4 - 1), fill=255)
    mask = mask.resize((px, px), Image.LANCZOS)
    circle.paste(sized(master, px), (0, 0), mask)
    circle.save(f"{d}/ic_launcher_round.png")

    # adaptive_foreground: master at 90% on transparent 108dp-base canvas.
    # The exposed 10% rim shows the paper background color -> seamless.
    base = {48: 108, 72: 162, 96: 216, 144: 324, 192: 432}[px]
    fg = Image.new("RGBA", (base, base), (0, 0, 0, 0))
    inner = int(base * 0.90)
    off = (base - inner) // 2
    fg.paste(sized(master, inner), (off, off))
    fg.save(f"{d}/ic_launcher_foreground.png")

# --- adaptive icon background color -> paper ---
with open(f"{RES}/values/ic_launcher_background.xml", "w") as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
            f'    <color name="ic_launcher_background">#{BORDER[0]:02X}{BORDER[1]:02X}{BORDER[2]:02X}</color>\n</resources>\n')

# --- splash: paper background + centered glyph at ~55% ---
splash_master = sized(master, 1200)
for kind, w, h in [
    ("port-mdpi", 320, 480), ("port-hdpi", 480, 800), ("port-xhdpi", 720, 1280),
    ("port-xxhdpi", 1080, 1920), ("port-xxxhdpi", 1440, 2560),
    ("land-mdpi", 480, 320), ("land-hdpi", 800, 480), ("land-xhdpi", 1280, 720),
    ("land-xxhdpi", 1920, 1080), ("land-xxxhdpi", 2560, 1440),
]:
    d = f"{RES}/drawable-{kind}"
    os.makedirs(d, exist_ok=True)
    canvas = Image.new("RGBA", (w, h), BORDER)
    side = int(min(w, h) * 0.55)
    glyph = sized(splash_master, side)
    canvas.paste(glyph, ((w - side) // 2, (h - side) // 2), glyph)
    canvas.convert("RGB").save(f"{d}/splash.png")

canvas = Image.new("RGBA", (1280, 720), BORDER)
side = int(min(1280, 720) * 0.55)
glyph = sized(splash_master, side)
canvas.paste(glyph, ((1280 - side) // 2, (720 - side) // 2), glyph)
canvas.convert("RGB").save(f"{RES}/drawable/splash.png")

print("icons + splash written, border =", BORDER[:3])
