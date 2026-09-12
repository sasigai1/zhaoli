package com.mojian.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * 墨笺 WebView 壳: 加载本地 assets 中的 Web 应用。
 * - 外部链接(http/https)交给系统浏览器打开
 * - JS 桥 MojianNative.setDarkMode() 同步状态栏颜色
 * - 返回键先询问页面 window.__mojianBack()
 */
public class MainActivity extends Activity {

    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage 持久化
        s.setAllowFileAccess(true);
        s.setTextZoom(100);                    // 忽略系统字体缩放, 保证布局
        web.setBackgroundColor(Color.parseColor("#f6f5f1"));
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUrl(request.getUrl().toString());
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrl(url);
            }
        });
        web.addJavascriptInterface(new Bridge(), "MojianNative");
        web.loadUrl("file:///android_asset/index.html");
        setContentView(web);
        applyStatusBar(false);
    }

    private boolean handleUrl(String url) {
        if (url != null && url.startsWith("file://")) return false; // 本地内容正常加载
        if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            } catch (Exception ignored) { }
            return true;
        }
        return false;
    }

    /** JS 桥: 由页面调用, 同步状态栏与主题 */
    private class Bridge {
        @JavascriptInterface
        public void setDarkMode(final boolean dark) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() { applyStatusBar(dark); }
            });
        }
    }

    private void applyStatusBar(boolean dark) {
        Window w = getWindow();
        w.setStatusBarColor(Color.parseColor(dark ? "#141518" : "#f6f5f1"));
        View d = w.getDecorView();
        int flags = d.getSystemUiVisibility();
        if (dark) flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        else flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        d.setSystemUiVisibility(flags);
    }

    @Override
    public void onBackPressed() {
        if (web == null) { super.onBackPressed(); return; }
        web.evaluateJavascript(
            "(window.__mojianBack ? window.__mojianBack() : false)",
            new ValueCallback<String>() {
                @Override
                public void onReceiveValue(String value) {
                    if (!"true".equals(value)) {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() { MainActivity.super.onBackPressed(); }
                        });
                    }
                }
            });
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
