import { publishDataPoint } from './data-publisher';
import { ThermometerReading } from "./model";
import { isNil, isNumber } from 'lodash';

export const handleMessage = async (data: ThermometerReading) => {
    if (!data.time) {
        throw new Error(`Undefined mandatory property: timestamp`);
    }
    validateIsNumberOrUndefined(data, 't');
    validateIsNumberOrUndefined(data, 'h');
    validateIsNumberOrUndefined(data, 'b');
    validateIsNumberOrUndefined(data, 'ct');
    validateIsNumberOrUndefined(data, 'rt');
    validateIsNumberOrUndefined(data, 'time');
    
    console.log(data);
    if (!isNil(data.e)) {
        console.warn(data.e);
    }
    publishDataPoint(data);
};

const validateIsNumberOrUndefined = <T>(obj: T, key: keyof T) => {
    const value = obj[key];
    if (!isNil(value) && !isNumber(value)) {
        throw new Error(`Incorrect type of property ${key}: '${typeof value}'`);
    }
}