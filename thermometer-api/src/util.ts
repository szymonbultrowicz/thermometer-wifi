import { isEmpty } from "lodash";

export const validateDefined = (name: string): string => {
    const value = process.env[name];
    if (value == undefined || isEmpty(value)) {
        console.error(`${name} required`);
        process.exit(1);
    }
    return value;
}

export const isDefined = <T>(value: T | undefined | null): value is T => 
    value !== undefined && value !== null;
