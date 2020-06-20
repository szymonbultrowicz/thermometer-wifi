#include <WiFiClientSecure.h> 
#include <ESP8266WiFi.h>
#include <Ticker.h>
#include "DHT.h"
#include "src/common/config.h"
#include "src/common/reading.h"
#include "src/sensor/sensor.h"
#include "src/wifi-config-manager/wifi-config-manager.h"
#include "src/ReadingSender/ReadingSender.h"

unsigned long resetPressed = 0;

ReadingSender readingSender;
WifiConfigManager wifiConfigManager;

Ticker resetTimer;

void setup() {
    Serial.begin(115200);
    Serial.println("Started");
    DEBUG_MODE = true;

    pinMode(PIN_RESET, INPUT_PULLUP);
    pinMode(PIN_DHT, INPUT);

    attachInterrupt(digitalPinToInterrupt(PIN_RESET), resetChangeInterrupt, CHANGE);

    sensorInit();
    readingSender.init();

    if (!SPIFFS.begin()) {
        Serial.println("An Error has occurred while mounting SPIFFS");
    }

    wifiConfigManager.init();

    delay(1000);
}

void loop() {
    wifiConfigManager.loop();

    if (WiFi.status() == WL_CONNECTED) {
        Reading* reading = sensorRead();

        readingSender.send(reading);

        if (reading != NULL) {
            delete reading;
        }

        delay(LOOP_DELAY);
    }
}

ICACHE_RAM_ATTR void resetChangeInterrupt() {
    bool pressed = digitalRead(PIN_RESET) == LOW;
    if (pressed) {
        Serial.println("Reset pressed");
        resetTimer.attach(5, resetInterrupt);
    } else {
        Serial.println("Reset cancelled");
        resetTimer.detach();
    }
}

void resetInterrupt() {
    Serial.println("Performing factory reset");
    wifiConfigManager.clear();
    resetTimer.detach();
}
