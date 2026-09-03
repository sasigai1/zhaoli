#!/usr/bin/env python3
"""从 icon-master.png 生成全套 Android 图标与启动图资源。"""
from PIL import Image, ImageDraw, ImageOps
import os

RES = "/workspace/daily-journal/android/app/src/main/res"
BG = (253, 253, 251, 255)  # #FDFDFB
master = Image.open("/workspace/daily-journal/icon-master.png").convert("RGBA")

# 统一成正方形
side = min(master.size)
master = ImageOps.fit(master, (side, side), Image.LANCZOS)

# --- 自适应图标前景：整图缩放到 108dp 基准的各密度画布
# 母版内容占中央 ~55%，缩放后天然落在 66% 安全区内
for dpi, px in [("mdpi", 108), ("hdpi", 162), ("xhdpi", 216), ("xxhdpi", 324), ("xxxhdpi", 432)]:
    fg = master.resize((px, px), Image.LANCZOS)
    fg.save(f"{RES}/mipmap-{dpi}/ic_launcher_foreground.png")

# --- 传统图标：整图（背景铺满），圆角版做圆形裁切
for dpi, px in [("mdpi", 48), ("hdpi", 72), ("xhdpi", 96), ("xxhdpi", 144), ("xxxhdpi", 192)]:
    img = master.resize((px, px), Image.LANCZOS)
    img.save(f"{RES}/mipmap-{dpi}/ic_launcher.png")
    # 圆形版
    mask = Image.new("L", (px * 4, px * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, px * 4 - 1, px * 4 - 1), fill=255)
    mask = mask.resize((px, px), Image.LANCZOS)
    round_img = img.copy()
    round_img.putalpha(mask)
    round_img.save(f"{RES}/mipmap-{dpi}/ic_launcher_round.png")

# --- 启动图：纯色背景 + 居中图标（约 32% 宽）
for d in ["drawable", "drawable-port-mdpi", "drawable-port-hdpi", "drawable-port-xhdpi",
          "drawable-port-xxhdpi", "drawable-port-xxxhdpi",
          "drawable-land-mdpi", "drawable-land-hdpi", "drawable-land-xhdpi",
          "drawable-land-xxhdpi", "drawable-land-xxxhdpi"]:
    path = f"{RES}/{d}/splash.png"
    if not os.path.exists(path):
        continue
    w, h = Image.open(path).size
    canvas = Image.new("RGBA", (w, h), BG)
    iw = int(min(w, h) * 0.32)
    icon = master.resize((iw, iw), Image.LANCZOS)
    canvas.paste(icon, ((w - iw) // 2, (h - iw) // 2), icon)
    canvas.save(path)

print("icons generated")
