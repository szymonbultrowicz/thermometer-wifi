#ifndef __SENDER_H__
#define __SENDER_H__

#include "Arduino.h"
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include "../common/config.h"
#include "../common/reading.h"
#include "../common/log.h"

class ReadingSender {
    public:
        void init();
        void send(Reading* reading);
    private:
        void updateTime();
        String serializeReading(Reading* reading);
};

#endif