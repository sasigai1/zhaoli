package com.orbit.schedule;

import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.io.OutputStream;

public class MainActivity extends Activity {

    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private static final int FILE_REQ = 1001;
    private static final int NOTIF_REQ = 1002;
    private static final String CHANNEL_ID = "schedule_reminder";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 全局崩溃捕获：崩溃堆栈写入 crash.log，下次启动显示报告
        Thread.setDefaultUncaughtExceptionHandler((t, e) -> {
            try {
                java.io.File f = new java.io.File(getFilesDir(), "crash.log");
                try (java.io.PrintWriter w = new java.io.PrintWriter(new java.io.FileWriter(f))) {
                    w.println("=== 日程圆盘崩溃报告 ===");
                    w.println("thread: " + t.getName());
                    w.println("device: " + Build.MANUFACTURER + " " + Build.MODEL);
                    w.println("android: " + Build.VERSION.RELEASE + " (API " + Build.VERSION.SDK_INT + ")");
                    w.println("version: " + BuildConfig.VERSION_NAME + " (" + BuildConfig.VERSION_CODE + ")");
                    w.println("time: " + new java.util.Date());
                    w.println();
                    e.printStackTrace(w);
                }
            } catch (Throwable ignored) { }
            System.exit(2);
        });

        // 上次崩溃了？显示崩溃报告页
        java.io.File crashLog = new java.io.File(getFilesDir(), "crash.log");
        if (crashLog.exists()) {
            showCrashReport(crashLog);
            return;
        }

        try { setupEdgeToEdge(); } catch (Throwable t) { record(t, "setupEdgeToEdge"); }
        try { createNotificationChannel(); } catch (Throwable t) { record(t, "createNotificationChannel"); }
        try { requestNotificationPermission(); } catch (Throwable t) { record(t, "requestNotificationPermission"); }

        try {
            initWebView();
        } catch (Throwable t) {
            record(t, "initWebView");
            showErrorScreen("WebView 初始化失败：\n\n" + stackOf(t));
        }
    }

    /** 把非致命异常也记录到同一个日志文件 */
    private void record(Throwable t, String where) {
        try {
            java.io.File f = new java.io.File(getFilesDir(), "crash.log");
            try (java.io.PrintWriter w = new java.io.PrintWriter(new java.io.FileWriter(f))) {
                w.println("=== 日程圆盘错误报告（非致命）===\n");
                w.println("stage: " + where);
                w.println("device: " + Build.MANUFACTURER + " " + Build.MODEL);
                w.println("android: " + Build.VERSION.RELEASE + " (API " + Build.VERSION.SDK_INT + ")");
                w.println();
                t.printStackTrace(w);
            }
        } catch (Throwable ignored) { }
    }

    private static String stackOf(Throwable t) {
        java.io.StringWriter sw = new java.io.StringWriter();
        t.printStackTrace(new java.io.PrintWriter(sw));
        return sw.toString();
    }

    private void initWebView() {
        webView = new WebView(this);
        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);               // localStorage 数据持久化
        ws.setAllowFileAccess(true);
        ws.setMediaPlaybackRequiresUserGesture(false); // 提示音无需用户手势
        ws.setTextZoom(100);                          // 不受系统字体缩放影响

        webView.setWebViewClient(new WebViewClient());
        // 支持 <input type="file">（导入备份）
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                i.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/json", "text/*"});
                try {
                    startActivityForResult(Intent.createChooser(i, "选择备份文件"), FILE_REQ);
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });
        webView.addJavascriptInterface(new Bridge(), "AndroidBridge");
        webView.loadUrl("file:///android_asset/www/index.html");
        setContentView(webView);
    }

    /** 全面屏：沉浸边到边 + 刘海区域延伸 + 浅色状态栏（白底深色图标） */
    private void setupEdgeToEdge() {
        Window w = getWindow();
        w.setStatusBarColor(Color.TRANSPARENT);
        w.setNavigationBarColor(Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= 28) {
            w.getAttributes().layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }
        if (Build.VERSION.SDK_INT >= 30) {
            w.setDecorFitsSystemWindows(false);
            WindowInsetsController c = w.getInsetsController();
            if (c != null) {
                c.setSystemBarsAppearance(
                        WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                                | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,
                        WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                                | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
            }
            if (Build.VERSION.SDK_INT >= 31) {
                w.setStatusBarContrastEnforced(false);
                w.setNavigationBarContrastEnforced(false);
            }
        } else {
            w.getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
                            | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(
                    CHANNEL_ID, "日程提醒", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("日程到期提醒");
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            nm.createNotificationChannel(ch);
        }
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, NOTIF_REQ);
        }
    }

    /** 返回键：不在圆盘页时先返回圆盘，已在圆盘页则退到后台 */
    @Override
    public void onBackPressed() {
        if (webView == null) { super.onBackPressed(); return; }
        webView.evaluateJavascript(
                "(typeof currentView==='undefined')?'disc':currentView", value -> {
                    String v = value == null ? "" : value.replace("\"", "");
                    if (!"disc".equals(v)) {
                        webView.evaluateJavascript("go('disc')", null);
                    } else {
                        moveTaskToBack(true);
                    }
                });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_REQ && fileCallback != null) {
            Uri[] uris = (resultCode == RESULT_OK && data != null && data.getData() != null)
                    ? new Uri[]{data.getData()} : null;
            fileCallback.onReceiveValue(uris);
            fileCallback = null;
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) webView.destroy();
        super.onDestroy();
    }

    /* ============================================================
     * 崩溃报告 / 错误界面（纯原生，不依赖 WebView）
     * ============================================================ */

    private void showCrashReport(java.io.File log) {
        String text;
        try {
            text = new String(java.nio.file.Files.readAllBytes(log.toPath()), "UTF-8");
        } catch (Exception e) {
            text = "无法读取崩溃日志: " + e;
        }
        final java.io.File logFile = log;
        setContentView(buildReportView("应用上次启动时崩溃了", text, logFile, true));
    }

    private void showErrorScreen(String text) {
        setContentView(buildReportView("出错了", text, null, false));
    }

    private View buildReportView(String title, String text, java.io.File logFile, boolean isCrash) {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(0xFF14161A);
        root.setFitsSystemWindows(true);

        int pad = (int) (16 * getResources().getDisplayMetrics().density);

        TextView tvTitle = new TextView(this);
        tvTitle.setText(title);
        tvTitle.setTextColor(0xFFFF6B6B);
        tvTitle.setTextSize(18);
        tvTitle.setTypeface(Typeface.DEFAULT_BOLD);
        tvTitle.setPadding(pad, pad, pad, pad / 2);
        root.addView(tvTitle);

        TextView tvHint = new TextView(this);
        tvHint.setText("请截图或复制以下内容反馈给开发者：");
        tvHint.setTextColor(0xFFB0B4BC);
        tvHint.setTextSize(13);
        tvHint.setPadding(pad, 0, pad, pad / 2);
        root.addView(tvHint);

        ScrollView scroll = new ScrollView(this);
        TextView tvLog = new TextView(this);
        tvLog.setText(text);
        tvLog.setTextColor(0xFFE6E6E6);
        tvLog.setTextSize(12);
        tvLog.setTypeface(Typeface.MONOSPACE);
        tvLog.setPadding(pad, pad / 2, pad, pad / 2);
        scroll.addView(tvLog);
        LinearLayout.LayoutParams sp = new LinearLayout.LayoutParams(-1, 0, 1f);
        root.addView(scroll, sp);

        LinearLayout btnRow = new LinearLayout(this);
        btnRow.setOrientation(LinearLayout.HORIZONTAL);
        btnRow.setGravity(Gravity.CENTER);
        btnRow.setPadding(pad, 0, pad, pad);

        Button btnCopy = new Button(this);
        btnCopy.setText(isCrash ? "复制报告并重启" : "复制详情");
        btnCopy.setOnClickListener(v -> {
            try {
                ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                cm.setPrimaryClip(ClipData.newPlainText("crash", text));
                Toast.makeText(this, "已复制", Toast.LENGTH_SHORT).show();
            } catch (Throwable ignored) { }
            if (isCrash) restartApp(logFile);
        });
        btnRow.addView(btnCopy, new LinearLayout.LayoutParams(0, -2, 1f));

        if (isCrash) {
            Button btnRetry = new Button(this);
            btnRetry.setText("直接重启");
            btnRetry.setOnClickListener(v -> restartApp(logFile));
            LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(0, -2, 1f);
            bp.leftMargin = pad / 2;
            btnRow.addView(btnRetry, bp);
        }
        root.addView(btnRow, new LinearLayout.LayoutParams(-1, -2));

        return root;
    }

    private void restartApp(java.io.File logFile) {
        if (logFile != null) logFile.delete();
        Intent i = new Intent(this, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(i);
        finish();
    }

    /* ============================================================
     * 供 Web 端调用的原生能力
     * ============================================================ */

    public class Bridge {

        /** 系统通知（带系统默认提示音） */
        @JavascriptInterface
        public void notify(final String title, final String body) {
            runOnUiThread(() -> {
                try {
                    Intent tap = new Intent(MainActivity.this, MainActivity.class);
                    PendingIntent pi = PendingIntent.getActivity(MainActivity.this, 0, tap,
                            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
                    Notification.Builder b = Build.VERSION.SDK_INT >= 26
                            ? new Notification.Builder(MainActivity.this, CHANNEL_ID)
                            : new Notification.Builder(MainActivity.this);
                    Notification n = b.setContentTitle(title)
                            .setContentText(body)
                            .setSmallIcon(R.drawable.ic_notification)
                            .setContentIntent(pi)
                            .setAutoCancel(true)
                            .build();
                    NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                    nm.notify((int) (System.currentTimeMillis() % 100000), n);
                } catch (Throwable t) {
                    Toast.makeText(MainActivity.this, "通知发送失败", Toast.LENGTH_SHORT).show();
                }
            });
        }

        /** 导出备份：写入「下载」目录（API 29+ 用 MediaStore，更早版本用应用专属目录） */
        @JavascriptInterface
        public void saveFile(final String name, final String base64) {
            new Thread(() -> {
                try {
                    byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
                    if (Build.VERSION.SDK_INT >= 29) {
                        ContentValues v = new ContentValues();
                        v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                        v.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                        Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                        if (uri == null) throw new IllegalStateException("insert failed");
                        try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                            if (os == null) throw new IllegalStateException("open failed");
                            os.write(bytes);
                        }
                    } else {
                        java.io.File dir = getExternalFilesDir(android.os.Environment.DIRECTORY_DOWNLOADS);
                        if (dir == null) throw new IllegalStateException("no dir");
                        try (OutputStream os = new java.io.FileOutputStream(new java.io.File(dir, name))) {
                            os.write(bytes);
                        }
                    }
                } catch (Exception e) {
                    runOnUiThread(() ->
                            Toast.makeText(MainActivity.this, "导出失败", Toast.LENGTH_SHORT).show());
                }
            }).start();
        }
    }
}
