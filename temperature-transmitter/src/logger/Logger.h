#ifndef __LOGGER_H__
#define __LOGGER_H__
#include <Arduino.h>
#include <LittleFS.h>
#include "../common/config.h"

class Logger {
    public:
        Logger();
        void logDuration(String tag, unsigned int duration);
        void logPerm(String line);
        void print(String line);
        void halt();
    private:
        void format(char* buffer, String* line);
        char buffer[1000];
        String existingLogContent;
};

#endif