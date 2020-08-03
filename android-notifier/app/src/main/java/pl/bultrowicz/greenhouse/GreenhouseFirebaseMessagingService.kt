package pl.bultrowicz.greenhouse

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class GreenhouseFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(p0: RemoteMessage) {
        Log.d(TAG, "Got message: ${p0.data}")

        createNotificationChannel()

        val notification = NotificationCompat.Builder(this, getString(R.string.notification_channel_low_temp_warning_id))
            .setContentTitle(getString(R.string.notification_channel_low_temp_warning_name))
            .setContentText(getString(R.string.notification_low_temp_warning_text, p0.data["temperature"]))
            .setSmallIcon(R.drawable.thermometer_icon)
            .build()

        with(NotificationManagerCompat.from(this)) {
            notify(NOTIFICATION_ID, notification)
        }
    }

    override fun onNewToken(token: String) {
        Log.d(TAG, "Refreshed token: $token")
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        val channel = NotificationChannel(
            getString(R.string.notification_channel_low_temp_warning_id),
            getString(R.string.notification_channel_low_temp_warning_name),
            NotificationManager.IMPORTANCE_HIGH
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
