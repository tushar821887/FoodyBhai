package com.foodybhai.admin;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class OrderActionReceiver extends BroadcastReceiver {

    public static final String ACTION_SILENCE = "com.foodybhai.admin.ACTION_SILENCE";
    public static final String ACTION_ACCEPT = "com.foodybhai.admin.ACTION_ACCEPT";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;

        String action = intent.getAction();
        Log.i("OrderActionReceiver", "Received notification action: " + action);

        OrderForegroundService service = OrderForegroundService.getInstance();

        if (ACTION_SILENCE.equals(action)) {
            if (service != null) {
                service.silenceCurrentAlarm();
            }
        } else if (ACTION_ACCEPT.equals(action)) {
            if (service != null) {
                service.stopAlarm();
            }

            // Bring MainActivity to the front
            Intent openIntent = new Intent(context, MainActivity.class);
            openIntent.setFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK |
                Intent.FLAG_ACTIVITY_REORDER_TO_FRONT |
                Intent.FLAG_ACTIVITY_SINGLE_TOP |
                Intent.FLAG_ACTIVITY_CLEAR_TOP
            );
            openIntent.putExtra("from_order_alert", true);
            String orderId = intent.getStringExtra("order_id");
            if (orderId != null) {
                openIntent.putExtra("order_id", orderId);
            }
            context.startActivity(openIntent);
        }
    }
}
