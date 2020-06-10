#ifndef __READING_H__
#define __READING_H__

struct Reading {
    int temperature;
    int humidity;
    int battery;

    Reading(int t, int h, int b) {
        temperature = t;
        humidity = h;
        battery = b;
    }
};

#endif