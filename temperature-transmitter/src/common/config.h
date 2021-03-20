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
#define LOOP_DELAY 60e6
#define SETUP_DELAY 500    // ms

#define LOG_SAVE_ENABLED true
#define LOG_PATH "/output.log"
#define LOG_MAX_LENGTH 1000

#define LED_TIME 0  // ms

#define DHTTYPE AM2301

#define PIN_BATTERY_SENSE A0
#define PIN_BATTERY_ACT 12  // D6
#define BATTERY_MIN 4000
#define BATTERY_DIVIDER_RATIO 2
#define BATTERY_REF_VOLTAGE 3300

#define UNSET_INT -32768

#endif