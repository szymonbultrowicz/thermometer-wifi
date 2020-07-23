import * as mqtt from 'mqtt';
import { isEmpty } from 'lodash';

const validateDefined = (name: string): string => {
    const value = process.env[name];
    if (value == undefined || isEmpty(value)) {
        console.error(`${name} required`);
        process.exit(1);
    }
    return value;
}

console.log(process.env);

const host = validateDefined('MQTT_HOST');
const topic = validateDefined('MQTT_TOPIC');
const authData = process.env.MQTT_USER && process.env.MQTT_PASSWORD 
    ? { 
        username: process.env.MQTT_USER,
        password: process.env.MQTT_PASSWORD,
    }
    : {};

const client = mqtt.connect({
    protocol: 'mqtt',
    host: host,
    ...authData,
});

client.subscribe(topic, (err) => {
    if (err) {
        console.log(`Failed to connect to MQTT broker: ${err}`);
        process.exit(2);
    }
});

client.on('message', (t, msg) => {
    switch (t) {
        case topic:
            handleMessage(msg.toString('utf-8'));
    }
});

function handleMessage(message: string): void {
    console.log(message);
}
