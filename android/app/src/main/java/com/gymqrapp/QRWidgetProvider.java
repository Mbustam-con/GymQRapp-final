package com.gymqrapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

public class QRWidgetProvider extends AppWidgetProvider {
    
    private static final String QUICK_ACCESS_ACTION = "com.gymqrapp.QUICK_ACCESS";
    
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        
        if (QUICK_ACCESS_ACTION.equals(intent.getAction())) {
            Intent launchIntent = new Intent(context, MainActivity.class);
            launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            launchIntent.putExtra("action", "show_qr");
            launchIntent.putExtra("source", "widget");
            context.startActivity(launchIntent);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.qr_widget_small);
        
        Intent intent = new Intent(context, QRWidgetProvider.class);
        intent.setAction(QUICK_ACCESS_ACTION);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context, 
            0, 
            intent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        // Now the ID exists!
        views.setOnClickPendingIntent(R.id.widget_container_small, pendingIntent);
        
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}