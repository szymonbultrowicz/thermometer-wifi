#include "WifiPortal.h"
#include <ESP8266WebServer.h>

#define BUFFER_SIZE 512

ESP8266WebServer webServer;

/*
window.addEventListener('load', () => {
  var dhcpEl = document.getElementById('dhcp');
  dhcpEl.style.width = 'auto';
  dhcpEl.addEventListener('change', updateVisibility);

  document.querySelectorAll('[placeholder]').forEach(e => {
    const row = document.createElement('div');
    const label = document.createElement('label');
    label.setAttribute('for', e.getAttribute('id'));
    label.innerText = e.getAttribute('placeholder');
    row.appendChild(label);
    e.removeAttribute('placeholder');
    e.parentElement.insertBefore(row, e);
    row.appendChild(e);
  });
  document.querySelectorAll('form > br').forEach(e => e.remove());

  function updateVisibility() {
    const dhcp = dhcpEl.checked;
    document.querySelectorAll('[data-if=dhcp]').forEach(e => e.parentElement.style.display = dhcp ? 'none' : 'block');
  }
  updateVisibility();

  dhcpEl.parentElement.style.marginTop = '20px';
});
*/
const char* jsMin = "<script>window.addEventListener('load',()=>{var e=document.getElementById('dhcp');function t(){const t=e.checked;document.querySelectorAll('[data-if=dhcp]').forEach(e=>e.parentElement.style.display=t?'none':'block')}e.style.width='auto',e.addEventListener('change',t),document.querySelectorAll('[placeholder]').forEach(e=>{const t=document.createElement('div'),n=document.createElement('label');n.setAttribute('for',e.getAttribute('id')),n.innerText=e.getAttribute('placeholder'),t.appendChild(n),e.removeAttribute('placeholder'),e.parentElement.insertBefore(t,e),t.appendChild(e)}),document.querySelectorAll('form > br').forEach(e=>e.remove()),t(),e.parentElement.style.marginTop='20px'});</script>";

WifiPortal::WifiPortal() {
    this->wifiManager = new WiFiManager();
}

void WifiPortal::configure() {
    this->wifiManager->setConfigPortalTimeout(180);

    WiFiManagerParameter useDhcp("dhcp", "Use DHCP", 0, 1, "type=\"checkbox\" checked"); 
    WiFiManagerParameter staticIp("ip", "IP address", "192.168.1.40", 15, "data-if=\"dhcp\"");
    WiFiManagerParameter subnet("subnet", "Subnet", "255.255.255.0", 15, "data-if=\"dhcp\"");
    WiFiManagerParameter gateway("gateway", "Gateway", "192.168.1.1", 15, "data-if=\"dhcp\"");
    WiFiManagerParameter dns1("dns1", "DNS", "8.8.8.8", 15, "data-if=\"dhcp\"");
    WiFiManagerParameter dns2("dns2", "DNS2", "1.1.1.1", 15, "data-if=\"dhcp\"");

    wifiManager->addParameter(&useDhcp);
    wifiManager->addParameter(&staticIp);
    wifiManager->addParameter(&subnet);
    wifiManager->addParameter(&gateway);
    wifiManager->addParameter(&dns1);
    wifiManager->addParameter(&dns2);
    wifiManager->setCustomHeadElement(jsMin);

    this->wifiManager->startConfigPortal("thermometer", "12345678");

    WifiConfig* config = new WifiConfig();
    config->useDhcp = useDhcp.getValue() == "1";
    config->ip.fromString(staticIp.getValue());
    config->subnet.fromString(subnet.getValue());
    config->gateway.fromString(gateway.getValue());
    config->dns1.fromString(dns1.getValue());
    config->dns2.fromString(dns2.getValue());

    this->saveCredentials(config);

    delete config;
}

void WifiPortal::tryConnect() {
    WifiConfig credentials = this->loadCredentials();
    if (!credentials.empty) {
        Serial.print("Connecting to SSID: ");
        Serial.println((const char*)&credentials.ssid[0]);

        WiFi.config(credentials.ip, credentials.gateway, credentials.subnet, credentials.dns1, credentials.dns2);
        WiFi.begin((const char*)&credentials.ssid[0], (const char*)&credentials.password[0]);

        wl_status_t status = WiFi.status();
        int attempt = 1;
        while(status != WL_CONNECTED) {
            if (status == WL_CONNECT_FAILED) {
                Serial.println("Failed to connect to wifi");
                break;
            }
            if (attempt > 10) {
                Serial.println("Connection timeout");
                break;
            }
            
            delay(1000);
            status = WiFi.status();
        }
    }
}

void WifiPortal::saveCredentials(WifiConfig* config) {
    if (!LittleFS.begin()) {
        Serial.println("An Error has occurred while mounting LittleFS");
        return;
    }

    StaticJsonDocument<BUFFER_SIZE> doc;
    doc["ssid"] = WiFi.SSID();
    doc["password"] = WiFi.psk();
    doc["dhcp"] = config->useDhcp;
    doc["ip"] = config->ip.toString();
    doc["subnet"] = config->subnet.toString();
    doc["gateway"] = config->gateway.toString();
    doc["dns1"] = config->dns1.toString();
    doc["dns2"] = config->dns2.toString();

    File configFile = LittleFS.open("/config.json", "w");
    WriteBufferingStream bufferedFile(configFile, 64);
    size_t bytesWritten = serializeJson(doc, bufferedFile);
    if (bytesWritten == 0) {
        Serial.println("Failed to write config file");
    }

    configFile.close();
    Serial.println("Saved config file");
}

bool isEmpty(const char* str) {
    return str == nullptr || strlen(str) == 0;
}

WifiConfig WifiPortal::loadCredentials() {
    WifiConfig config;
    if (!LittleFS.begin()) {
        Serial.println("An Error has occurred while mounting LittleFS");
        return config;
    }

    if (!LittleFS.exists("/config.json")) {
        Serial.println("Config file doesn't exist");
        return config;
    }

    Serial.println("Reading config file");
    File configFile = LittleFS.open("/config.json", "r");

    if (!configFile) {
        Serial.println("Failed to open config file");
        return config;
    }

    Serial.println("Opened config file");

    StaticJsonDocument<BUFFER_SIZE> doc;
    ReadBufferingStream bufferingStream(configFile, 64);
    DeserializationError err = deserializeJson(doc, bufferingStream);
    if (err) {
        Serial.print("Failed to parse config file: ");
        Serial.println(err.c_str());
        return config;
    }

    const char* ssid = doc["ssid"];
    const char* password = doc["password"];
    if (!isEmpty(ssid)) {
        strcpy(config.ssid, ssid);
        if (!isEmpty(password)) {
            strcpy(config.password, password);
        }
        config.empty = false;
    }

    boolean dhcp = doc["dhcp"];
    config.useDhcp = dhcp;
    if (!config.useDhcp) {
        const char* ip = doc["ip"];
        const char* subnet = doc["subnet"];
        const char* gateway = doc["gateway"];
        const char* dns1 = doc["dns1"];
        const char* dns2 = doc["dns2"];
        config.ip.fromString(ip);
        config.subnet.fromString(subnet);
        config.gateway.fromString(gateway);
        config.dns1.fromString(dns1);
        config.dns2.fromString(dns2);
    }

    configFile.close();

    return config;
}
