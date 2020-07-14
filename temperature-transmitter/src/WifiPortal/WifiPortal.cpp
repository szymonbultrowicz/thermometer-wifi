#include "WifiPortal.h"
#include <ESP8266WebServer.h>

#define BUFFER_SIZE 200

ESP8266WebServer webServer;

WifiPortal::WifiPortal() {
    this->wifiManager = new WiFiManager();
}

boolean WifiPortal::configure() {
    this->wifiManager->setConfigPortalTimeout(180);
    bool connected = this->wifiManager->startConfigPortal("thermometer", "12345678");
    if (connected) {
        this->saveCredentials();
    }
    return connected;
}

void WifiPortal::tryConnect() {
    WifiConfig credentials = this->loadCredentials();
    if (!credentials.empty) {
        Serial.print("Connecting to SSID: ");
        Serial.println((const char*)&credentials.ssid[0]);

        WiFi.begin((const char*)&credentials.ssid[0], (const char*)&credentials.password[0]);

        wl_status_t status = WiFi.status();
        int attempt = 1;
        while(status != WL_CONNECTED) {
            if (status == WL_CONNECT_FAILED) {
                Serial.println("Failed to connect to wifi");
                break;
            }
            if (attempt > 10) {
                Serial.println("Connection timeout");
                break;
            }
            
            delay(1000);
            status = WiFi.status();
        }
    }
}

void WifiPortal::saveCredentials() {
    if (!LittleFS.begin()) {
        Serial.println("An Error has occurred while mounting LittleFS");
        return;
    }

    StaticJsonDocument<BUFFER_SIZE> doc;
    doc["ssid"] = WiFi.SSID();
    doc["password"] = WiFi.psk();

    File configFile = LittleFS.open("/config.json", "w");
    size_t bytesWritten = serializeJson(doc, configFile);
    if (bytesWritten == 0) {
        Serial.println("Failed to write config file");
    }

    configFile.close();
    Serial.println("Saved config file");
}

bool isEmpty(const char* str) {
    return str == nullptr || strlen(str) == 0;
}

WifiConfig WifiPortal::loadCredentials() {
    WifiConfig config;
    if (!LittleFS.begin()) {
        Serial.println("An Error has occurred while mounting LittleFS");
        return config;
    }

    if (!LittleFS.exists("/config.json")) {
        Serial.println("Config file doesn't exist");
        return config;
    }

    Serial.println("Reading config file");
    File configFile = LittleFS.open("/config.json", "r");

    if (!configFile) {
        Serial.println("Failed to open config file");
        return config;
    }

    Serial.println("Opened config file");

    StaticJsonDocument<BUFFER_SIZE> doc;
    if (deserializeJson(doc, configFile)) {
        Serial.println("Failed to parse config file");
        return config;
    }

    const char* ssid = doc["ssid"];
    const char* password = doc["password"];
    if (!isEmpty(ssid)) {
        strcpy(config.ssid, ssid);
        if (!isEmpty(password)) {
            strcpy(config.password, password);
        }
        config.empty = false;
    }

    configFile.close();

    return config;
}

