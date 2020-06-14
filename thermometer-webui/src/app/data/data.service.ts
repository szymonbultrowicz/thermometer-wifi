import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, switchMap, map } from 'rxjs/operators';
import { TokenService } from './../auth/token.service';
import { HistoricalData, LastValue, Reading } from './models';

const ENDPOINT_BASE = environment.API_URL;

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
    return this.requestWithToken<HistoricalData>(`${ENDPOINT_BASE}/last`);
  }

  get temperatureData$() {
    return this.historicalData$.pipe(
      map(data => this.retrieveSeries(data, 'temperature'))
    );
  }

  get humidityData$() {
    return this.historicalData$.pipe(
      map(data => this.retrieveSeries(data, 'humidity'))
    );
  }

  get batteryData$() {
    return this.historicalData$.pipe(
      map(data => this.retrieveSeries(data, 'battery'))
    );
  }

  private retrieveSeries(data: HistoricalData, series: keyof Reading) {
    return data.result.map(entry => ({
      name: entry.timestamp,
      value: entry[series],
    }));
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
