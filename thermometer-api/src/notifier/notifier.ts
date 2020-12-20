import { generateAlerts, Alert } from './alert-generator';
import { fetchLastState, fetchCurrentState, updateState } from './state-manager';
import { createRedisClient } from './redis';
import * as admin from 'firebase-admin';
import { validateDefined } from '../util';

const firebaseUrl = validateDefined('FIREBASE_URL');
const firebaseTopic = validateDefined('FIREBASE_TOPIC');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: firebaseUrl,
});

const sendNotification = async (alert: Alert) =>
    admin.messaging().sendToTopic(firebaseTopic, {
        data: {
            resource: alert.resource,
            state: alert.state,
            value: String(alert.value),
        },
    });


export const sendNotifications = async () => {
    const redis = createRedisClient();
    const oldState = await fetchLastState(redis);
    const newState = await fetchCurrentState();

    console.log("oldState", oldState);
    console.log("newState", newState);

    const alerts = generateAlerts(oldState, newState);

    console.log("alerts", alerts);
    
    await Promise.all(
        alerts.map(alert => sendNotification(alert)),
    );

    await updateState(newState, redis);
};
