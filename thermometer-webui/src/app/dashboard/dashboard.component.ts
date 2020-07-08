import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Reading } from '../data';
import { DataService } from './../data/data.service';
import { Series } from '@swimlane/ngx-charts';
import { maxBy, minBy } from 'lodash-es';
import { NEVER } from 'rxjs';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  lastValue$: Observable<Reading> = NEVER;
  temperature$: Observable<Series[]> = NEVER;
  humidity$: Observable<Series[]> = NEVER;
  battery$: Observable<Series[]> = NEVER;

  temperatureBorders$: Observable<{min: number, max: number}> = NEVER;

  readonly colors = [{
    name: 'temperature',
    value: '#3cff00',
  }, {
    name: 'humidity',
    value: '#00fff9',
  }, {
    name: 'battery',
    value: '#fff400',
  }];

  constructor(
    private readonly dataService: DataService,
  ) { }

  ngOnInit(): void {
    this.lastValue$ = this.dataService.lastValue$.pipe(
      map(data => data.result),
    );
    this.temperature$ = this.dataService.series$.pipe(
      map(series => [series.temperature]),
    );
    this.humidity$ = this.dataService.series$.pipe(
      map(series => [series.humidity]),
    );
    this.battery$ = this.dataService.series$.pipe(
      map(series => [series.battery]),
    );

    this.temperatureBorders$ = this.temperature$.pipe(
      map(([series]) => ({
        max: this.maxValue(series),
        min: this.minValue(series),
      })),
    );
  }

  private maxValue(series: Series): number {
    return Math.ceil(maxBy(series.series, 'value')?.value as (number | undefined) ?? 0);
  }

  private minValue(series: Series): number {
    return Math.floor(minBy(series.series, 'value')?.value as (number | undefined) ?? 0);
  }
}
