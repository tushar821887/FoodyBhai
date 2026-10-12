package com.foodybhai.admin;

import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.view.WindowManager;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {

    @CapacitorPlugin(name = "AppLauncher")
    public static class AppLauncherPlugin extends Plugin {
        @PluginMethod
        public void bringToFront(PluginCall call) {
            try {
                Context context = getContext();

                // 1. Wake screen up with full wake lock
                PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
                if (pm != null) {
                    PowerManager.WakeLock wakeLock = pm.newWakeLock(
                        PowerManager.FULL_WAKE_LOCK |
                        PowerManager.ACQUIRE_CAUSES_WAKEUP |
                        PowerManager.ON_AFTER_RELEASE,
                        "FoodyBhai:NewOrderWakeLock"
                    );
                    wakeLock.acquire(10000); // 10 seconds
                }

                // 2. Bring Activity to Front
                Intent intent = new Intent(context, MainActivity.class);
                intent.addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK |
                    Intent.FLAG_ACTIVITY_REORDER_TO_FRONT |
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
                );
                context.startActivity(intent);

                // 3. Wake screen and unlock keyguard
                MainActivity activity = (MainActivity) getActivity();
                if (activity != null) {
                    activity.runOnUiThread(activity::wakeAndShowScreen);
                }

                call.resolve();
            } catch (Exception e) {
                call.reject("Failed to bring app to front: " + e.getMessage());
            }
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppLauncherPlugin.class);
        super.onCreate(savedInstanceState);
        wakeAndShowScreen();
        enableUnrestrictedAudioAutoplay();
    }

    @Override
    public void onResume() {
        super.onResume();
        wakeAndShowScreen();
        enableUnrestrictedAudioAutoplay();
    }

    public void wakeAndShowScreen() {
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
    }

    private void enableUnrestrictedAudioAutoplay() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebSettings settings = getBridge().getWebView().getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
        }
    }
}
