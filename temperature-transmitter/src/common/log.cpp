#include "log.h"

void logDuration(const char* label, unsigned long duration) {
    Serial.print(label);
    Serial.print(" duration: ");
    Serial.print(duration);
    Serial.println("ms");
}