package com.foodybhai.admin;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.SystemClock;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class OrderForegroundService extends Service {

    private static final String TAG = "OrderForegroundService";
    public static final String CHANNEL_STANDBY = "foodybhai_monitor_standby";
    public static final String CHANNEL_ALARM = "foodybhai_order_alerts_v3";

    public static final int NOTIF_STANDBY_ID = 1001;
    public static final int NOTIF_ALARM_ID = 1002;

    public static final String ACTION_START_SERVICE = "com.foodybhai.admin.START_SERVICE";
    public static final String ACTION_STOP_ALARM = "com.foodybhai.admin.STOP_ALARM";
    public static final String ACTION_SILENCE = "com.foodybhai.admin.SILENCE";
    public static final String ACTION_WATCHDOG_CHECK = "com.foodybhai.admin.WATCHDOG_CHECK";

    public static final String PREFS_NAME = "FoodyBhaiAdminPrefs";
    public static final String KEY_API_URL = "apiUrl";
    public static final String DEFAULT_API_URL = "https://api.foodybhai.in/api";

    private static OrderForegroundService instance;

    private MediaPlayer mediaPlayer;
    private Ringtone fallbackRingtone;
    private Vibrator vibrator;
    private PowerManager.WakeLock wakeLock;
    private PowerManager.WakeLock standbyWakeLock;

    private boolean isRinging = false;
    private String currentAlertOrderId = "";
    private String silencedOrderId = "";

    private Thread sseThread;
    private Thread pollThread;
    private volatile boolean isRunning = false;

    public static OrderForegroundService getInstance() {
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        createNotificationChannels();
        startInForegroundStandby();
        acquireStandbyWakeLock();
        startMonitoring();
        scheduleWatchdogAlarm();
        Log.i(TAG, "OrderForegroundService created and monitoring started");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_STOP_ALARM.equals(action)) {
                stopAlarm();
            } else if (ACTION_SILENCE.equals(action)) {
                silenceCurrentAlarm();
            } else if (ACTION_WATCHDOG_CHECK.equals(action)) {
                // Watchdog fired via AlarmManager: poll pending orders in background thread
                new Thread(() -> {
                    try {
                        checkPendingOrdersEndpoint();
                    } catch (Exception ignored) {}
                }, "FoodyBhai-Watchdog-Worker").start();
                scheduleWatchdogAlarm();
            }
        } else {
            scheduleWatchdogAlarm();
        }
        return START_STICKY;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        Log.i(TAG, "App task removed from recents. Keeping OrderForegroundService alive and scheduling restart watchdog.");
        try {
            Intent restartIntent = new Intent(getApplicationContext(), OrderForegroundService.class);
            restartIntent.setPackage(getPackageName());
            int piFlags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0);
            PendingIntent pi = PendingIntent.getService(getApplicationContext(), 101, restartIntent, piFlags);
            AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
            if (am != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP, SystemClock.elapsedRealtime() + 1500, pi);
                } else {
                    am.set(AlarmManager.ELAPSED_REALTIME_WAKEUP, SystemClock.elapsedRealtime() + 1500, pi);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed in onTaskRemoved: " + e.getMessage());
        }
        super.onTaskRemoved(rootIntent);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        stopMonitoring();
        stopAlarm();
        releaseStandbyWakeLock();
        instance = null;
        super.onDestroy();
        Log.i(TAG, "OrderForegroundService destroyed");
    }

    private void acquireStandbyWakeLock() {
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null && (standbyWakeLock == null || !standbyWakeLock.isHeld())) {
                standbyWakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "FoodyBhai:StandbyMonitorWakeLock");
                standbyWakeLock.setReferenceCounted(false);
                standbyWakeLock.acquire();
                Log.i(TAG, "Standby PARTIAL_WAKE_LOCK acquired for 24/7 background monitoring");
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not acquire Standby WakeLock: " + e.getMessage());
        }
    }

    private void releaseStandbyWakeLock() {
        try {
            if (standbyWakeLock != null && standbyWakeLock.isHeld()) {
                standbyWakeLock.release();
                standbyWakeLock = null;
            }
        } catch (Exception ignored) {}
    }

    private void scheduleWatchdogAlarm() {
        try {
            Intent intent = new Intent(this, OrderForegroundService.class);
            intent.setAction(ACTION_WATCHDOG_CHECK);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0);
            PendingIntent pi = PendingIntent.getService(this, 102, intent, flags);
            AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
            if (am != null) {
                // 25 seconds interval to stay alert without battery drain
                long triggerAt = SystemClock.elapsedRealtime() + 25000;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP, triggerAt, pi);
                } else {
                    am.set(AlarmManager.ELAPSED_REALTIME_WAKEUP, triggerAt, pi);
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not schedule watchdog alarm: " + e.getMessage());
        }
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            // 1. Standby monitoring channel (silent, low priority)
            NotificationChannel standbyChannel = new NotificationChannel(
                CHANNEL_STANDBY,
                "FoodyBhai Order Monitor (Background)",
                NotificationManager.IMPORTANCE_LOW
            );
            standbyChannel.setDescription("Keeps FoodyBhai Admin ready to receive live orders when app is closed");
            standbyChannel.setShowBadge(false);
            nm.createNotificationChannel(standbyChannel);

            // 2. High-priority Alarm Channel (Loud, vibrating, lock-screen banner)
            NotificationChannel alarmChannel = new NotificationChannel(
                CHANNEL_ALARM,
                "Incoming Orders High-Priority Alarm",
                NotificationManager.IMPORTANCE_HIGH
            );
            alarmChannel.setDescription("Loud alarm bells and high priority alerts for new pending orders");
            alarmChannel.enableLights(true);
            alarmChannel.setLightColor(0xFFFF4757);
            alarmChannel.enableVibration(true);
            alarmChannel.setVibrationPattern(new long[]{0, 1000, 500, 1000, 500});
            alarmChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM)
                .build();
            Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.order_alert);
            alarmChannel.setSound(soundUri, audioAttributes);

            nm.createNotificationChannel(alarmChannel);
        }
    }

    private void startInForegroundStandby() {
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_STANDBY)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("FoodyBhai Order Monitor Active")
            .setContentText("Listening for incoming orders in background 24/7...")
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setContentIntent(pendingIntent);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            int type = 0;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                type = ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC | ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK;
            }
            try {
                startForeground(NOTIF_STANDBY_ID, builder.build(), type);
            } catch (Exception e) {
                startForeground(NOTIF_STANDBY_ID, builder.build());
            }
        } else {
            startForeground(NOTIF_STANDBY_ID, builder.build());
        }
    }

    private String getApiUrl() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        return prefs.getString(KEY_API_URL, DEFAULT_API_URL);
    }

    public void updateApiUrl(String url) {
        if (url != null && !url.trim().isEmpty()) {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            prefs.edit().putString(KEY_API_URL, url.trim()).apply();
            Log.i(TAG, "Updated API URL: " + url);
        }
    }

    private void startMonitoring() {
        isRunning = true;

        // Thread 1: Real-time Server-Sent Events (SSE) Stream
        sseThread = new Thread(() -> {
            while (isRunning) {
                HttpURLConnection conn = null;
                BufferedReader reader = null;
                try {
                    String base = getApiUrl();
                    String sseUrl = base + "/orders/live-stream";
                    Log.d(TAG, "Connecting to SSE stream: " + sseUrl);

                    URL url = new URL(sseUrl);
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    conn.setRequestProperty("Accept", "text/event-stream");
                    conn.setReadTimeout(45000); // 45s timeout detects dead connections quickly
                    conn.setConnectTimeout(15000);
                    conn.connect();

                    InputStream is = conn.getInputStream();
                    reader = new BufferedReader(new InputStreamReader(is));
                    String line;

                    while (isRunning && (line = reader.readLine()) != null) {
                        if (line.startsWith("data:")) {
                            String data = line.substring(5).trim();
                            if (!data.isEmpty()) {
                                handleLiveEvent(data);
                            }
                        }
                    }
                } catch (Exception e) {
                    Log.w(TAG, "SSE stream disconnected or failed (" + e.getMessage() + "), retrying in 4s...");
                } finally {
                    try { if (reader != null) reader.close(); } catch (Exception ignored) {}
                    try { if (conn != null) conn.disconnect(); } catch (Exception ignored) {}
                }

                try {
                    Thread.sleep(4000);
                } catch (InterruptedException ignored) {
                    break;
                }
            }
        }, "FoodyBhai-SSE-Thread");
        sseThread.start();

        // Thread 2: Fast Polling Fallback (Checks /orders/pending-alert every 6 seconds)
        pollThread = new Thread(() -> {
            while (isRunning) {
                try {
                    checkPendingOrdersEndpoint();
                } catch (Exception e) {
                    Log.w(TAG, "Error in pending orders polling: " + e.getMessage());
                }

                try {
                    Thread.sleep(6000);
                } catch (InterruptedException ignored) {
                    break;
                }
            }
        }, "FoodyBhai-Poll-Thread");
        pollThread.start();
    }

    private void stopMonitoring() {
        isRunning = false;
        if (sseThread != null) {
            sseThread.interrupt();
            sseThread = null;
        }
        if (pollThread != null) {
            pollThread.interrupt();
            pollThread = null;
        }
    }

    private void handleLiveEvent(String rawJson) {
        try {
            JSONObject event = new JSONObject(rawJson);
            String type = event.optString("type");
            if ("ping".equalsIgnoreCase(type)) {
                // Heartbeat keep-alive from server; connection is healthy
                return;
            }

            JSONObject data = event.optJSONObject("data");

            if ("new_order".equals(type) && data != null) {
                String status = data.optString("status", "pending");
                if ("pending".equalsIgnoreCase(status)) {
                    Log.i(TAG, "⚡ INSTANT NEW ORDER DETECTED VIA SSE!");
                    triggerOrderAlarm(data);
                }
            } else if ("order_status_updated".equals(type) || "order_cancelled".equals(type)) {
                // If the order currently ringing was updated (accepted/cancelled), stop the alarm!
                String orderId = data != null ? data.optString("_id") : "";
                if (!orderId.isEmpty() && orderId.equals(currentAlertOrderId)) {
                    String status = data.optString("status", "");
                    if (!"pending".equalsIgnoreCase(status)) {
                        stopAlarm();
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to parse SSE event: " + e.getMessage());
        }
    }

    private void checkPendingOrdersEndpoint() {
        HttpURLConnection conn = null;
        BufferedReader reader = null;
        try {
            String checkUrl = getApiUrl() + "/orders/pending-alert";
            URL url = new URL(checkUrl);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);

            if (conn.getResponseCode() == 200) {
                reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                JSONObject res = new JSONObject(sb.toString());
                boolean hasPending = res.optBoolean("hasPending", false);
                String latestOrderId = res.optString("latestOrderId", "");

                if (hasPending && !latestOrderId.isEmpty()) {
                    if (!latestOrderId.equals(silencedOrderId)) {
                        if (!isRinging || !latestOrderId.equals(currentAlertOrderId)) {
                            Log.i(TAG, "🔔 Pending order detected via poll check: " + latestOrderId);
                            triggerOrderAlarm(res);
                        }
                    }
                } else if (!hasPending) {
                    // No pending orders in restaurant! Silence if currently ringing
                    if (isRinging) {
                        Log.i(TAG, "All pending orders cleared on server. Stopping alarm.");
                        stopAlarm();
                    }
                    silencedOrderId = "";
                }
            }
        } catch (Exception e) {
            // network hiccup, ignore
        } finally {
            try { if (reader != null) reader.close(); } catch (Exception ignored) {}
            try { if (conn != null) conn.disconnect(); } catch (Exception ignored) {}
        }
    }

    /**
     * Wakes screen, launches MainActivity, starts continuous ringing, and shows full-screen heads-up notification
     */
    public synchronized void triggerOrderAlarm(JSONObject orderData) {
        try {
            String orderId = orderData.optString("_id");
            if (orderId.isEmpty()) orderId = orderData.optString("latestOrderId", "NewOrder");

            currentAlertOrderId = orderId;
            isRinging = true;

            int amount = orderData.optInt("totalAmount", 0);
            String customerName = "Customer";
            if (orderData.has("deliveryDetails")) {
                customerName = orderData.optJSONObject("deliveryDetails").optString("name", "Customer");
            } else if (orderData.has("customerName")) {
                customerName = orderData.optString("customerName", "Customer");
            }

            String orderType = orderData.optString("orderType", "delivery");
            String typeBadge = "pickup".equalsIgnoreCase(orderType) ? "Self Pickup" : "Delivery";

            String shortId = orderId.length() > 6 ? orderId.substring(orderId.length() - 6).toUpperCase() : orderId;

            // 1. Wake screen up with full wake lock
            acquireWakeLock();

            // 2. Automatically launch MainActivity immediately
            launchMainActivity(orderId);

            // 3. Post full-screen, high-priority heads-up notification with action buttons
            postAlarmNotification(orderId, shortId, amount, customerName, typeBadge);

            // 4. Start continuous looping MediaPlayer alarm sound
            startLoopingAudio();

            // 5. Start continuous pulsing vibration
            startContinuousVibration();

            Log.i(TAG, "🚨 Alarm ringing triggered successfully for order #" + shortId);

        } catch (Exception e) {
            Log.e(TAG, "Error triggering order alarm: " + e.getMessage(), e);
        }
    }

    private void acquireWakeLock() {
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                if (wakeLock != null && wakeLock.isHeld()) {
                    wakeLock.release();
                }
                wakeLock = pm.newWakeLock(
                    PowerManager.FULL_WAKE_LOCK |
                    PowerManager.ACQUIRE_CAUSES_WAKEUP |
                    PowerManager.SCREEN_BRIGHT_WAKE_LOCK |
                    PowerManager.ON_AFTER_RELEASE,
                    "FoodyBhai:NewOrderAlarmWakeLock"
                );
                wakeLock.acquire(90000); // Hold wake lock for up to 90 seconds
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not acquire WakeLock: " + e.getMessage());
        }
    }

    private void launchMainActivity(String orderId) {
        try {
            Intent intent = new Intent(this, MainActivity.class);
            intent.setAction(Intent.ACTION_MAIN);
            intent.addCategory(Intent.CATEGORY_LAUNCHER);
            intent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK |
                Intent.FLAG_ACTIVITY_REORDER_TO_FRONT |
                Intent.FLAG_ACTIVITY_SINGLE_TOP |
                Intent.FLAG_ACTIVITY_CLEAR_TOP
            );
            intent.putExtra("from_order_alert", true);
            intent.putExtra("order_id", orderId);
            startActivity(intent);
            Log.i(TAG, "startActivity(MainActivity) dispatched successfully");
        } catch (Exception e) {
            Log.w(TAG, "Direct startActivity failed (may be restricted by background start rules): " + e.getMessage());
        }
    }

    private void postAlarmNotification(String orderId, String shortId, int amount, String customerName, String typeBadge) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        // Full Screen Intent: triggers Android to display MainActivity on lock screen
        Intent fullScreenIntent = new Intent(this, MainActivity.class);
        fullScreenIntent.addFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK |
            Intent.FLAG_ACTIVITY_REORDER_TO_FRONT |
            Intent.FLAG_ACTIVITY_SINGLE_TOP
        );
        fullScreenIntent.putExtra("from_order_alert", true);
        fullScreenIntent.putExtra("order_id", orderId);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0);
        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(this, orderId.hashCode(), fullScreenIntent, flags);

        // Silence Action Intent
        Intent silenceIntent = new Intent(this, OrderActionReceiver.class);
        silenceIntent.setAction(OrderActionReceiver.ACTION_SILENCE);
        silenceIntent.putExtra("order_id", orderId);
        PendingIntent silencePendingIntent = PendingIntent.getBroadcast(this, 201, silenceIntent, flags);

        // Accept Action Intent (opens app and stops ringing)
        Intent acceptIntent = new Intent(this, OrderActionReceiver.class);
        acceptIntent.setAction(OrderActionReceiver.ACTION_ACCEPT);
        acceptIntent.putExtra("order_id", orderId);
        PendingIntent acceptPendingIntent = PendingIntent.getBroadcast(this, 202, acceptIntent, flags);

        String title = "🚨 NEW ORDER RECEIVED! (#" + shortId + ")";
        String body = "₹" + amount + " • " + customerName + " (" + typeBadge + ") — Tap to Accept!";

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ALARM)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setAutoCancel(false)
            .setFullScreenIntent(fullScreenPendingIntent, true) // Full-screen wake
            .setContentIntent(fullScreenPendingIntent)
            .addAction(R.mipmap.ic_launcher, "Accept Order", acceptPendingIntent)
            .addAction(android.R.drawable.ic_lock_silent_mode, "Silence Ring", silencePendingIntent);

        nm.notify(NOTIF_ALARM_ID, builder.build());
    }

    private void startLoopingAudio() {
        try {
            stopAudio();

            // Ensure alarm audio stream has high volume
            AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
            if (am != null) {
                int maxVol = am.getStreamMaxVolume(AudioManager.STREAM_ALARM);
                int curVol = am.getStreamVolume(AudioManager.STREAM_ALARM);
                if (curVol < maxVol / 2) {
                    am.setStreamVolume(AudioManager.STREAM_ALARM, maxVol, 0);
                }
            }

            try {
                mediaPlayer = new MediaPlayer();
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build());
                } else {
                    mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
                }

                AssetFileDescriptor afd = getResources().openRawResourceFd(R.raw.order_alert);
                if (afd != null) {
                    mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                    afd.close();
                    mediaPlayer.setLooping(true);
                    mediaPlayer.prepare();
                    mediaPlayer.start();
                    Log.i(TAG, "MediaPlayer order alert started looping via STREAM_ALARM");
                    return;
                }
            } catch (Exception e) {
                Log.w(TAG, "MediaPlayer raw resource failed, trying MediaPlayer.create: " + e.getMessage());
                try {
                    mediaPlayer = MediaPlayer.create(this, R.raw.order_alert);
                    if (mediaPlayer != null) {
                        mediaPlayer.setLooping(true);
                        mediaPlayer.start();
                        Log.i(TAG, "MediaPlayer.create started looping successfully");
                        return;
                    }
                } catch (Exception ex) {
                    Log.w(TAG, "MediaPlayer.create failed: " + ex.getMessage());
                }
            }

            // Fallback to loud system Alarm ringtone if custom file failed
            try {
                Uri alertUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
                if (alertUri == null) {
                    alertUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
                }
                if (alertUri != null) {
                    fallbackRingtone = RingtoneManager.getRingtone(this, alertUri);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && fallbackRingtone != null) {
                        fallbackRingtone.setAudioAttributes(new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build());
                    }
                    if (fallbackRingtone != null) {
                        fallbackRingtone.play();
                        Log.i(TAG, "RingtoneManager alarm sound playing as fallback");
                    }
                }
            } catch (Exception ringtoneEx) {
                Log.e(TAG, "Ringtone fallback failed: " + ringtoneEx.getMessage());
            }

        } catch (Exception e) {
            Log.e(TAG, "Failed to start audio playback: " + e.getMessage(), e);
        }
    }

    private void startContinuousVibration() {
        try {
            if (vibrator != null) {
                long[] pattern = new long[]{0, 1000, 500, 1000, 500};
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0)); // 0 repeats indefinitely
                } else {
                    vibrator.vibrate(pattern, 0);
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Vibration failed: " + e.getMessage());
        }
    }

    public synchronized void silenceCurrentAlarm() {
        Log.i(TAG, "Silence requested for order: " + currentAlertOrderId);
        silencedOrderId = currentAlertOrderId;
        stopMediaAndVibrator();
    }

    public synchronized void stopAlarm() {
        Log.i(TAG, "Stopping order alarm completely.");
        isRinging = false;
        currentAlertOrderId = "";
        silencedOrderId = "";

        stopMediaAndVibrator();

        // Cancel Alarm Notification
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.cancel(NOTIF_ALARM_ID);
        }

        if (wakeLock != null && wakeLock.isHeld()) {
            try {
                wakeLock.release();
            } catch (Exception ignored) {}
        }
    }

    private void stopAudio() {
        try {
            if (mediaPlayer != null) {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
                mediaPlayer = null;
            }
        } catch (Exception ignored) {}

        try {
            if (fallbackRingtone != null) {
                if (fallbackRingtone.isPlaying()) {
                    fallbackRingtone.stop();
                }
                fallbackRingtone = null;
            }
        } catch (Exception ignored) {}
    }

    private void stopMediaAndVibrator() {
        stopAudio();
        try {
            if (vibrator != null) {
                vibrator.cancel();
            }
        } catch (Exception ignored) {}
    }

    public boolean isCurrentlyRinging() {
        return isRinging;
    }
}
