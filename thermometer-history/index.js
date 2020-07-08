const AWS = require('aws-sdk');
const { InfluxDB } = require('@influxdata/influxdb-client')

const DAY_MILIS = 24 * 60 * 60 * 1000;
const { INFLUX_URL, INFLUX_ORG, INFLUX_BUCKET, INFLUX_TOKEN } = process.env;

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;

const timeMultipliers = {
    's': 1,
    'm': MINUTE,
    'h': HOUR,
    'd': DAY,
    'w': WEEK,
    'mo': MONTH,
};

const client = new InfluxDB({url: 'https://eu-central-1-1.aws.cloud2.influxdata.com', token: INFLUX_TOKEN});
const queryApi = client.getQueryApi(INFLUX_ORG);

exports.handler = async (event) => {
    try {
        switch (event.httpMethod) {
            case 'GET':
                const timeframe = (event.queryStringParameters || {}).timeframe || '1d';
                validateDuration(timeframe);
                const result = await fetchData(timeframe.startsWith('-') ? timeframe : `-${timeframe}`);
                return buildResponse(200, {
                    result,
                });
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        console.error(err);
        return buildResponse(400, {
            error: err.message,
        });
    }
};

const aggregationWindow = (timeframe) => {
    const [,amountStr, unit] = timeframe.match(/-?(\d+)([a-zA-Z]{1,2})$/);
    const multiplier = timeMultipliers[unit];
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

const fetchData = async (from, ) => {
    const query = `from(bucket: "thermometer")
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

const fetchQuery = async (query) => {
    const rows = [];
    return new Promise((resolve, reject) => {
        queryApi.queryRows(query, {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                rows.push(o);
            },
            error(error) {
                console.error(error);
                reject(error);
            },
            complete() {
                resolve(rowsToData(rows));
            },
        });
    });
};

const rowsToData = (rows) => {
    const map = rows.reduce((acc, row) => {
        const item = acc[row._time] || { timestamp: new Date(row._time).getTime() };
        item[row._field] = parseFloat(row._value);
        acc[row._time] = item;
        return acc;
    }, {});
    return Object.values(map);
}

const buildResponse = (statusCode, body, headers = {}) => ({
    statusCode,
    body: JSON.stringify(typeof body == 'object' ? body : {message: body}),
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...headers,
    },
})

function validateDuration(value) {
    if (!value.match(/^-?\d+(s|m|h|d|w|mo)$/)) {
        throw Error('Invalid duration: ' + value);
    }
}
