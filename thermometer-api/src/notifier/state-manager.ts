import { fetchLastItem } from '../query-api/last-value';
import { RedisClient } from "redis";

export interface State {
    temperature?: number | null;
    battery?: number | null;
}

const SET_KEY = "greenhouse";
const FIELD_KEY = "state";

const createEmptyState = (): State => ({});

export const fetchLastState = (redis: RedisClient): Promise<State> =>
    new Promise((resolve, reject) => {
        redis.hget(SET_KEY, FIELD_KEY, (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            if (!res) {
                resolve(createEmptyState());
                return;
            }
            resolve(JSON.parse(res) as State);
        })
    });

export const fetchCurrentState = async (): Promise<State> => {
    const lastInfluxItem = await fetchLastItem();
    if (!lastInfluxItem) {
        return createEmptyState();
    }

    const state: State = {
        temperature: lastInfluxItem.temperature,
        battery: lastInfluxItem.battery,
    };

    return state;
}

export const updateState = async (state: State, redis: RedisClient) =>
    new Promise((resolve, reject) => {
        redis.hset(SET_KEY, FIELD_KEY, JSON.stringify(state), (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(res)
        })
    });
