import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Reading } from '../data';
import { DataService, Serie } from './../data/data.service';
import { maxBy, minBy, cloneDeep } from 'lodash-es';
import { NEVER } from 'rxjs';
import { ApexChart, ApexXAxis, ApexTheme, ApexStroke, ApexYAxis, ChartComponent } from 'ng-apexcharts';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  lastValue$: Observable<Reading> = NEVER;
  temperature$: Observable<Serie[]> = NEVER;
  humidity$: Observable<Serie[]> = NEVER;
  battery$: Observable<Serie[]> = NEVER;

  temperatureBorders$: Observable<{min: number, max: number}> = NEVER;

  readonly chartBaseOptions: ApexChart = {
    type: 'line',
    zoom: {
      enabled: false
    },
    background: 'transparent',
    redrawOnParentResize: true,
  };

  readonly temperatureChartOptions: ApexChart = cloneDeep(this.chartBaseOptions);
  readonly humidityChartOptions: ApexChart = cloneDeep(this.chartBaseOptions);
  readonly batteryChartOptions: ApexChart = cloneDeep(this.chartBaseOptions);

  readonly theme: ApexTheme = {
    mode: 'dark',
  };

  readonly xAxisOptions: ApexXAxis = {
    type: 'datetime',
    labels: {
      datetimeUTC: false,
    }
  };

  readonly stroke: ApexStroke = {
    width: 2,
  }

  @ViewChild('temperatureChart', {read: ElementRef})
  temperatureChartEl: ElementRef;

  @ViewChild('humidityChart', {read: ElementRef})
  humidityChartEl: ElementRef;

  @ViewChild('batteryChart', {read: ElementRef})
  batteryChartEl: ElementRef;

  constructor(
    private readonly dataService: DataService,
  ) { }

  ngAfterViewInit(): void {
    this.temperatureChartOptions.height = this.temperatureChartEl.nativeElement.parentNode.offsetHeight;
    this.humidityChartOptions.height = this.humidityChartEl.nativeElement.parentNode.offsetHeight;
    this.batteryChartOptions.height = this.batteryChartEl.nativeElement.parentNode.offsetHeight;
  }

  ngOnInit(): void {
    this.lastValue$ = this.dataService.lastValue$.pipe(
      map(data => data.result),
    );
    this.temperature$ = this.dataService.series$.pipe(
      map(series => [series.temperature]),
      startWith([]),
    );
    this.humidity$ = this.dataService.series$.pipe(
      map(series => [series.humidity]),
      startWith([]),
    );
    this.battery$ = this.dataService.series$.pipe(
      map(series => [series.battery]),
      startWith([]),
    );

    this.temperatureBorders$ = this.temperature$.pipe(
      map(([series]) => ({
        max: this.maxValue(series),
        min: this.minValue(series),
      })),
    );
  }

  private maxValue(serie: Serie): number {
    return Math.ceil(maxBy(serie.data, 'y')?.y as (number | undefined) ?? 0);
  }

  private minValue(serie: Serie): number {
    return Math.floor(minBy(serie.data, 'y')?.y as (number | undefined) ?? 0);
  }
}
