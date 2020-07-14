#include "ReadingSender.h"

BearSSL::WiFiClientSecure wifiClient;
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

void ReadingSender::init() {
    timeClient.begin();
    wifiClient.setInsecure();
}

void ReadingSender::send(Reading* reading) {
    this->updateTime();

    HTTPClient http;
    http.begin(wifiClient, ENDPOINT);
    http.addHeader("Authorization", TOKEN);
    http.addHeader("Content-Type", "application/json");
    int responseCode = http.POST(this->serializeReading(reading));
    http.end();

    if (responseCode == 200) {
        Serial.println("Sent reading");
    } else {
        Serial.println("Failed to send the reading. Response code: " + String(responseCode));
    }
}

void ReadingSender::updateTime() {
    while(!timeClient.update()){
        timeClient.forceUpdate();
    }
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
