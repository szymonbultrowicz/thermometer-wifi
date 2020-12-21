#include <algorithm>
#include <WiFiClientSecure.h>
#include <ESP8266WiFi.h>
#include <Ticker.h>
#include "DHT.h"
#include <LittleFS.h>
#include "src/common/config.h"
#include "src/common/reading.h"
#include "src/common/ReadingError.h"
#include "src/sensor/TempSensor.h"
#include "src/battery/BatterySensor.h"
#include "src/ReadingSender/ReadingSender.h"
#include "src/WifiPortal/WifiPortal.h"
#include "src/logger/Logger.h"

unsigned long resetPressed = 0;

ReadingSender* readingSender;
TempSensor tempSensor(DHTTYPE, PIN_DHT_POWER, PIN_DHT);
BatterySensor* batterySensor;

WifiPortal wifiPortal;

Ticker ledTimer;

int connectionTime = -1;

Logger* logger;

void setup()
{
    unsigned long setupStart = millis();

    Serial.begin(115200);
    Serial.println("Started");
    // Wait for serial to initialize.
    while (!Serial)
    {
    }

    logger = new Logger();

    pinMode(PIN_LED, OUTPUT);
    digitalWrite(PIN_LED, HIGH);

    pinMode(PIN_SETUP, INPUT_PULLUP);

    tempSensor.init();
    batterySensor = new BatterySensor(
        logger,
        PIN_BATTERY_SENSE,
        PIN_BATTERY_ACT,
        BATTERY_REF_VOLTAGE,
        BATTERY_DIVIDER_RATIO);
    batterySensor->init();
    

    if (!isInConfigMode()) {
        unsigned long connectStart = millis();
        if (!tryFastReconnect()) {
            Serial.println("Fast reconnect failed. Trying normal reconnect...");
            wifiPortal.tryConnect();
        }
        connectionTime = millis() - connectStart;
        logger->logDuration("Connect", connectionTime);
    } else {
        configureWifi();
    }

    delay(SETUP_DELAY);

    readingSender = new ReadingSender(logger);
    readingSender->init();

    logger->logDuration("Setup", millis() - setupStart);
}

boolean tryFastReconnect() {
    int counter = 0;
    while (WiFi.status() != WL_CONNECTED) {
        delay(5);     // use small delays, NOT 500ms
        if (++counter > 1000) return false;     // 5 sec timeout
    }
    return true;
}

void sleep(unsigned int delay = LOOP_DELAY)
{
    tempSensor.halt();
    readingSender->halt();
    delete readingSender;
    logger->halt();
    delete logger;
    ESP.deepSleep(LOOP_DELAY);
}

void loop()
{
    unsigned long loopStart = millis();
    ensureConnected();
    logger->logPerm("Connected");

    if (LED_TIME > 0) {
        turnLedOn();
        ledTimer.attach_ms(LED_TIME, turnLedOff);
    }

    Reading *reading = new Reading();

    unsigned long readingStart = millis();
    tempSensor.read(reading);
    batterySensor->read(reading);
    unsigned long readingTime = millis() - readingStart;

    if (isNotEmpty(reading)) {
        reading->connectionTime = connectionTime;
        reading->readTime = readingTime;
        printReading(reading);
        logger->logPerm("DHT success");
        readingSender->send(reading);
    } else {
        Serial.println("Failed to read sensors");
        logger->logPerm("DHT fail");
        sendDhtError(readingSender, connectionTime, readingTime, reading->battery);
    }

    // Turn off if the battery goes below the min value
    // if (reading->battery > 0 && reading->battery < BATTERY_MIN) {
    //     logger->logPerm("Battery low, turning off");
    //     sleep(0);
    // }

    delete reading;
    logger->logDuration("Loop", millis() - loopStart);

    sleep();
}

void configureWifi() {
    turnLedOn();
    if (!wifiPortal.configure())
    {
        // Turn off ESP if the wifi failed to configure in the given time
        logger->logPerm("WiFi configuration failure, turning off");
        sleep(0);
    }
    turnLedOff();
}

void ensureConnected()
{
    int counter = 0;
    if (WiFi.status() != WL_CONNECTED) {
        delay(50);
        if (++counter > 20) { // 1s
            Serial.println("WiFi connection error, putting to sleep");
            sleep();
        }
    }
}

void turnLedOn() {
    digitalWrite(PIN_LED, LOW);
}

void turnLedOff() {
    digitalWrite(PIN_LED, HIGH);
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
    Serial.print("CT: ");
    Serial.println(reading->connectionTime);
    Serial.print("RT: ");
    Serial.println(reading->readTime);
}

void sendDhtError(ReadingSender* readingSender, int connectionTime, int readingTime, int battery) {
    ReadingError* readingError = new ReadingError();
    readingError->error = "DHT error";
    readingError->connectionTime = connectionTime;
    readingError->readTime = readingTime;
    readingError->battery = battery;
    readingSender->sendError(readingError);
    delete readingError;
}
