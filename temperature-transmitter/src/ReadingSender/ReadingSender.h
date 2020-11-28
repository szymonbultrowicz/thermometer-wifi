#ifndef __SENDER_H__
#define __SENDER_H__

#include "Arduino.h"
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <ESP8266HTTPClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "../common/config.h"
#include "../common/reading.h"
#include "../common/ReadingError.h"
#include "../common/log.h"
#include "../logger/Logger.h"

#define MQTT_CLIENT_DEBUG

class ReadingSender {
    public:
        ReadingSender(Logger* logger);
        void init();
        void send(Reading* reading);
        void sendError(ReadingError* error);
        void halt();
    private:
        PubSubClient* client;
        Logger* logger;

        void updateTime();
        String serializeReading(Reading* reading);
        String serializeReadingError(ReadingError* error);
};

#endif