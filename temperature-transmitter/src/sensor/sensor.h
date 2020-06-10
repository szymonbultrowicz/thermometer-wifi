#ifndef __SENSOR_H__
#define __SENSOR_H__

#include "Arduino.h"
#include "DHT.h"
#include "../common/config.h"
#include "../common/reading.h"

void sensorInit();
Reading* sensorRead();

#endif
