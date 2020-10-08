export interface ThermometerReading {
    temperature?: number | null;
    humidity?: number | null;
    battery?: number | null;
    connectionTime?: number | null;
    readTime?: number | null;
    timestamp?: number | null;
    error?: string | null;
}
