package pl.bultrowicz.greenhouse

import android.app.*
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.net.Uri
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class GreenhouseFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(p0: RemoteMessage) {
        Log.d(TAG, "Got message: ${p0.data}")

        createNotificationChannels()

        val data = p0.data
        val value = data["value"]
        val resource = data["resource"]
        val state = data["state"]

        when (setOf(resource, state)) {
            setOf("temperature", "low") -> sendNotification(
                    getString(R.string.notification_channel_temperature_low_id),
                    getString(R.string.notification_channel_temperature_low_name),
                    getString(R.string.notification_channel_temperature_low_text, value)
                )
            setOf("temperature", "ok") -> sendNotification(
                getString(R.string.notification_channel_temperature_ok_id),
                getString(R.string.notification_channel_temperature_ok_name),
                getString(R.string.notification_channel_temperature_ok_text, value)
            )
            setOf("battery", "low") -> sendNotification(
                getString(R.string.notification_channel_battery_low_id),
                getString(R.string.notification_channel_battery_low_name),
                getString(R.string.notification_channel_battery_low_text, value)
            )
            setOf("battery", "ok") -> sendNotification(
                getString(R.string.notification_channel_battery_ok_id),
                getString(R.string.notification_channel_battery_ok_name),
                getString(R.string.notification_channel_battery_ok_text, value)
            )
            setOf("liveness", "low") -> sendNotification(
                getString(R.string.notification_channel_liveness_low_id),
                getString(R.string.notification_channel_liveness_low_name),
                getString(R.string.notification_channel_liveness_low_text, value)
            )
            setOf("liveness", "ok") -> sendNotification(
                getString(R.string.notification_channel_liveness_ok_id),
                getString(R.string.notification_channel_liveness_ok_name),
                getString(R.string.notification_channel_liveness_ok_text, value)
            )
        }
    }

    override fun onNewToken(token: String) {
        Log.d(TAG, "Refreshed token: $token")
    }

    private fun sendNotification(id: String, title: String, text: String) {
        val notificationBuilder = NotificationCompat.Builder(
            this,
            id
        ).apply {
            setContentTitle(title)
            setContentText(text)
            setSmallIcon(R.drawable.thermometer_icon)
            setContentIntent(createIntent())
            setAutoCancel(true)
        }

        with(NotificationManagerCompat.from(this)) {
            notify(NOTIFICATION_ID, notificationBuilder.build())
        }
    }

    private fun createIntent(): PendingIntent? {
        val resultIntent = Intent(this, MainActivity::class.java)
        return TaskStackBuilder.create(this).run {
            // Add the intent, which inflates the back stack
            addNextIntentWithParentStack(resultIntent)
            // Get the PendingIntent containing the entire back stack
            getPendingIntent(0, PendingIntent.FLAG_UPDATE_CURRENT)
        }
    }

    private fun createNotificationChannels() {
        createNotificationChannelLow(
            getString(R.string.notification_channel_temperature_low_id),
            getString(R.string.notification_channel_temperature_low_name)
        )
        createNotificationChannelOk(
            getString(R.string.notification_channel_temperature_ok_id),
            getString(R.string.notification_channel_temperature_ok_name)
        )
        createNotificationChannelLow(
            getString(R.string.notification_channel_battery_low_id),
            getString(R.string.notification_channel_battery_low_name)
        )
        createNotificationChannelOk(
            getString(R.string.notification_channel_battery_ok_id),
            getString(R.string.notification_channel_battery_ok_name)
        )
        createNotificationChannelLow(
            getString(R.string.notification_channel_liveness_low_id),
            getString(R.string.notification_channel_liveness_low_name)
        )
        createNotificationChannelOk(
            getString(R.string.notification_channel_liveness_ok_id),
            getString(R.string.notification_channel_liveness_ok_name)
        )
    }

    private fun createNotificationChannelLow(id: String, name: String) {
        val channel = NotificationChannel(
            id,
            name,
            NotificationManager.IMPORTANCE_HIGH
        )
        channel.enableLights(true)
        channel.enableVibration(true)
        channel.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        channel.setSound(
            Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + applicationContext.packageName + "/" + R.raw.emergency),
            AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION).build()
        )

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channel)
    }

    private fun createNotificationChannelOk(id: String, name: String) {
        val channel = NotificationChannel(
            id,
            name,
            NotificationManager.IMPORTANCE_DEFAULT
        )
        channel.enableLights(true)
        channel.enableVibration(true)
        channel.lockscreenVisibility = Notification.VISIBILITY_PUBLIC

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channel)
    }

    companion object {
        private val TAG = GreenhouseFirebaseMessagingService::class.java.simpleName
        private val NOTIFICATION_ID = Math.random().toInt()
    }
}
