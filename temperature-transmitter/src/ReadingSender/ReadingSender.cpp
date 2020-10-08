#include "ReadingSender.h"

#define BUFFER_SIZE 512

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");
WiFiClient wifiClient;

ReadingSender::ReadingSender() {
    this->client = new PubSubClient(MQTT_HOST, MQTT_PORT, wifiClient);
}

void ReadingSender::init() {
    timeClient.begin();
    if (!this->client->connected()) {
        if (!this->client->connect("ESP8266Thermometer", MQTT_USER, MQTT_PASSWORD)) {
            Serial.print("MQTT connection failed! Error code = ");
            Serial.println(this->client->state());
            return;
        }
    }
}

void ReadingSender::send(Reading* reading) {
    this->updateTime();

    unsigned long sendStart = millis();

    if (!this->client->publish(MQTT_TOPIC, this->serializeReading(reading).c_str())) {
        Serial.println("Failed to send the reading");
    }
    

    logDuration("Sending", millis() - sendStart);
}

void ReadingSender::sendError(ReadingError* error) {
    this->updateTime();

    unsigned long sendStart = millis();

    if (!this->client->publish(MQTT_TOPIC, this->serializeReadingError(error).c_str())) {
        Serial.println("Failed to send the error");
    }

    logDuration("Sending", millis() - sendStart);
}

void ReadingSender::halt() {
    this->client->disconnect();
}

void ReadingSender::updateTime() {
    unsigned long start = millis();
    while(!timeClient.update()){
        timeClient.forceUpdate();
    }
    logDuration("NTP", millis() - start);
}

String ReadingSender::serializeReading(Reading* reading) {
    StaticJsonDocument<BUFFER_SIZE> doc;
    doc["t"] = reading->temperature;
    doc["h"] = reading->humidity;
    doc["b"] = reading->battery;
    doc["ct"] = reading->connectionTime;
    doc["rt"] = reading->readTime;
    doc["time"] = timeClient.getEpochTime();

    String output;
    serializeJson(doc, output);
    return output;
}

String ReadingSender::serializeReadingError(ReadingError* error) {
    StaticJsonDocument<BUFFER_SIZE> doc;
    doc["b"] = error->battery;
    doc["ct"] = error->connectionTime;
    doc["rt"] = error->readTime;
    doc["e"] = error->error;
    doc["time"] = timeClient.getEpochTime();

    String output;
    serializeJson(doc, output);
    Serial.print("Error: ");
    Serial.println(output);
    return output;
}

