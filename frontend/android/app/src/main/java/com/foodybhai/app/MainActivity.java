package com.foodybhai.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Ensure Capacitor WebView intercepts custom payment schemes and Android intents
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().setWebViewClient(new BridgeWebViewClient(this.bridge) {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    if (request != null && request.getUrl() != null) {
                        String url = request.getUrl().toString();
                        if (handlePaymentScheme(view, url)) {
                            return true;
                        }
                    }
                    return super.shouldOverrideUrlLoading(view, request);
                }

                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    if (handlePaymentScheme(view, url)) {
                        return true;
                    }
                    return super.shouldOverrideUrlLoading(view, url);
                }
            });
        }
    }

    private boolean handlePaymentScheme(WebView view, String url) {
        if (url == null || url.isEmpty()) {
            return false;
        }

        // Handle Android Intent URLs (e.g. intent://pay?...#Intent;scheme=upi;package=...;end)
        if (url.startsWith("intent://")) {
            try {
                Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                if (intent.resolveActivity(getPackageManager()) != null) {
                    startActivity(intent);
                    return true;
                } else {
                    // Try fallback URL if app is not installed
                    String fallbackUrl = intent.getStringExtra("browser_fallback_url");
                    if (fallbackUrl != null && !fallbackUrl.isEmpty()) {
                        view.loadUrl(fallbackUrl);
                        return true;
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            return true;
        }

        // Handle direct UPI and app-specific payment schemes
        if (url.startsWith("upi://") || url.startsWith("tez://") || 
            url.startsWith("phonepe://") || url.startsWith("paytmmp://") || 
            url.startsWith("credpay://")) {
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                if (url.startsWith("upi://")) {
                    // If generic upi://, present chooser so Android doesn't default to WhatsApp
                    Intent chooser = Intent.createChooser(intent, "Pay via UPI App");
                    chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(chooser);
                } else if (intent.resolveActivity(getPackageManager()) != null) {
                    startActivity(intent);
                } else {
                    // Fallback to generic UPI if specific app protocol isn't found
                    String upiFallback = url.replaceFirst("^[a-z]+://", "upi://");
                    Intent fallbackIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(upiFallback));
                    fallbackIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    Intent chooser = Intent.createChooser(fallbackIntent, "Pay via UPI App");
                    chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(chooser);
                }
                return true;
            } catch (Exception e) {
                e.printStackTrace();
                return true;
            }
        }

        return false;
    }
}
