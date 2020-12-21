import { generateAlerts, Alert } from './alert-generator';
import { fetchLastState, fetchCurrentState, updateState, State } from './state-manager';
import { createRedisClient } from './redis';
import * as admin from 'firebase-admin';
import { validateDefined, isDefined } from '../util';

const firebaseUrl = validateDefined('FIREBASE_URL');
const firebaseTopic = validateDefined('FIREBASE_TOPIC');

const LIVENESS_TRESHOLD = parseInt(process.env.LIVENESS_TRESHOLD ?? "5", 10) * 60_000;  // min

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

const fillLiveness = (state: State): State => ({
    ...state,
    alive: isDefined(state.timestamp) && Date.now() - state.timestamp <= LIVENESS_TRESHOLD
});
    

export const sendNotifications = async () => {
    const redis = createRedisClient();
    const oldState = await fetchLastState(redis);
    const newState = fillLiveness(await fetchCurrentState());

    console.log("oldState", oldState);
    console.log("newState", newState);

    const alerts = generateAlerts(oldState, newState);

    console.log("alerts", alerts);
    
    await Promise.all(
        alerts.map(alert => sendNotification(alert)),
    );

    await updateState(newState, redis);
};
