#include <WiFiClientSecure.h> 
#include <ESP8266WiFi.h>
#include "DHT.h"
#include "src/common/config.h"
#include "src/common/reading.h"
#include "src/sensor/sensor.h"
#include "src/wifi-config-manager/wifi-config-manager.h"
#include "src/ReadingSender/ReadingSender.h"

unsigned long resetPressed = 0;

ReadingSender readingSender;
WifiConfigManager wifiConfigManager;

void setup() {
    Serial.begin(115200);
    Serial.println("Started");
    DEBUG_MODE = true;

    pinMode(PIN_RESET, INPUT);
    pinMode(PIN_DHT, INPUT);

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
    resetLoop();

    if (WiFi.status() == WL_CONNECTED) {
        Reading* reading = sensorRead();

        readingSender.send(reading);

        if (reading != NULL) {
            delete reading;
        }

        delay(LOOP_DELAY);
    }
}

void resetLoop() {
    if (digitalRead(PIN_RESET) == HIGH) {
        Serial.println("resetPressed");
        unsigned long currentTime = millis();
        if (resetPressed == 0) {
            resetPressed = currentTime;
        } else if (currentTime - resetPressed > RESET_DELAY) {
            wifiConfigManager.clear();
        }
    } else {
        resetPressed = 0;
    }
}
