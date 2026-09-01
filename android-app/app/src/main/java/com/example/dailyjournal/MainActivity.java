package com.example.dailyjournal;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity {

    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Edge-to-edge：内容延伸到系统栏后面，状态栏/导航栏透明
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.web_view);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true); // localStorage 持久化
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        webView.setWebViewClient(new WebViewClient());
        webView.setBackgroundColor(0xFFFDFDFB);
        webView.loadUrl("file:///android_asset/www/index.html");

        // 真实 insets 注入给页面（覆盖页面内的估算回退，精确避让状态栏/导航栏）
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.root_layout), (view, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            String js = "var p=document.querySelector('.phone');" +
                    "if(p){p.style.setProperty('--sat','" + bars.top + "px');" +
                    "p.style.setProperty('--sab','" + bars.bottom + "px');}";
            if (webView != null) {
                webView.evaluateJavascript(js, null);
            }
            return insets;
        });
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
