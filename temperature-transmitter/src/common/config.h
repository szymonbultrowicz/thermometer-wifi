#ifndef __CONFIG_H__
#define __CONFIG_H__

#include "Arduino.h"
#include "config-prv.h"

#define PIN_RESET 14 // D5
#define PIN_DHT 0  // D3

#define RESET_DELAY 3*1000
#define LOOP_DELAY 10*1000

#define DHTTYPE DHT11

#endif