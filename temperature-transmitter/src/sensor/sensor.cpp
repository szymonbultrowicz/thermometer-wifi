#include "Arduino.h"
#include "sensor.h"

DHT sensor(PIN_DHT, DHTTYPE);

void sensorInit() {
    sensor.begin();
}

Reading* sensorRead() {
    float humidity = sensor.readHumidity();
    float temperature = sensor.readTemperature();

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