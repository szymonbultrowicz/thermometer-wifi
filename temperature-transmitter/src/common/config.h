#ifndef __CONFIG_H__
#define __CONFIG_H__

#include "Arduino.h"
#include "config-prv.h"

#define PIN_RESET 14 // D5
#define PIN_SETUP 13  // D7
#define PIN_DHT 5  // D1
#define PIN_DHT_POWER 4  // D2
#define PIN_LED 2   // D4

#define RESET_DELAY 3   // s
#define LOOP_DELAY 30e6

#define DHTTYPE AM2301

#endif