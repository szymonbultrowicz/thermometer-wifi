#include <WiFiClientSecure.h> 
#include <ESP8266WiFi.h>
#include <Ticker.h>
#include "DHT.h"
#include "src/common/config.h"
#include "src/common/reading.h"
#include "src/sensor/TempSensor.h"
#include "src/battery/BatterySensor.h"
#include "src/ReadingSender/ReadingSender.h"
#include "src/WifiPortal/WifiPortal.h"

unsigned long resetPressed = 0;

ReadingSender readingSender;
TempSensor tempSensor(DHTTYPE, PIN_DHT_POWER, PIN_DHT);
BatterySensor batterySensor(
    PIN_BATTERY_SENSE,
    BATTERY_REF_VOLTAGE,
    BATTERY_DIVIDER_RATIO
);

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
    batterySensor.init();
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

    Reading* reading = new Reading();
    tempSensor.read(reading);
    batterySensor.read(reading);

    if (isNotEmpty(reading)) {
        readingSender.send(reading);
    }
    delete reading;

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

bool isNotEmpty(Reading* reading) {
    return reading->humidity != UNSET_INT && reading->temperature != UNSET_INT;
}
