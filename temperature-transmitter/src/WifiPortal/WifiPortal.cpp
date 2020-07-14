#include "WifiPortal.h"
#include <ESP8266WebServer.h>

ESP8266WebServer webServer;

WifiPortal::WifiPortal() {
    this->portal = new AutoConnect(webServer);
    this->config = new AutoConnectConfig();
    this->config->apip = IPAddress(192, 168, 111, 1);
    // this->config->autoReconnect = true;
    this->config->immediateStart = true;
    this->enabled = false;
}

void WifiPortal::init() {
    if (!this->enabled) {
        this->portal->begin();
        this->enabled = true;
    }
}

void WifiPortal::loop() {
    this->init();
    this->portal->handleClient();
}


void WifiPortal::stop() {
    if (!this->enabled) {
        this->portal->end();
        this->enabled = false;
    }
}

void WifiPortal::clear() {
    AutoConnectCredential credential;
    station_config_t config;
    uint8_t ent = credential.entries();
    uint8_t firstElem = 0;
    Serial.print("Deleting ");
    Serial.print(ent);
    Serial.print(" saved networks");
    Serial.println();

    while (ent--) {
        credential.load(firstElem, &config);
        credential.del((const char*)&config.ssid[0]);
    }
}

station_config_t* WifiPortal::loadCredentials() {
    AutoConnectCredential credential;
    uint8_t ent = credential.entries();
    if (ent == 0) {
        return NULL;
    }

    station_config_t* config = new station_config_t();
    uint8_t firstElem = 0;
    credential.load(firstElem, config);
    return config;
}

void WifiPortal::tryConnect() {
    station_config_t* credentials = this->loadCredentials();
    if (credentials != NULL) {
        Serial.print("Connecting to SSID: ");
        Serial.println((const char*)&credentials->ssid[0]);

        WiFi.begin((const char*)&credentials->ssid[0], (const char*)&credentials->password[0]);

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
            
            delay(100);
            status = WiFi.status();
        }
    }
}

