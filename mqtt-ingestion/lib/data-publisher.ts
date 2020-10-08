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
        .timestamp(data.time ? new Date(data.time * 1000) : new Date());

    if (isDefined(data.t)) {
        point.floatField('temperature', data.t / 10);
    }
    if (isDefined(data.h)) {
        point.floatField('humidity', data.h / 10);
    }
    if (isDefined(data.b)) {
        point.intField('battery', data.b);
    }
    if (isDefined(data.ct)) {
        point.intField('connectionTime', data.ct);
    }
    if (isDefined(data.rt)) {
        point.intField('readTime', data.rt);
    }
    
    const writeApi = client.getWriteApi(INFLUX_ORG, INFLUX_BUCKET);
    writeApi.writePoint(point);
    await writeApi.close();
};
