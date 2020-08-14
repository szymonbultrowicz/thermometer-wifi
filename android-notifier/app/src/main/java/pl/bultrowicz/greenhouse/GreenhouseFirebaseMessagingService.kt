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

        createNotificationChannel()

        val notificationBuilder = NotificationCompat.Builder(
            this,
            getString(R.string.notification_channel_low_temp_warning_id)
        ).apply {
            setContentTitle(getString(R.string.notification_channel_low_temp_warning_name))
            setContentText(getString(R.string.notification_low_temp_warning_text, p0.data["temperature"]))
            setSmallIcon(R.drawable.thermometer_icon)
            setContentIntent(createIntent())
            setAutoCancel(true)
        }

        with(NotificationManagerCompat.from(this)) {
            notify(NOTIFICATION_ID, notificationBuilder.build())
        }
    }

    override fun onNewToken(token: String) {
        Log.d(TAG, "Refreshed token: $token")
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

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            getString(R.string.notification_channel_low_temp_warning_id),
            getString(R.string.notification_channel_low_temp_warning_name),
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

    companion object {
        private val TAG = GreenhouseFirebaseMessagingService::class.java.simpleName
        private val NOTIFICATION_ID = Math.random().toInt()
    }
}
