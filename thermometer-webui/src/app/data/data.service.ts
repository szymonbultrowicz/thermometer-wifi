import { TimeframeService } from './timeframe.service';
import { environment } from './../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap, map, shareReplay, distinctUntilChanged, tap } from 'rxjs/operators';
import { HistoricalData, LastValue, Reading } from './models';

type QueryParams =  HttpParams | {
  [param: string]: string | string[];
};

export interface DataPoint {
  x: number,
  y: number | null,
}

const ENDPOINT_BASE = environment.apiUrl;

const notUndefined = <T>(v: T | undefined): v is T => v !== undefined;

export interface Serie {
  name: string;
  data: DataPoint[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  readonly historicalData$ = this.timeframeService.timeframe$.pipe(
    distinctUntilChanged(),
    switchMap(timeframe => this.requestWithToken<HistoricalData>(`${ENDPOINT_BASE}/history`, {
      timeframe,
    })),
    map(this.trimData),
    shareReplay(),
  );
  readonly lastValue$ = this.requestWithToken<LastValue>(`${ENDPOINT_BASE}/last`).pipe(
    shareReplay(),
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly timeframeService: TimeframeService,
  ) { }

  get series$() {
    return this.historicalData$.pipe(
      map(data => ({
        temperature: this.retrieveSeries(data, 'temperature'),
        humidity: this.retrieveSeries(data, 'humidity'),
        battery: this.retrieveSeries(data, 'battery'),
      })),
    );
  }

  private retrieveSeries(data: HistoricalData, series: keyof Reading): Serie {
    const values = data.result.map(entry => ({
      x: entry.timestamp,
      y: entry[series] < (series === 'battery' ? 3000 : -99) ? null : entry[series],
    }));
    return {
      name: series,
      data: values,
    };
  }

  private requestWithToken<T>(url: string, params?: QueryParams) {
    return this.httpClient.get<T>(url, {
      params,
    });
  }

  private trimData(data: HistoricalData): HistoricalData {
    const firstValue = data.result.findIndex(point => [point.battery, point.humidity, point.temperature].some(v => v != 0));
    return {
      ...data,
      result: data.result.slice(firstValue),
    };
  }
}
