#include "Arduino.h"
#include "TempSensor.h"
#include "../common/log.h"

TempSensor::TempSensor(uint8_t type, uint8_t pinPower, uint8_t pinReading) {
    this->sensor = new DHT(pinReading, type);
    this->pinPower = pinPower;
    this->pinReading = pinReading;
}

TempSensor::~TempSensor() {
    if (this->sensor != NULL) {
        delete this->sensor;
    }
}

void TempSensor::init() {
    pinMode(pinReading, INPUT);
    pinMode(pinPower, OUTPUT);
    digitalWrite(pinPower, HIGH);
    this->sensor->begin();
}

void TempSensor::halt() {
    digitalWrite(pinPower, LOW);
}

void TempSensor::read(Reading* reading) {
    unsigned long start = millis();

    float humidity = this->sensor->readHumidity();
    float temperature = this->sensor->readTemperature();

    if (isnan(humidity) || isnan(temperature)) {
        return;
    }

    reading->temperature = round(temperature * 10.0);
    reading->humidity = round(humidity * 10);

    logDuration("Temp read", millis() - start);
}