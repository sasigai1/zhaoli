import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.io.File;

/**
 * 由 master-icon.png 生成 Android 各密度图标。
 * 先中心裁剪(去掉边缘的水印/杂质), 再输出:
 *  - mipmap 各密度/ic_launcher.png    传统圆角方形图标
 *  - mipmap 各密度/ic_launcher_bg.png 自适应图标背景(全出血)
 *  - mipmap 各密度/ic_launcher_fg.png 自适应图标前景(放大使羽毛落在安全区)
 */
public class IconGen {

    public static void main(String[] args) throws Exception {
        File root = new File("/workspace/mojian-android");
        BufferedImage raw = ImageIO.read(new File(root, "art/master-icon.png"));
        BufferedImage master = centerCrop(raw, 0.70);

        File res = new File(root, "res");
        String[] dpi = {"mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"};
        int[] legacy = {48, 72, 96, 144, 192};       // 传统启动图标
        int[] adaptive = {108, 162, 216, 324, 432};  // 自适应图标 108dp 画布

        for (int i = 0; i < dpi.length; i++) {
            File dir = new File(res, "mipmap-" + dpi[i]);
            dir.mkdirs();

            // 传统图标: 圆角方形
            int s = legacy[i];
            BufferedImage icon = rounded(scale(master, s, s), s * 22 / 100);
            ImageIO.write(icon, "png", new File(dir, "ic_launcher.png"));

            // 自适应背景: 全出血
            int a = adaptive[i];
            ImageIO.write(scale(master, a, a), "png", new File(dir, "ic_launcher_bg.png"));

            // 自适应前景: 放大 115% 居中, 让羽毛图形落在中心安全区
            BufferedImage fg = new BufferedImage(a, a, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g = fg.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            int big = (int) Math.round(a * 1.15);
            g.drawImage(master, (a - big) / 2, (a - big) / 2, big, big, null);
            g.dispose();
            ImageIO.write(fg, "png", new File(dir, "ic_launcher_fg.png"));
        }

        // 输出一张预览图供人工检查
        ImageIO.write(scale(master, 256, 256), "png", new File(root, "art/icon-preview.png"));
        System.out.println("icons generated");
    }

    /** 中心裁剪 ratio 比例(0-1) */
    static BufferedImage centerCrop(BufferedImage src, double ratio) {
        int w = src.getWidth(), h = src.getHeight();
        int cw = (int) (w * ratio), ch = (int) (h * ratio);
        return src.getSubimage((w - cw) / 2, (h - ch) / 2, cw, ch);
    }

    static BufferedImage scale(BufferedImage src, int w, int h) {
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.drawImage(src, 0, 0, w, h, null);
        g.dispose();
        return img;
    }

    static BufferedImage rounded(BufferedImage src, int radius) {
        int w = src.getWidth(), h = src.getHeight();
        BufferedImage out = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = out.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setClip(new RoundRectangle2D.Float(0, 0, w, h, radius * 2, radius * 2));
        g.drawImage(src, 0, 0, null);
        g.dispose();
        return out;
    }
}
