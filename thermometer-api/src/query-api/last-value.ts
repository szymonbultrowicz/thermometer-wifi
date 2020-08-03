import { fetchQuery, INFLUX_BUCKET } from '../data/data-query';

export const fetchLastItem = async () => {
    const query = `from(bucket: "${INFLUX_BUCKET}")
|> range(start: -15m, stop: now())
|> filter(fn: (r) => r["_measurement"] == "readings")
|> sort(columns:["_time"], desc:true)`;
    const rows = await fetchQuery(query);
    return rows[0];
}
