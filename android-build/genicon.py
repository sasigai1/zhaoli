# 生成「留白」启动图标：暖纸底 + 青瓷留白环 + 黄铜呼吸点
import zlib, struct, math, os

def png_write(path, w, h, rgba):
    raw = b''.join(b'\x00' + bytes(rgba[y*w*4:(y+1)*w*4]) for y in range(h))
    def chunk(tag, data):
        c = tag + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    out = b'\x89PNG\r\n\x1a\n'
    out += chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    out += chunk(b'IDAT', zlib.compress(raw, 9))
    out += chunk(b'IEND', b'')
    open(path, 'wb').write(out)

PAPER = (251, 250, 247)     # #FBFAF7
CELADON = (147, 166, 155)   # #93A69B
BRASS = (176, 129, 60)      # #B0813C

def render(size, ss=4):
    W = size * ss
    px = [0] * (W * W * 4)
    cx = cy = (W - 1) / 2
    R = W * 0.335            # 环半径
    TH = W * 0.075           # 环粗细
    gap = math.radians(105)  # 缺口（留白）
    start = -math.pi/2 - gap/2
    end = -math.pi/2 + gap/2 + math.tau
    # 呼吸点：缺口中央外侧
    dot_c = (cx + math.cos(-math.pi/2) * R, cy + math.sin(-math.pi/2) * R)
    dot_r = W * 0.062
    for y in range(W):
        for x in range(W):
            dx, dy = x - cx, y - cy
            d = math.hypot(dx, dy)
            r, g, b, a = *PAPER, 255
            # 环：距离 + 角度（避开缺口）
            ang = math.atan2(dy, dx)
            in_gap = False
            na = (ang - start) % math.tau
            if na < gap:
                in_gap = True
            if abs(d - R) < TH/2 and not in_gap:
                # 抗锯齿边缘
                edge = max(0.0, min(1.0, TH/2 - abs(d - R) + 0.5))
                r, g, b = CELADON
                a = int(255 * edge)
            # 黄铜呼吸点
            dd = math.hypot(x - dot_c[0], y - dot_c[1])
            if dd < dot_r:
                e = max(0.0, min(1.0, dot_r - dd + 0.5))
                r, g, b = BRASS
                a = int(255 * e)
            i = (y * W + x) * 4
            px[i], px[i+1], px[i+2], px[i+3] = r, g, b, a
    # 超采样降采样
    out = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            rs = gs = bs = cnt = 0
            for sy in range(ss):
                for sx in range(ss):
                    i = ((y*ss+sy) * W + (x*ss+sx)) * 4
                    rs += px[i]; gs += px[i+1]; bs += px[i+2]
                    cnt += 1
            o = (y * size + x) * 4
            out[o], out[o+1], out[o+2], out[o+3] = rs//cnt, gs//cnt, bs//cnt, 255
    return out

base = '/workspace/android-build/app/res'
for dpi, sz in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
    d = f'{base}/mipmap-{dpi}'
    os.makedirs(d, exist_ok=True)
    png_write(f'{d}/ic_launcher.png', sz, sz, render(sz))
    print(dpi, 'ok')
