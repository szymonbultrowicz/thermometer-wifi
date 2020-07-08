import { TimeframeService } from './timeframe.service';
import { environment } from './../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, switchMap, map, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { TokenService } from './../auth/token.service';
import { HistoricalData, LastValue, Reading } from './models';
import { Series } from '@swimlane/ngx-charts';

type QueryParams =  HttpParams | {
  [param: string]: string | string[];
};

const ENDPOINT_BASE = environment.API_URL;

const notUndefined = <T>(v: T | undefined): v is T => v !== undefined;

@Injectable({
  providedIn: 'root'
})
export class DataService {

  readonly historicalData$ = this.timeframeService.timeframe$.pipe(
    distinctUntilChanged(),
    switchMap(timeframe => this.requestWithToken<HistoricalData>(`${ENDPOINT_BASE}/history`, {
      timeframe,
    })),
    shareReplay(),
  );
  readonly lastValue$ = this.requestWithToken<LastValue>(`${ENDPOINT_BASE}/last`).pipe(
    shareReplay(),
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly tokenService: TokenService,
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

  private retrieveSeries(data: HistoricalData, series: keyof Reading): Series {
    const values = data.result.map(entry => ({
      name: new Date(entry.timestamp),
      value: entry[series],
    }));
    return {
      name: series,
      series: values,
    };
  }

  private requestWithToken<T>(url: string, params?: QueryParams) {
    return this.tokenService.token$.pipe(
      filter(token => token !== undefined),
      switchMap((token: string) => this.httpClient.get<T>(url, {
        headers: {
          Authorization: token,
        },
        params,
      })),
    );
  }
}
