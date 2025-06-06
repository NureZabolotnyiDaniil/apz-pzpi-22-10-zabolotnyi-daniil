package com.smartlighting.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.smartlighting.MainActivity
import com.smartlighting.R

/**
 * FR.Моб.1: Сервіс для обробки push-сповіщень про несправності
 */
class SmartLightingFirebaseMessagingService : FirebaseMessagingService() {
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        // Обробляємо отримане повідомлення
        remoteMessage.notification?.let { notification ->
            showNotification(
                title = notification.title ?: "SmartLighting",
                body = notification.body ?: "Нове сповіщення",
                data = remoteMessage.data
            )
        }
        
        // Якщо є тільки data payload без notification
        if (remoteMessage.notification == null && remoteMessage.data.isNotEmpty()) {
            val title = remoteMessage.data["title"] ?: "SmartLighting"
            val body = remoteMessage.data["body"] ?: "Нове сповіщення"
            showNotification(title, body, remoteMessage.data)
        }
    }
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        
        // Відправляємо новий токен на сервер
        sendTokenToServer(token)
    }
    
    /**
     * Показати локальне сповіщення
     */
    private fun showNotification(
        title: String,
        body: String,
        data: Map<String, String>
    ) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Створюємо канал сповіщень для Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "SmartLighting Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Сповіщення про несправності ліхтарів"
                enableVibration(true)
                enableLights(true)
            }
            notificationManager.createNotificationChannel(channel)
        }
        
        // Створюємо Intent для відкриття додатку
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            // Додаємо дані з push-сповіщення
            data.forEach { (key, value) ->
                putExtra(key, value)
            }
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // Створюємо сповіщення
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification) // Потрібно додати іконку
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .build()
        
        notificationManager.notify(NOTIFICATION_ID, notification)
    }
    
    /**
     * Відправити токен на сервер для реєстрації
     */
    private fun sendTokenToServer(token: String) {
        // Тут має бути логіка відправки токену на бекенд
        // Можна використати SharedPreferences для збереження токену
        // і відправити його при наступному запуску додатку
        
        val sharedPrefs = getSharedPreferences("smartlighting_prefs", Context.MODE_PRIVATE)
        sharedPrefs.edit()
            .putString("fcm_token", token)
            .putBoolean("token_sent_to_server", false)
            .apply()
    }
    
    companion object {
        private const val CHANNEL_ID = "smartlighting_notifications"
        private const val NOTIFICATION_ID = 1001
    }
} 