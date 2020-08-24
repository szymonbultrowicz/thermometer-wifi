#include <WiFiClientSecure.h>
#include <ESP8266WiFi.h>
#include <Ticker.h>
#include "DHT.h"
#include "src/common/config.h"
#include "src/common/reading.h"
#include "src/common/log.h"
#include "src/sensor/TempSensor.h"
#include "src/battery/BatterySensor.h"
#include "src/ReadingSender/ReadingSender.h"
#include "src/WifiPortal/WifiPortal.h"

unsigned long resetPressed = 0;

ReadingSender readingSender;
TempSensor tempSensor(DHTTYPE, PIN_DHT_POWER, PIN_DHT);
BatterySensor batterySensor(
    PIN_BATTERY_SENSE,
    PIN_BATTERY_ACT,
    BATTERY_REF_VOLTAGE,
    BATTERY_DIVIDER_RATIO);

WifiPortal wifiPortal;

Ticker ledTimer;

void setup()
{
    unsigned long setupStart = millis();

    Serial.begin(115200);
    Serial.println("Started");
    // Wait for serial to initialize.
    while (!Serial)
    {
    }

    pinMode(PIN_LED, OUTPUT);
    digitalWrite(PIN_LED, HIGH);

    pinMode(PIN_SETUP, INPUT_PULLUP);

    tempSensor.init();
    batterySensor.init();
    

    if (!isInConfigMode()) {
        unsigned long connectStart = millis();
        if (!tryFastReconnect()) {
            wifiPortal.tryConnect();
        }
        logDuration("Connect", millis() - connectStart);
    } else {
        configureWifi();
    }

    delay(250);

    readingSender.init();

    logDuration("Setup", millis() - setupStart);
}

boolean tryFastReconnect() {
    int counter = 0;
    while (WiFi.status() != WL_CONNECTED) {
        delay(5);     // use small delays, NOT 500ms
        if (++counter > 1000) return false;     // 5 sec timeout
    }
    return true;
}

void loop()
{
    unsigned long loopStart = millis();
    ensureConnected();

    if (LED_TIME > 0) {
        turnLedOn();
        ledTimer.attach_ms(50, turnLedOff);
    }

    Reading *reading = new Reading();
    tempSensor.read(reading);
    batterySensor.read(reading);

    if (isNotEmpty(reading)) {
        printReading(reading);
        readingSender.send(reading);
    } else {
        Serial.println("Failed to read sensors");
    }

    // Turn off if the battery goes below the min value
    if (reading->battery > 0 && reading->battery < BATTERY_MIN) {
        ESP.deepSleep(0);
    }

    delete reading;
    logDuration("Loop", millis() - loopStart);

    sleep();
}

void configureWifi() {
    turnLedOn();
    if (!wifiPortal.configure())
    {
        // Turn off ESP if the wifi failed to configure in the given time
        Serial.println('Failed to configure WiFi connection. Turning off...');
        ESP.deepSleep(0);
    }
    turnLedOff();
}

void ensureConnected()
{
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println('Failed to connect to wifi. Going into sleep mode...');
        sleep();
    }
}

void turnLedOn() {
    digitalWrite(PIN_LED, LOW);
}

void turnLedOff() {
    digitalWrite(PIN_LED, HIGH);
}

void sleep()
{
    tempSensor.halt();
    readingSender.halt();
    ESP.deepSleep(LOOP_DELAY);
}

bool isInConfigMode()
{
    return digitalRead(PIN_SETUP) == LOW;
}

bool isNotEmpty(Reading *reading)
{
    return reading->humidity != UNSET_INT && reading->temperature != UNSET_INT;
}

void printReading(Reading *reading)
{
    Serial.print("T: ");
    Serial.println(reading->temperature);
    Serial.print("H: ");
    Serial.println(reading->humidity);
    Serial.print("V: ");
    Serial.println(reading->battery);
}
