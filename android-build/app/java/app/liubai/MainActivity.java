package app.liubai;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

/** 「留白」· WebView 壳：加载本地 assets 中的原型 */
@SuppressWarnings("deprecation")
public class MainActivity extends Activity implements View.OnApplyWindowInsetsListener {

    private WebView web;
    private String pendingInsetCss = "";   // 最新安全区 CSS，页面加载完成后注入

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        applyEdgeToEdge();

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage 持久化（留白 patch）
        s.setAllowFileAccess(true);
        s.setTextZoom(100);
        web.setBackgroundColor(Color.parseColor("#FBFAF7")); // 纸白底，避免加载闪黑
        web.setWebViewClient(new LiubaiWebViewClient(this));
        setContentView(web);

        // 把真实系统栏 insets 写入 CSS 变量（--safe-top / --safe-bottom），
        // 不依赖 WebView 对 env(safe-area-inset-*) 的实现差异
        getWindow().getDecorView().setOnApplyWindowInsetsListener(this);

        web.loadUrl("file:///android_asset/index.html");
    }

    /** 全面屏适配：透明系统栏 + 内容延伸到刘海区 + 深色图标（纸白底） */
    private void applyEdgeToEdge() {
        Window w = getWindow();
        // 窗口底色 = 纸白，系统栏透明后不会露出黑底
        w.setBackgroundDrawable(new ColorDrawable(Color.parseColor("#FBFAF7")));
        w.setStatusBarColor(Color.TRANSPARENT);
        w.setNavigationBarColor(Color.TRANSPARENT);

        View d = w.getDecorView();
        int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;       // 浅色背景 → 深色图标
        if (Build.VERSION.SDK_INT >= 26) {
            flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        }
        d.setSystemUiVisibility(flags);

        // 刘海屏：允许内容绘制进 cutout 区域（Android 9+）
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams lp = w.getAttributes();
            lp.layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            w.setAttributes(lp);
        }
    }

    /** 供 WebViewClient 在页面加载完成后回调 */
    void injectInsetCss() {
        if (web != null && !pendingInsetCss.isEmpty()) {
            web.evaluateJavascript(pendingInsetCss, null);
        }
    }

    @Override
    public android.view.WindowInsets onApplyWindowInsets(View v, android.view.WindowInsets insets) {
        pendingInsetCss = String.format(
                "document.documentElement.style.setProperty('--safe-top','%dpx');" +
                "document.documentElement.style.setProperty('--safe-bottom','%dpx');",
                insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetBottom());
        if (web != null) web.evaluateJavascript(pendingInsetCss, null);
        return insets; // 原样返回，让 WebView 继续收到
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) {
            web.goBack();      // SPA hash 路由可回退
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
        }
        super.onDestroy();
    }
}
