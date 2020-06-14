export interface Reading {
    humidity: number;
    temperature: number;
    battery: number;
    timestamp: number;
};

export interface LastValue {
    result: Reading;
};

export interface HistoricalData {
    result: Reading[];
};
