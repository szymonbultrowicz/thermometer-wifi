#include "BatterySensor.h"

BatterySensor::BatterySensor(
    uint8_t sensePin,
    uint16_t refVoltage,
    float dividerRatio
) {
    this->sensePin = sensePin;
    this->refVoltage = refVoltage;
    this->dividerRatio = dividerRatio;
}

BatterySensor::~BatterySensor() {
}

void BatterySensor::init() {
    pinMode(this->sensePin, INPUT);
}

void BatterySensor::read(Reading* reading) {
    int analogValue = analogRead(this->sensePin);
    uint16_t voltage = analogValue * this->refVoltage * this->dividerRatio / 1024;
    reading->battery = voltage;
}
