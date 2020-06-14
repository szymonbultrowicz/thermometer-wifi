import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, switchMap, map } from 'rxjs/operators';
import { TokenService } from './../auth/token.service';
import { HistoricalData, LastValue, Reading } from './models';
import { Series } from '@swimlane/ngx-charts';

const ENDPOINT_BASE = environment.API_URL;
const DAY_MILLIS = 1000 * 60 * 60 * 24;

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private readonly httpClient: HttpClient,
    private readonly tokenService: TokenService,
  ) { }

  get lastValue$() {
    return this.requestWithToken<LastValue>(`${ENDPOINT_BASE}/last`);
  }

  get historicalData$() {
    return this.requestWithToken<HistoricalData>(`${ENDPOINT_BASE}/history`);
  }

  get series$() {
    return this.historicalData$.pipe(
      map(data => [
        this.retrieveSeries(data, 'temperature'),
        this.retrieveSeries(data, 'humidity'),
        this.retrieveSeries(data, 'battery'),
      ]),
    );
  }

  private retrieveSeries(data: HistoricalData, series: keyof Reading): Series {
    console.log(data.result)
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
    );
  }
}
