#ifndef __WIFIPORTAL_H__
#define __WIFIPORTAL_H__

#include <ESP8266WebServer.h>
#include <DNSServer.h>
#include <WiFiManager.h>

#include <ArduinoJson.h>
#include <LittleFS.h>
#include <StreamUtils.h>

struct WifiConfig {
    char ssid[33];
    char password[64];
    bool useDhcp = false;
    IPAddress ip;
    IPAddress subnet;
    IPAddress gateway;
    IPAddress dns1;
    IPAddress dns2;
    bool empty = true;
};

class WifiPortal {
    public:
        WifiPortal();
        void configure();
        // void clear();
        void tryConnect();
        
    private:
        void saveCredentials(WifiConfig* config);
        WifiConfig loadCredentials();
        bool enabled;
        WiFiManager* wifiManager;
};

#endif
