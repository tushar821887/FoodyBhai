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
        registerPlugin(UpiLauncherPlugin.class);
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
                if (intent.getAction() == null) {
                    intent.setAction(Intent.ACTION_VIEW);
                }

                try {
                    startActivity(intent);
                    return true;
                } catch (android.content.ActivityNotFoundException ex) {
                    // Try fallback URL if app is not installed
                    String fallbackUrl = intent.getStringExtra("browser_fallback_url");
                    if (fallbackUrl != null && !fallbackUrl.isEmpty()) {
                        view.loadUrl(fallbackUrl);
                        return true;
                    }

                    // Fallback to generic UPI chooser
                    String cleanUrl = url.replaceFirst("^intent://", "upi://").replaceAll("#Intent;.*$", "");
                    Intent fallbackIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(cleanUrl));
                    fallbackIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    Intent chooser = Intent.createChooser(fallbackIntent, "Pay via UPI App");
                    chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(chooser);
                    return true;
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
                if (url.startsWith("upi://")) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    Intent chooser = Intent.createChooser(intent, "Pay via UPI App");
                    chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(chooser);
                } else {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                    } catch (android.content.ActivityNotFoundException ex) {
                        // Fallback to generic UPI if specific app protocol isn't found
                        String upiFallback = url.replaceFirst("^[a-z]+://", "upi://");
                        Intent fallbackIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(upiFallback));
                        fallbackIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        Intent chooser = Intent.createChooser(fallbackIntent, "Pay via UPI App");
                        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(chooser);
                    }
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
