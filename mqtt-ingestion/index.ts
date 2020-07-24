require('dotenv').config();

import { ThermometerReading } from './lib/model';
import * as mqtt from 'mqtt';
import { handleMessage } from './lib/message-handler';
import { validateDefined } from './lib/util';

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
            try {
                const data: ThermometerReading = JSON.parse(msg.toString('utf-8'));
                handleMessage(data);
            } catch(e) {
                if (e instanceof SyntaxError) {
                    console.error('Failed to parse message as JSON', e);
                } else {
                    throw e;
                }
            }
    }
});
