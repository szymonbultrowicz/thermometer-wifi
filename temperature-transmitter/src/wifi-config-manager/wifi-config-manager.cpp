#include "wifi-config-manager.h"

struct Config {
    char name[20];
    bool enabled;
    int8_t hour;
    char password[20];
} config;

ConfigManager configManager;

void wifiConfigInit() {
    configManager.setAPName("esp");
    configManager.setAPPassword("12345678");
    configManager.setAPFilename("/index.html");

    configManager.setAPCallback(createCustomScanRoute);

    configManager.begin(config);
}

void wifiConfigLoop() {
    configManager.loop();
}

void wifiConfigClear() {
    Serial.println("Resetting WiFi settings");
    configManager.clearWifiSettings(true);
}

void createCustomScanRoute(WebServer *server) {
    server->on("/scan2", HTTPMethod::HTTP_GET, [server](){
        DynamicJsonDocument doc(8096);
        JsonArray jsonArray = doc.createNestedArray();

        Serial.println("Scanning WiFi networks...");
        int n = WiFi.scanNetworks();
        Serial.println("scan complete");
        if (n == 0) {
            Serial.println("no networks found");
        } else {
            Serial.print(n);
            Serial.println(" networks found:");

            for (int i = 0; i < n; ++i) {
                String ssid = WiFi.SSID(i);
                int rssi = WiFi.RSSI(i);
                String security =
                    WiFi.encryptionType(i) == WIFI_OPEN ? "none" : "enabled";

                Serial.print("Name: ");
                Serial.print(ssid);
                Serial.print(" - Strength: ");
                Serial.print(rssi);

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
