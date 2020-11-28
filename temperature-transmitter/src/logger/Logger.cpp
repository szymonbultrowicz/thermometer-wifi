#include "Logger.h"

Logger::Logger() {
    if (LOG_SAVE_ENABLED) {
        if (!LittleFS.begin()) {
            Serial.println("An Error has occurred while mounting LittleFS");
            return;
        }
        File f = LittleFS.open(LOG_PATH, "r");
        if (!f) {
            Serial.println("No log file found");
            return;
        }
        Serial.println("Log file:");
        Serial.println(f.size());
        this->existingLogContent = f.readString();
        Serial.println(existingLogContent);

        f.close();
    }
}

void Logger::print(String line) {
    char lineBuffer[100];
    this->format(lineBuffer, &line);
    Serial.println(lineBuffer);
}

void Logger::logPerm(String line) {
    char lineBuffer[100];
    this->format(lineBuffer, &line);
    Serial.println(lineBuffer);
    if (LOG_SAVE_ENABLED) {
        sprintf(this->buffer + strlen(this->buffer), "%s\n", lineBuffer);
    }
}

void Logger::logDuration(String tag, unsigned int duration) {
    this->print(tag + " -> " + duration + "ms");
}

void Logger::format(char* buffer, String* line) {
    sprintf(buffer, "%d: %s", millis(), line->c_str());
}

void Logger::halt() {
    if (LOG_SAVE_ENABLED) {
        Serial.println("Saving log");
        Serial.println(this->buffer);
        File f = LittleFS.open("/output.log", "w+");
        f.print(this->existingLogContent.substring(std::max(this->existingLogContent.length(), (unsigned int)LOG_MAX_LENGTH) - LOG_MAX_LENGTH));
        f.close();
    }
}