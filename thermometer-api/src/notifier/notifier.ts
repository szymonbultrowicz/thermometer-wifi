import * as admin from 'firebase-admin';
import { validateDefined } from '../util';

const firebaseUrl = validateDefined('FIREBASE_URL');
const firebaseTopic = validateDefined('FIREBASE_TOPIC');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: firebaseUrl,
});

export const sendNotification = async (temperature: number) =>
    admin.messaging().sendToTopic(firebaseTopic, {
        data: {
            temperature: temperature.toString(),
        },
    })
    .then(console.log);
