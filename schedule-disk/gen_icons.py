# 从 ic_launcher_foreground.xml 的设计复刻 PNG 图标：四色圆环 + 白色轮毂 + 金边
from PIL import Image, ImageDraw

SIZES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}

# 与 vector 一致的几何（viewport 108，数值为半径/描边宽度）
OUTER_R = 30.12   # 外环半径
INNER_R = 21.16   # 内环半径
HUB_R = 11.48     # 轮毂半径
STROKE = 5.38     # 描边宽度
COLORS = ["#5B7C99", "#8E7CC3", "#7A9B6E", "#C97B84"]  # 蓝紫绿玫四段弧


def draw_icon(px):
    """按 108 viewport 的几何，绘制到 px x px 画布（内容占 66/108）"""
    img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    s = px / 108.0          # viewport 缩放
    cx, cy = 54 * s, 54 * s

    def half(r):             # 半径 -> 外接框
        return r * s

    # 四段弧：外环两段（90° 一段）+ 内环两段，颜色循环
    ro, ri = half(OUTER_R), half(INNER_R)
    w = STROKE * s
    # 外环：0-180°（蓝），180-360°（紫）——与 vector 的两段大弧对应
    d.arc([cx - ro, cy - ro, cx + ro, cy + ro], start=-80, end=100,
          fill=COLORS[0], width=max(1, int(w)))
    d.arc([cx - ro, cy - ro, cx + ro, cy + ro], start=100, end=280,
          fill=COLORS[1], width=max(1, int(w)))
    # 内环：错开 45° 的两段
    d.arc([cx - ri, cy - ri, cx + ri, cy + ri], start=-35, end=145,
          fill=COLORS[2], width=max(1, int(w)))
    d.arc([cx - ri, cy - ri, cx + ri, cy + ri], start=145, end=325,
          fill=COLORS[3], width=max(1, int(w)))

    # 中心轮毂：白底 + 金描边
    rh = half(HUB_R)
    d.ellipse([cx - rh, cy - rh, cx + rh, cy + rh],
              fill="#FFFFFF", outline="#B08D57", width=max(1, int(1.26 * s)))

    # 简化「日」字：中央横竖两笔
    bw = 1.44 * s
    ln = HUB_R * 1.05 * s
    d.rectangle([cx - ln, cy - bw / 2, cx + ln, cy + bw / 2], fill="#22252A")
    d.rectangle([cx - bw / 2, cy - ln, cx + bw / 2, cy + ln], fill="#22252A")

    return img


import os
base = "/workspace/schedule-disk/android/app/src/main/res"
for density, px in SIZES.items():
    folder = os.path.join(base, f"mipmap-{density}")
    os.makedirs(folder, exist_ok=True)
    draw_icon(px).save(os.path.join(folder, "ic_launcher.png"))
    print(f"mipmap-{density}/ic_launcher.png  {px}x{px}")

# 圆形启动器图标（部分 OEM 桌面取 roundIcon）
print("done")
