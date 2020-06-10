#ifndef __WIFI_CONFIG_MANAGER__
#define __WIFI_CONFIG_MANAGER__

#include <ConfigManager.h>
#include "../common/config.h"

void wifiConfigInit();
void wifiConfigLoop();
void wifiConfigClear();

void createCustomScanRoute(WebServer *server);

#endif