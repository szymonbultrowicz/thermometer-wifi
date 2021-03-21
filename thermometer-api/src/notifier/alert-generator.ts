import { State } from "./state-manager";
import { isDefined } from "../util";

type Resource = "temperature" | "battery" | "liveness";
type ResourceState = "low" | "ok";

const TEMPERATURE_TRESHOLD = parseInt(process.env.TEMPERATURE_TRESHOLD ?? "3", 10);
const BATTERY_TRESHOLD = parseInt(process.env.BATTERY_TRESHOLD ?? "5000", 10);  // mV

export interface Alert {
    resource: Resource;
    state: ResourceState;
    value: number;
};


const isStateDifferent = (oldValue: number | undefined | null, newValue: number | undefined | null, treshold: number): boolean => {
    if (!isDefined(newValue)) {
        return false;
    }
    if (!isDefined(oldValue)) {
        return true;
    }
    
    if (newValue < oldValue && newValue < treshold && oldValue >= treshold) {
        return true;
    }
    if (newValue > oldValue && newValue > treshold && oldValue <= treshold) {
        return true;
    }
    return false;
}

const generateTemperatureAlerts = (oldState: State, newState: State): Alert[] =>
    isStateDifferent(oldState.temperature, newState.temperature, TEMPERATURE_TRESHOLD)
        ? [{
            resource: "temperature",
            state: newState.temperature! < TEMPERATURE_TRESHOLD ? "low" : "ok",
            value: newState.temperature!,
        }]
        : [];

const generateBatteryAlerts = (oldState: State, newState: State): Alert[] =>
    isStateDifferent(oldState.battery, newState.battery, BATTERY_TRESHOLD)
        ? [{
            resource: "battery",
            state: newState.battery! < BATTERY_TRESHOLD ? "low" : "ok",
            value: newState.battery!,
        }]
        : [];

const generateLivenessAlerts = (oldState: State, newState: State): Alert[] => {
    if (!isDefined(oldState.alive) || !isDefined(newState.alive)) {
        return [];
    }
    if (oldState.alive === newState.alive) {
        return [];
    }

    return [{
        resource: "liveness",
        state: newState.alive ? "ok" : "low",
        value: newState.alive ? 1 : 0,
    }];
};

export const generateAlerts = (oldState: State, newState: State) => [
    ...generateTemperatureAlerts(oldState, newState),
    // ...generateBatteryAlerts(oldState, newState),
    // ...generateLivenessAlerts(oldState, newState),
];