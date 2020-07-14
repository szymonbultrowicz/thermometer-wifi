#include "Arduino.h"
#include "TempSensor.h"

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

Reading* TempSensor::read() {
    float humidity = this->sensor->readHumidity();
    float temperature = this->sensor->readTemperature();

    if (isnan(humidity) || isnan(temperature)) {
        Serial.println("Failed to get readings");
        return NULL;
    }

    Serial.print("H: ");
    Serial.println(humidity);
    Serial.print("T: ");
    Serial.println(temperature);

    Reading* reading = new Reading(
        round(temperature * 10.0),
        round(humidity * 10),
        0
    );

    return reading;
}