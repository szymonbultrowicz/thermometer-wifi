#include "BatterySensor.h"

BatterySensor::BatterySensor(
    Logger* logger,
    uint8_t sensePin,
    uint8_t activationPin,
    uint16_t refVoltage,
    float dividerRatio
) {
    this->logger = logger;
    this->sensePin = sensePin;
    this->activationPin = activationPin;
    this->refVoltage = refVoltage;
    this->dividerRatio = dividerRatio;
}

BatterySensor::~BatterySensor() {
}

void BatterySensor::init() {
    pinMode(this->sensePin, INPUT);
    pinMode(this->activationPin, OUTPUT);
    digitalWrite(this->activationPin, LOW);
}

void BatterySensor::read(Reading* reading) {
    unsigned long start = millis();

    this->turnOn();
    int analogValue = analogRead(this->sensePin);
    this->turnOff();

    uint16_t voltage = analogValue * this->refVoltage * this->dividerRatio / 1024;
    reading->battery = voltage;

    this->logger->logDuration("Battery read", millis() - start);
}

void BatterySensor::turnOn() {
    digitalWrite(this->activationPin, HIGH);
    delayMicroseconds(10); // copes with slow switching activation circuits

    analogRead(this->sensePin);
    delay(2); // allow the ADC to stabilize
}

void BatterySensor::turnOff() {
    digitalWrite(this->activationPin, LOW);
}
