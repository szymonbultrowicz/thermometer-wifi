package pl.bultrowicz.greenhouse

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.iid.FirebaseInstanceId
import com.google.firebase.messaging.FirebaseMessaging

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        subscribeToTopics()
        registerInFirebase()
    }

    private fun subscribeToTopics() {
        FirebaseMessaging.getInstance()
            .subscribeToTopic(TOPIC_NAME)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    Log.d(TAG, "Subscribed to topic: $TOPIC_NAME")
                } else {
                    Log.w(TAG, "Failed to subscribe to topic $TOPIC_NAME", task.exception)
                }
            }
    }

    private fun registerInFirebase() {
        FirebaseInstanceId
            .getInstance()
            .instanceId
            .addOnCompleteListener(OnCompleteListener { task ->
                if (!task.isSuccessful) {
                    Log.w(TAG, "getInstanceId failed", task.exception)
                    return@OnCompleteListener
                }

                Log.d(TAG, "InstanceID token: $task.result?.token")
            })
    }

    companion object {
        private val TAG = MainActivity::class.java.simpleName
        private const val TOPIC_NAME = "low-temperature-warning"
    }
}