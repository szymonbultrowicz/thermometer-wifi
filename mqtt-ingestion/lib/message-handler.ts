import { publishDataPoint } from './data-publisher';
import { ThermometerReading } from "./model";
import { isNil, isNumber } from 'lodash';

export const handleMessage = async (data: ThermometerReading) => {
    if (!data.timestamp) {
        throw new Error(`Undefined mandatory property: timestamp`);
    }
    validateIsNumberOrUndefined(data, 'temperature');
    validateIsNumberOrUndefined(data, 'humidity');
    validateIsNumberOrUndefined(data, 'battery');
    validateIsNumberOrUndefined(data, 'timestamp');
    
    console.log(data);
    publishDataPoint(data);
};

const validateIsNumberOrUndefined = <T>(obj: T, key: keyof T) => {
    const value = obj[key];
    if (!isNil(value) && !isNumber(value)) {
        throw new Error(`Incorrect type of property ${key}: '${typeof value}'`);
    }
}