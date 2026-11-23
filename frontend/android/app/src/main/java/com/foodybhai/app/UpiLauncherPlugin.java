package com.foodybhai.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "UpiLauncher")
public class UpiLauncherPlugin extends Plugin {

    private static final String TAG = "UpiLauncher";

    @PluginMethod
    public void openUpi(PluginCall call) {
        String url = call.getString("url");
        String packageName = call.getString("packageName");

        if (url == null || url.trim().isEmpty()) {
            call.reject("URL is required");
            return;
        }

        // Clean up URI for direct app launch (e.g. upi://pay?pa=...&am=...)
        String cleanUpi = url.startsWith("intent://")
            ? url.replaceFirst("^intent://", "upi://").replaceAll("#Intent;.*$", "")
            : (url.startsWith("upi://") ? url : url.replaceFirst("^[a-z]+://", "upi://"));

        // 1. Try launching targeted app directly by package name (GPay, PhonePe, Paytm, etc.)
        if (packageName != null && !packageName.trim().isEmpty()) {
            try {
                Intent targetedIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(cleanUpi));
                targetedIntent.setPackage(packageName.trim());
                targetedIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(targetedIntent);
                Log.i(TAG, "Launched targeted UPI app directly: " + packageName);
                call.resolve();
                return;
            } catch (ActivityNotFoundException e) {
                Log.w(TAG, "Targeted app " + packageName + " not installed, trying intent scheme");
            } catch (Exception e) {
                Log.w(TAG, "Direct launch failed for " + packageName + ": " + e.getMessage());
            }

            // Also try parsing the intent:// uri if present
            if (url.startsWith("intent://")) {
                try {
                    Intent parsedIntent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                    parsedIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(parsedIntent);
                    Log.i(TAG, "Launched via Intent.parseUri: " + packageName);
                    call.resolve();
                    return;
                } catch (Exception ignored) {}
            }
        }

        // 2. Fallback to System Chooser for all installed UPI apps
        try {
            Intent chooserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(cleanUpi));
            chooserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            Intent chooser = Intent.createChooser(chooserIntent, "Pay via UPI App");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(chooser);
            call.resolve();
        } catch (Exception ex) {
            Log.e(TAG, "Chooser failed: " + ex.getMessage());
            call.reject("Could not launch UPI app: " + ex.getMessage());
        }
    }
}
