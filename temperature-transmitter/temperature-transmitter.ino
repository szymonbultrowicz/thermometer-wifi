#include <NTPClient.h>
#include <WiFiUdp.h>
#include <PubSubClient.h>
#include <ConfigManager.h>
#include <ESP8266WiFi.h>
#include "DHT.h"
#include "config.h"

struct Config {
    char name[20];
    bool enabled;
    int8_t hour;
    char password[20];
} config;

struct Reading {
    int temperature;
    int humidity;

    Reading(int t, int h) {
        temperature = t;
        humidity = h;
    }
};

ConfigManager configManager;
DHT dht(PIN_DHT, DHTTYPE);
WiFiClientSecure wifiClient;
PubSubClient mqtt(MQTT_SERVER, MQTT_PORT, wifiClient);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

unsigned long resetPressed = 0;


void setup() {
    DEBUG_MODE = true; // will enable debugging and log to serial monitor
    Serial.begin(115200);
    DebugPrintln("Started");

    pinMode(PIN_RESET, INPUT);
    pinMode(PIN_DHT, INPUT);

    dht.begin();
    timeClient.begin();
    // mqtt.setServer(MQTT_SERVER, MQTT_PORT);

    if (!SPIFFS.begin()) {
        Serial.println("An Error has occurred while mounting SPIFFS");
    }


    // Setup config manager
    configManager.setAPName("esp");
    configManager.setAPPassword("12345678");
    configManager.setAPFilename("/index.html");

    configManager.setAPCallback(createCustomScanRoute);

    configManager.begin(config);

    loadWifiCertificates();
}

void loop() {
    configManager.loop();
    resetLoop();

    if (WiFi.status() == WL_CONNECTED) {
        Reading* reading = readSensor();

        while(!timeClient.update()){
            timeClient.forceUpdate();
        }
        wifiClient.setX509Time(timeClient.getEpochTime());
        DebugPrint("Current time: ");
        DebugPrintln(timeClient.getFormattedTime());

        publishReading(reading);

        if (reading != NULL) {
            delete reading;
        }

        delay(LOOP_DELAY);
    }
}

void publishReading(Reading* reading) {
    boolean mqttConnected = ensureMqttConnected();

    if (mqttConnected) {
        char buffer[100];
        sprintf(buffer, "{\"temperature\":%d,\"humidity\":%d}", reading->temperature, reading->humidity);
        boolean published = mqtt.publish(MQTT_TOPIC, buffer);
        if (published) {
            Serial.println("Published message");
        } else {
            Serial.println("Failed to publish message!");
        }
    }
}

boolean ensureMqttConnected() {
    if (mqtt.connected()) {
        return true;
    }
    boolean connected = mqtt.connect("greenhouse-thermometer");
    if (connected) {
        Serial.println("Connected to MQTT broker");
    } else {
        Serial.println("Failed to connect to MQTT broker!");
    }
    return connected;
}

Reading* readSensor() {
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    if (isnan(humidity) || isnan(temperature)) {
        DebugPrintln("Failed to get readings");
        return NULL;
    }

    DebugPrint("H: ");
    DebugPrintln(humidity);
    DebugPrint("T: ");
    DebugPrintln(temperature);

    Reading* reading = new Reading(
        round(temperature * 10.0),
        round(humidity * 10)
    );

    return reading;
}

void resetLoop() {
    if (digitalRead(PIN_RESET) == HIGH) {
        Serial.println("resetPressed");
        unsigned long currentTime = millis();
        if (resetPressed == 0) {
            resetPressed = currentTime;
        } else if (currentTime - resetPressed > RESET_DELAY) {
            Serial.println("Resetting settings");
            configManager.clearWifiSettings(true);
        }
    } else {
        resetPressed = 0;
    }
}

void createCustomScanRoute(WebServer *server) {
    server->on("/scan2", HTTPMethod::HTTP_GET, [server](){
        DynamicJsonDocument doc(8096);
        JsonArray jsonArray = doc.createNestedArray();

        DebugPrintln("Scanning WiFi networks...");
        int n = WiFi.scanNetworks();
        DebugPrintln("scan complete");
        if (n == 0) {
            DebugPrintln("no networks found");
        } else {
            DebugPrint(n);
            DebugPrintln(" networks found:");

            for (int i = 0; i < n; ++i) {
                String ssid = WiFi.SSID(i);
                int rssi = WiFi.RSSI(i);
                String security =
                    WiFi.encryptionType(i) == WIFI_OPEN ? "none" : "enabled";

                DebugPrint("Name: ");
                DebugPrint(ssid);
                DebugPrint(" - Strength: ");
                DebugPrint(rssi);

                JsonObject obj = doc.createNestedObject();
                obj["ssid"] = ssid;
                obj["strength"] = rssi;
                jsonArray.add(obj);
            }
        }

        String body;
        serializeJson(jsonArray, body);

        server->send(200, FPSTR(mimeJSON), body);
        server->client().stop();
    });
}

void loadWifiCertificates()
{
      Dir dir = SPIFFS.openDir("/");
 
  while(dir.next()){
 
      Serial.print("FILE: ");
      Serial.println(dir.fileName());
  }
  Serial.println("Listed.");
    // Load certificate file
    File cert = SPIFFS.open("/cert.der", "r"); //replace cert.crt eith your uploaded file name
    if (!cert)
    {
        Serial.println("Failed to open cert file");
    }
    else
        Serial.println("Success to open cert file");

    delay(1000);

    if (wifiClient.loadCertificate(cert))
        Serial.println("cert loaded");
    else
        Serial.println("cert not loaded");

    // Load private key file
    File private_key = SPIFFS.open("/private.der", "r"); //replace private eith your uploaded file name
    if (!private_key)
    {
        Serial.println("Failed to open private cert file");
    }
    else
        Serial.println("Success to open private cert file");

    delay(1000);

    if (wifiClient.loadPrivateKey(private_key))
        Serial.println("private key loaded");
    else
        Serial.println("private key not loaded");

    // Load CA file
    File ca = SPIFFS.open("/ca.der", "r"); //replace ca eith your uploaded file name
    if (!ca)
    {
        Serial.println("Failed to open ca ");
    }
    else
        Serial.println("Success to open ca");

    delay(1000);

    if (wifiClient.loadCACert(ca))
    {
        Serial.println("ca loaded");
    }
    else
    {
        Serial.println("ca failed");
    }
}
