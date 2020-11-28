#ifndef __BATTERY_SENSOR_H__
#define __BATTERY_SENSOR_H__

#include <Battery.h>
#include "../common/reading.h"
#include "../logger/Logger.h"

class BatterySensor
{
private:
    Battery* battery;
    uint16_t refVoltage;
    float dividerRatio;
    uint8_t sensePin;
    uint8_t activationPin;
    Logger* logger;

    void turnOn();
    void turnOff();
public:
    BatterySensor(
        Logger* logger,
        uint8_t sensePin,
        uint8_t activationPin,
        uint16_t refVoltage,
        float dividerRatio
    );
    ~BatterySensor();
    void init();
    void read(Reading* reading);
};

#endif