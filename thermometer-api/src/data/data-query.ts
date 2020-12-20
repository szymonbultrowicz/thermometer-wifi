import { validateDefined } from "../util";
import { isNumber } from "util";
import { InfluxDB } from '@influxdata/influxdb-client';
import { ThermometerReading } from "./model";

interface InfluxEntry {
    _time: number;
    _value: number;
    _field: keyof ThermometerReading;
}

const INFLUX_HOST = validateDefined('INFLUX_HOST');
const INFLUX_TOKEN = validateDefined('INFLUX_TOKEN');
const INFLUX_ORG = validateDefined('INFLUX_ORG');
export const INFLUX_BUCKET = validateDefined('INFLUX_BUCKET');

const queryApi = new InfluxDB({url: INFLUX_HOST, token: INFLUX_TOKEN})
    .getQueryApi(INFLUX_ORG);

const isDefined = (value: number | undefined | null): value is number => isNumber(value);

export const fetchQuery = async (query: string): Promise<ThermometerReading[]> => {
    const rows: InfluxEntry[] = [];
    return new Promise((resolve, reject) => {
        queryApi.queryRows(query, {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row) as InfluxEntry;
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

const rowsToData = (rows: InfluxEntry[]) => {
    const map = rows.reduce((acc, row) => {
        const item = acc[row._time] ?? { timestamp: new Date(row._time).getTime() };
        item[row._field] = typeof row._value === "string" ? parseFloat(row._value) : row._value;
        acc[row._time] = item;
        return acc;
    }, {} as  {[k: number]: ThermometerReading});
    return Object.values(map);
}
