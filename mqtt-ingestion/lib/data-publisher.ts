import { validateDefined } from './util';
import { Point, InfluxDB } from '@influxdata/influxdb-client';
import { ThermometerReading } from './model';
import { isNumber } from 'lodash';

const INFLUX_HOST = validateDefined('INFLUX_HOST');
const INFLUX_TOKEN = validateDefined('INFLUX_TOKEN');
const INFLUX_ORG = validateDefined('INFLUX_ORG');
const INFLUX_BUCKET = validateDefined('INFLUX_BUCKET');

const client = new InfluxDB({url: INFLUX_HOST, token: INFLUX_TOKEN});

const isDefined = (value: number | undefined | null): value is number => isNumber(value);

export const publishDataPoint = async (data: ThermometerReading) => {
    const point = new Point('readings')
        .timestamp(data.timestamp ? new Date(data.timestamp * 1000) : new Date());

    if (isDefined(data.temperature)) {
        point.floatField('temperature', data.temperature / 10);
    }
    if (isDefined(data.humidity)) {
        point.floatField('humidity', data.humidity / 10);
    }
    if (isDefined(data.battery)) {
        point.intField('battery', data.battery);
    }
    
    const writeApi = client.getWriteApi(INFLUX_ORG, INFLUX_BUCKET);
    writeApi.writePoint(point);
    await writeApi.close();
};
