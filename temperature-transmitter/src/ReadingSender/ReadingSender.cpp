#include "ReadingSender.h"

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

    this->client->publish(MQTT_TOPIC, this->serializeReading(reading).c_str());

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
    String temperature = "\"temperature\":" + String(reading->temperature) + ",";
    String humidity = "\"humidity\":" + String(reading->humidity) + ",";
    String battery = "\"battery\":" + String(reading->battery) + ",";
    String timestamp = "\"timestamp\":" + String(timeClient.getEpochTime());
    return "{"
        + temperature
        + humidity
        + battery
        + timestamp
    + "}";
}
