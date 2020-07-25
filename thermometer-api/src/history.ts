import { fetchQuery, INFLUX_BUCKET } from "./data/data-query";
import { BadRequestError } from "./errors";
import { validateDefined } from "./util";

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;

const timeframeRegex = /^-?(\d+)(s|m|h|d|w|mo)$/;

const timeMultipliers = new Map([
    ['s', 1],
    ['m', MINUTE],
    ['h', HOUR],
    ['d', DAY],
    ['w', WEEK],
    ['mo', MONTH],
]);

export const fetchHistory = async (timeframe: string = '1d') => {
    validateDuration(timeframe);
    return await fetchData(timeframe.startsWith('-') ? timeframe : `-${timeframe}`);
};

const aggregationWindow = (timeframe: string) => {
    const match = timeframe.match(timeframeRegex);
    if (match === null) {
        throw new BadRequestError(`Incorrect timeframe: ${timeframe}`);
    }

    const [,amountStr, unit] = match;
    const multiplier = timeMultipliers.get(unit);
    if (!multiplier) {
        throw Error(`Invalid unit: ${unit}`);
    }
    const amount = parseInt(amountStr, 10);
    const windowSec = amount * multiplier;
    if (windowSec <= 15 * MINUTE) {
        return '1s';
    }
    if (windowSec <= 2 * HOUR) {
        return '1m';
    }
    if (windowSec <= DAY) {
        return '15m';
    }
    if (windowSec <= DAY) {
        return '15m';
    }
    if (windowSec <= WEEK) {
        return '1h';
    }
    if (windowSec <= MONTH) {
        return '3h';
    }
    return '1h';
};

const fetchData = async (from: string) => {
    const query = `from(bucket: "${INFLUX_BUCKET}")
|> range(start: ${from}, stop: now())
|> filter(fn: (r) => r["_measurement"] == "readings")
|> aggregateWindow(every: ${aggregationWindow(from)}, fn: mean)
`;
    const startTime = Date.now();
    const rows = await fetchQuery(query);
    const endTime = Date.now();
    console.log(`InfluxDB query took ${endTime - startTime}ms`);
    return rows;
}

function validateDuration(value: string) {
    if (!value.match(timeframeRegex)) {
        throw Error('Invalid duration: ' + value);
    }
}
