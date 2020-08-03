package pl.bultrowicz.greenhouse

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Toast
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
                val msg = if (task.isSuccessful) "Subscribed to the topic" else "Failed to subscribe to the topic"
                Log.d(TAG, msg)
                Toast.makeText(baseContext, msg, Toast.LENGTH_SHORT).show()
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

                val token = task.result?.token

                val msg = getString(R.string.msg_token_fmt, token)
                Log.d(TAG, msg)
                Toast.makeText(baseContext, msg, Toast.LENGTH_SHORT).show()
            })
    }

    companion object {
        private val TAG = MainActivity::class.java.simpleName
        private const val TOPIC_NAME = "low-temperature-warning"
    }
}