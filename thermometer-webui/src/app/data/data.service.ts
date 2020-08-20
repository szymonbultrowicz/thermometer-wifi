import { TimeframeService } from './timeframe.service';
import { environment } from './../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap, map, shareReplay, distinctUntilChanged, tap, startWith } from 'rxjs/operators';
import { HistoricalData, LastValue, Reading } from './models';
import { merge, combineLatest, Subject } from 'rxjs';

type QueryParams =  HttpParams | {
  [param: string]: string | string[];
};

export interface DataPoint {
  timestamp: number,
  value: number | null,
}

const ENDPOINT_BASE = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _refreshAction$ = new Subject<void>();

  readonly historicalData$ = combineLatest(
    this.timeFrameService.timeframe$.pipe(distinctUntilChanged()),
    this.refreshAction$.pipe(startWith(undefined)),
  ).pipe(
    switchMap(([timeframe]) => this.requestWithToken<HistoricalData>(`${ENDPOINT_BASE}/history`, {
      timeframe,
    })),
    shareReplay(),
  );

  readonly lastValue$ = this.refreshAction$.pipe(
    startWith(undefined),
    switchMap(() => this.requestWithToken<LastValue>(`${ENDPOINT_BASE}/last`).pipe(
      shareReplay(),
    ))
  );
  

  constructor(
    private readonly httpClient: HttpClient,
    private readonly timeFrameService: TimeframeService,
  ) { }

  get refreshAction$() {
    return this._refreshAction$.asObservable();
  }

  get series$() {
    return this.historicalData$.pipe(
      map(data => ({
        temperature: this.retrieveSeries(data, 'temperature'),
        humidity: this.retrieveSeries(data, 'humidity'),
        battery: this.retrieveSeries(data, 'battery'),
      })),
    );
  }

  refresh() {
    this._refreshAction$.next();
  }

  private retrieveSeries(data: HistoricalData, series: keyof Reading): DataPoint[] {
    return data.result.map(entry => ({
      timestamp: entry.timestamp,
      value: entry[series] < (series === 'battery' ? 3000 : -99) ? null : entry[series],
    }));;
  }

  private requestWithToken<T>(url: string, params?: QueryParams) {
    return this.httpClient.get<T>(url, {
      params,
    });
  }
}
