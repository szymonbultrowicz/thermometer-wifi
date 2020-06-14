const AWS = require('aws-sdk');
const {InfluxDB, Point } = require('@influxdata/influxdb-client');

const { INFLUX_BUCKET, INFLUX_ORG, INFLUX_TOKEN, INFLUX_URL } = process.env;

const client = new InfluxDB({url: 'https://eu-central-1-1.aws.cloud2.influxdata.com', token: INFLUX_TOKEN});
const writeApi = client.getWriteApi(INFLUX_ORG, INFLUX_BUCKET);

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        switch (event.httpMethod) {
            case 'POST':
                if (!event.body) {
                    throw new Error(`Empty request payload`);
                }
                await handleRequest(JSON.parse(event.body));
                return buildResponse(200, {
                    message: 'ok',
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

const handleRequest = async (data) => {
    if (!data.timestamp) {
        throw new Error(`Undefined mandatory property: timestamp`);
    }
    validateIsNumberOrUndefined(data.temperature, 'temperature');
    validateIsNumberOrUndefined(data.humidity, 'humidity');
    validateIsNumberOrUndefined(data.battery, 'battery');
    
    const point = new Point('readings')
        // .timestamp(data.timestamp)
        .floatField('temperature', data.temperature / 10)
        .floatField('humidity', data.humidity / 10)
        .intField('battery', data.battery)
    
    writeApi.writePoint(point);
    await writeApi.close();
};

const validateIsNumberOrUndefined = (value, name) => {
    const expectedTypes = ['undefined', 'number', 'null'];
    if (!expectedTypes.includes(typeof value) && value !== null) {
        throw new Error(`Incorrect type of property ${name}. Found '${typeof value}', expected one of: [${expectedTypes.join(', ')}]`);
    }
}

const buildResponse = (statusCode, body, headers = {}) => ({
    statusCode,
    body: JSON.stringify(typeof body == 'object' ? body : {message: body}),
    headers: {
        'Content-Type': 'application/json',
        ...headers,
    },
})
