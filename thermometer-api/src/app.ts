import { sendNotifications } from './notifier/notifier';
import express from 'express';
import cors from 'cors';
import { fetchHistory } from './query-api/history';
import { BadRequestError } from './errors';
import { fetchLastItem } from './query-api/last-value';

export const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:4200',
}));

app.get('/history', async (req, res) => {
    try {
        const history = await fetchHistory(req.query.timeframe as (string | undefined));
        res.send({
            result: history,
        });
    } catch (e) {
        console.error(e);
        if (e instanceof BadRequestError) {
            res.sendStatus(400);
        } else {
            res.sendStatus(500);
        }
    }
});

app.get('/last', async (req, res) => {
    try {
        const lastItem = await fetchLastItem();
        res.send({
            result: lastItem,
        });
    } catch (e) {
        console.error(e);
        if (e instanceof BadRequestError) {
            res.sendStatus(400);
        } else {
            res.sendStatus(500);
        }
    }
});

// app.post('/notifications', async (req, res) => {
//     try {
//         console.log("Notification content:", req.body);
//         await sendNotification(req.body);
//         res.sendStatus(200);
//     } catch(e) {
//         console.error(e);
//         res.sendStatus(e);
//     }
// });

app.put('/notifications', async (req, res) => {
    try {
        await sendNotifications();
        res.sendStatus(200);
    } catch(e) {
        console.error(e);
        res.sendStatus(e);
    }
});

