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
    pinMode(this->pinPower, OUTPUT);
    digitalWrite(this->pinPower, HIGH);
    this->sensor->begin();
}

void TempSensor::halt() {
    digitalWrite(pinPower, LOW);
}

void TempSensor::read(Reading* reading) {
    float humidity = this->sensor->readHumidity();
    float temperature = this->sensor->readTemperature(false);

    int retryCount = 0;
    while (isnan(humidity) || isnan(temperature)) {
        Serial.print("Failed to read temperature sensor. Attempt: ");
        Serial.println(retryCount + 1);
        delay(100);
        humidity = this->sensor->readHumidity();
        temperature = this->sensor->readTemperature();

        if (++retryCount > 30) {
            return;
        }
    }

    if (isnan(humidity) || isnan(temperature)) {
        return;
    }

    reading->temperature = round(temperature * 10.0);
    reading->humidity = round(humidity * 10);
}