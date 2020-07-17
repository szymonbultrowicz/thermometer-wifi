#ifndef __BATTERY_SENSOR_H__
#define __BATTERY_SENSOR_H__

#include <Battery.h>
#include "../common/reading.h"

class BatterySensor
{
private:
    Battery* battery;
    uint16_t refVoltage;
    float dividerRatio;
    uint8_t sensePin;
public:
    BatterySensor(
        uint8_t sensePin,
        uint16_t refVoltage,
        float dividerRatio
    );
    ~BatterySensor();
    void init();
    void read(Reading* reading);
};

#endif