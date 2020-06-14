const AWS = require('aws-sdk');
const { InfluxDB } = require('@influxdata/influxdb-client')

const DAY_MILIS = 24 * 60 * 60 * 1000;
const { INFLUX_URL, INFLUX_ORG, INFLUX_BUCKET, INFLUX_TOKEN } = process.env;

const client = new InfluxDB({url: 'https://eu-central-1-1.aws.cloud2.influxdata.com', token: INFLUX_TOKEN});
const queryApi = client.getQueryApi(INFLUX_ORG);

exports.handler = async (event) => {
    try {
        switch (event.httpMethod) {
            case 'GET':
                const result = await fetchLastItem();
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

const fetchLastItem = async () => {
    const query = `from(bucket: "thermometer")
|> range(start: -15m, stop: now())
|> filter(fn: (r) => r["_measurement"] == "readings")
|> sort(columns:["_time"], desc:true)`;
    const rows = await fetchQuery(query);
    console.log(rows);
    return rows;
}

const fetchQuery = async (query) => {
    const rows = [];
    return new Promise((resolve, reject) => {
        queryApi.queryRows(query, {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                rows.push(o);
                console.log(
                  JSON.stringify(o)
                )
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
