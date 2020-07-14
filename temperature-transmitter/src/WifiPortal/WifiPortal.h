#ifndef __WIFIPORTAL_H__
#define __WIFIPORTAL_H__

#include <ESP8266WebServer.h>
#include <DNSServer.h>
#include <WiFiManager.h>

#include <FS.h>
#include <ArduinoJson.h>

struct WifiConfig {
    char ssid[33];
    char password[64];
    bool empty = true;
};

class WifiPortal {
    public:
        WifiPortal();
        boolean configure();
        // void clear();
        void tryConnect();
        
    private:
        void saveCredentials();
        WifiConfig loadCredentials();
        bool enabled;
        WiFiManager* wifiManager;
};

#endif
