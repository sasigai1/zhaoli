package app.liubai;

import android.webkit.WebView;
import android.webkit.WebViewClient;

/** 页面加载完成后注入安全区 CSS 变量（顶级类，规避 d8 对匿名内部类的兼容 bug） */
public class LiubaiWebViewClient extends WebViewClient {

    private final MainActivity host;

    LiubaiWebViewClient(MainActivity host) {
        this.host = host;
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        host.injectInsetCss();   // 页面就绪后补一次注入，覆盖加载早期丢失的情况
    }
}
