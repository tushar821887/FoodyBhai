package com.foodybhai.admin;

import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Log;
import android.view.WindowManager;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "MainActivity";

    @CapacitorPlugin(name = "OrderAlertPlugin")
    public static class OrderAlertPlugin extends Plugin {

        @PluginMethod
        public void startService(PluginCall call) {
            try {
                Context ctx = getContext();
                Intent serviceIntent = new Intent(ctx, OrderForegroundService.class);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    ctx.startForegroundService(serviceIntent);
                } else {
                    ctx.startService(serviceIntent);
                }
                call.resolve();
            } catch (Exception e) {
                call.reject("Failed to start service: " + e.getMessage());
            }
        }

        @PluginMethod
        public void stopAlarm(PluginCall call) {
            try {
                OrderForegroundService service = OrderForegroundService.getInstance();
                if (service != null) {
                    service.stopAlarm();
                }
                call.resolve();
            } catch (Exception e) {
                call.reject("Failed to stop alarm: " + e.getMessage());
            }
        }

        @PluginMethod
        public void silenceAlarm(PluginCall call) {
            try {
                OrderForegroundService service = OrderForegroundService.getInstance();
                if (service != null) {
                    service.silenceCurrentAlarm();
                }
                call.resolve();
            } catch (Exception e) {
                call.reject("Failed to silence alarm: " + e.getMessage());
            }
        }

        @PluginMethod
        public void configure(PluginCall call) {
            try {
                String apiUrl = call.getString("apiUrl");
                if (apiUrl != null && !apiUrl.isEmpty()) {
                    OrderForegroundService service = OrderForegroundService.getInstance();
                    if (service != null) {
                        service.updateApiUrl(apiUrl);
                    } else {
                        Context ctx = getContext();
                        ctx.getSharedPreferences(OrderForegroundService.PREFS_NAME, Context.MODE_PRIVATE)
                            .edit()
                            .putString(OrderForegroundService.KEY_API_URL, apiUrl)
                            .apply();
                    }
                }
                call.resolve();
            } catch (Exception e) {
                call.reject("Failed to configure: " + e.getMessage());
            }
        }

        @PluginMethod
        public void isRinging(PluginCall call) {
            OrderForegroundService service = OrderForegroundService.getInstance();
            boolean ringing = service != null && service.isCurrentlyRinging();
            JSObject ret = new JSObject();
            ret.put("isRinging", ringing);
            call.resolve(ret);
        }

        @PluginMethod
        public void bringToFront(PluginCall call) {
            try {
                MainActivity activity = (MainActivity) getActivity();
                if (activity != null) {
                    activity.runOnUiThread(activity::wakeAndShowScreen);
                }
                call.resolve();
            } catch (Exception e) {
                call.reject("Failed: " + e.getMessage());
            }
        }

        @PluginMethod
        public void requestBatteryOptimization(PluginCall call) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    Context ctx = getContext();
                    String packageName = ctx.getPackageName();
                    PowerManager pm = (PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
                    if (pm != null && !pm.isIgnoringBatteryOptimizations(packageName)) {
                        Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                        intent.setData(Uri.parse("package:" + packageName));
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        ctx.startActivity(intent);
                    }
                }
                call.resolve();
            } catch (Exception e) {
                call.reject("Failed to request battery exemption: " + e.getMessage());
            }
        }

        @PluginMethod
        public void requestOverlayPermission(PluginCall call) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    Context ctx = getContext();
                    if (!Settings.canDrawOverlays(ctx)) {
                        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                                Uri.parse("package:" + ctx.getPackageName()));
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        ctx.startActivity(intent);
                    }
                }
                call.resolve();
            } catch (Exception e) {
                call.reject("Failed to request overlay permission: " + e.getMessage());
            }
        }
    }

    // Legacy plugin alias for backward compatibility
    @CapacitorPlugin(name = "AppLauncher")
    public static class AppLauncherPlugin extends Plugin {
        @PluginMethod
        public void bringToFront(PluginCall call) {
            MainActivity activity = (MainActivity) getActivity();
            if (activity != null) {
                activity.runOnUiThread(activity::wakeAndShowScreen);
            }
            call.resolve();
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(OrderAlertPlugin.class);
        registerPlugin(AppLauncherPlugin.class);
        super.onCreate(savedInstanceState);

        wakeAndShowScreen();
        enableUnrestrictedAudioAutoplay();
        startOrderForegroundService();
    }

    @Override
    public void onResume() {
        super.onResume();
        wakeAndShowScreen();
        enableUnrestrictedAudioAutoplay();
        startOrderForegroundService();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        wakeAndShowScreen();
    }

    private void startOrderForegroundService() {
        try {
            Intent serviceIntent = new Intent(this, OrderForegroundService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }
            Log.i(TAG, "OrderForegroundService started from MainActivity");
        } catch (Exception e) {
            Log.w(TAG, "Could not start OrderForegroundService: " + e.getMessage());
        }
    }

    public void wakeAndShowScreen() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                setShowWhenLocked(true);
                setTurnScreenOn(true);
            }

            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            );

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
                if (km != null) {
                    km.requestDismissKeyguard(this, null);
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "wakeAndShowScreen error: " + e.getMessage());
        }
    }

    private void enableUnrestrictedAudioAutoplay() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebSettings settings = getBridge().getWebView().getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
        }
    }
}
