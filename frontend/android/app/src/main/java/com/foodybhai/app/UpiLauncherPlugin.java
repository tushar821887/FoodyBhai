package com.foodybhai.app;

import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "UpiLauncher")
public class UpiLauncherPlugin extends Plugin {

    @PluginMethod
    public void openUpi(PluginCall call) {
        String url = call.getString("url");
        String packageName = call.getString("packageName");

        if (url == null || url.trim().isEmpty()) {
            call.reject("URL is required");
            return;
        }

        try {
            Intent intent;
            if (url.startsWith("intent://")) {
                intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
            } else {
                intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            if (intent.getAction() == null) {
                intent.setAction(Intent.ACTION_VIEW);
            }

            if (packageName != null && !packageName.trim().isEmpty()) {
                intent.setPackage(packageName.trim());
                if (getContext().getPackageManager().resolveActivity(intent, 0) != null) {
                    getContext().startActivity(intent);
                    call.resolve();
                    return;
                }
            }

            // Fallback to system UPI chooser with clean upi:// uri
            String cleanUpi = url.startsWith("intent://")
                ? url.replaceFirst("^intent://", "upi://").replaceAll("#Intent;.*$", "")
                : (url.startsWith("upi://") ? url : url.replaceFirst("^[a-z]+://", "upi://"));

            Intent chooserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(cleanUpi));
            chooserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            Intent chooser = Intent.createChooser(chooserIntent, "Pay via UPI App");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(chooser);
            call.resolve();
        } catch (Exception e) {
            try {
                String cleanUpi = url.replaceFirst("^intent://", "upi://").replaceAll("#Intent;.*$", "");
                Intent fallback = new Intent(Intent.ACTION_VIEW, Uri.parse(cleanUpi));
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(Intent.createChooser(fallback, "Pay via UPI App"));
                call.resolve();
            } catch (Exception ex) {
                call.reject("Could not launch UPI app: " + ex.getMessage());
            }
        }
    }
}
