import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, switchMap, map, shareReplay } from 'rxjs/operators';
import { TokenService } from './../auth/token.service';
import { HistoricalData, LastValue, Reading } from './models';
import { Series } from '@swimlane/ngx-charts';

const ENDPOINT_BASE = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class DataService {

  readonly historicalData$ = this.requestWithToken<HistoricalData>(`${ENDPOINT_BASE}/history`);
  readonly lastValue$ = this.requestWithToken<LastValue>(`${ENDPOINT_BASE}/last`);

  constructor(
    private readonly httpClient: HttpClient,
    private readonly tokenService: TokenService,
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

  private requestWithToken<T>(url: string) {
    return this.tokenService.token$.pipe(
      filter(token => token !== undefined),
      switchMap((token: string) => this.httpClient.get<T>(url, {
        headers: {
          Authorization: token,
        },
      })),
      shareReplay(),
    );
  }
}
