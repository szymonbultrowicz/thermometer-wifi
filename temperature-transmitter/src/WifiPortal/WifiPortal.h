#ifndef __WIFIPORTAL_H__
#define __WIFIPORTAL_H__

#include <AutoConnect.h>
#include <AutoConnectCredential.h>

class WifiPortal {
    public:
        WifiPortal();
        void init();
        void loop();
        void stop();
        void clear();
        void tryConnect();
        
    private:
        bool enabled;
        AutoConnect* portal;
        AutoConnectConfig* config;
        station_config_t* loadCredentials();
};

#endif
