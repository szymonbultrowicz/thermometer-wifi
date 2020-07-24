#ifndef __SENDER_H__
#define __SENDER_H__

#include "Arduino.h"
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <ESP8266HTTPClient.h>
#include <PubSubClient.h>
#include "../common/config.h"
#include "../common/reading.h"
#include "../common/log.h"

#define MQTT_CLIENT_DEBUG

class ReadingSender {
    public:
        ReadingSender();
        void init();
        void send(Reading* reading);
        void halt();
    private:
        PubSubClient* client;

        void updateTime();
        String serializeReading(Reading* reading);
};

#endif