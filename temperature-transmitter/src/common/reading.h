#ifndef __READING_H__
#define __READING_H__

#include "config.h"

struct Reading {
    int temperature = UNSET_INT;
    int humidity = UNSET_INT;
    int battery = 0;
};

#endif