package com.grok.li;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // 挖孔屏 / 状态栏避让：把 WebView 整体内缩，避免顶部内容被遮挡。
    // Android 15+（targetSdk 35+）强制 edge-to-edge，必须手动处理 inset。
    WebView webView = this.bridge.getWebView();
    if (webView != null) {
      ViewCompat.setOnApplyWindowInsetsListener(
          webView,
          (v, windowInsets) -> {
            Insets bars =
                windowInsets.getInsets(
                    WindowInsetsCompat.Type.systemBars()
                        | WindowInsetsCompat.Type.displayCutout());
            v.setPadding(0, bars.top, 0, bars.bottom);
            return windowInsets;
          });
    }
  }
}
