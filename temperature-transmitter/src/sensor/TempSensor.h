#ifndef __SENSOR_H__
#define __SENSOR_H__

#include "Arduino.h"
#include "DHT.h"
#include "../common/config.h"
#include "../common/reading.h"


class TempSensor {
    public:
        TempSensor(uint8_t type, uint8_t pinPower, uint8_t pinReading);
        ~TempSensor();
        void init();
        void halt();
        Reading* read();

    private:
        DHT* sensor;
        uint8_t pinPower;
        uint8_t pinReading;
};

#endif
