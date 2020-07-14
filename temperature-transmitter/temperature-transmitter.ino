#include <WiFiClientSecure.h> 
#include <ESP8266WiFi.h>
#include <Ticker.h>
#include "DHT.h"
#include "src/common/config.h"
#include "src/common/reading.h"
#include "src/sensor/TempSensor.h"
#include "src/ReadingSender/ReadingSender.h"
#include "src/WifiPortal/WifiPortal.h"

unsigned long resetPressed = 0;

ReadingSender readingSender;
TempSensor tempSensor(DHTTYPE, PIN_DHT_POWER, PIN_DHT);

WifiPortal wifiPortal;

Ticker ledTimer;

void setup() {
    Serial.begin(115200);
    Serial.println("Started");
    // Wait for serial to initialize.
    while(!Serial) { }

    pinMode(PIN_LED, OUTPUT);
    digitalWrite(PIN_LED, HIGH);

    pinMode(PIN_SETUP, INPUT_PULLUP);


    tempSensor.init();
    readingSender.init();

    if (!isInConfigMode()) {
        wifiPortal.tryConnect();
    }

    delay(250);
}

void loop() {
    ensureConnected();

    digitalWrite(PIN_LED, LOW);
    ledTimer.attach_ms(100, turnLedOff);

    Reading* reading = tempSensor.read();

    if (reading != NULL) {
        readingSender.send(reading);
        delete reading;
    }

    sleep();
}

void ensureConnected() {
    if (isInConfigMode() || WiFi.status() != WL_CONNECTED) {
        digitalWrite(PIN_LED, LOW);
        if (!wifiPortal.configure()) {
            // Turn off ESP if the wifi failed to configure in the given time
            ESP.deepSleep(0);
        }
    }
}

void turnLedOff() {
    digitalWrite(PIN_LED, HIGH);
}

void sleep() {
    tempSensor.halt();
    ESP.deepSleep(LOOP_DELAY);
}

bool isInConfigMode() {
    return digitalRead(PIN_SETUP) == LOW;
}

// ICACHE_RAM_ATTR void resetChangeInterrupt() {
//     bool pressed = digitalRead(PIN_RESET) == LOW;
//     if (pressed) {
//         Serial.println("Reset pressed");
//         resetTimer.attach(RESET_DELAY, resetInterrupt);
//     } else {
//         Serial.println("Reset cancelled");
//         resetTimer.detach();
//     }
// }

// void resetInterrupt() {
//     Serial.println("Performing factory reset");
//     wifiPortal.clear();
//     resetTimer.detach();
//     ESP.restart();
// }
