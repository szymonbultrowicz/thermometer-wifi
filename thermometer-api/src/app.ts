import express from 'express';
import cors from 'cors';
import { fetchHistory } from './history';
import { BadRequestError } from './errors';
import { fetchLastItem } from './last-value';

export const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:4200',
}));

app.get('/history', async (req, res) => {
    try {
        const history = await fetchHistory(req.params.timeframe);
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