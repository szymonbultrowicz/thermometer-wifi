import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Reading } from '../data';
import { DataService, DataPoint } from './../data/data.service';
import { NEVER } from 'rxjs';
import * as Highcharts from 'highcharts';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  lastValue$: Observable<Reading> = NEVER;

  onDestroy$ = new Subject<never>();

  loading = true;

  // temperatureBorders$: Observable<{min: number, max: number}> = NEVER;

  Highcharts: typeof Highcharts = Highcharts;

  private baseChartOptions: Highcharts.Options = {
    chart: {
      height: null,
      width: null,
      style: {
        fontFamily: 'Roboto, "Helvetica Neue", sans-serif'
      }
    },
    legend: {
      enabled: false,
    },
    xAxis: {
      type: 'datetime',
    },
    plotOptions: {
      spline: {
        marker: {
          enabled: false,
        }
      },
    },
    tooltip: {
      formatter: function() {
        const date = new Date(this.x);
        return `${this.series.name}: <b>${Math.round(this.y * 10) / 10}</b><br />${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
      }
    }
  };

  temperatureChartOptions: Highcharts.Options = {
    ...this.baseChartOptions,
    title: {
      text: 'Temperatura',
    },
    colors: ['#3cff00'],
  };

  humidityChartOptions: Highcharts.Options = {
    ...this.baseChartOptions,
    title: {
      text: 'Wilgotność',
    },
    colors: ['#00fff9'],
  };

  batteryChartOptions: Highcharts.Options = {
    ...this.baseChartOptions,
    title: {
      text: 'Poziom baterii',
    },
    colors: ['#fff400'],
    yAxis: {
      min: 3900,
    }
  };

  @ViewChild('temperatureChart', { read: ElementRef })
  temperatureChartEl?: ElementRef;
  temperatureChart?: Highcharts.Chart;

  @ViewChild('humidityChart', { read: ElementRef })
  humidityChartEl?: ElementRef;
  humidityChart?: Highcharts.Chart;

  @ViewChild('batteryChart', { read: ElementRef })
  batteryChartEl?: ElementRef;
  batteryChart?: Highcharts.Chart;


  constructor(
    private readonly dataService: DataService,
  ) { }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngAfterViewInit(): void {
    this.reflowCharts();
  }

  ngOnInit(): void {
    this.lastValue$ = this.dataService.lastValue$.pipe(
      map(data => data.result),
    );

    this.dataService.series$.pipe(
      map(series => series.temperature),
      takeUntil(this.onDestroy$),
    ).subscribe(serie => {
      this.updateData(this.temperatureChart, serie, 'Temperatura');
    });

    this.dataService.series$.pipe(
      map(series => series.humidity),
      takeUntil(this.onDestroy$),
    ).subscribe(serie => {
      this.updateData(this.humidityChart, serie, 'Wilgotność');
    });

    this.dataService.series$.pipe(
      map(series => series.battery),
      takeUntil(this.onDestroy$),
    ).subscribe(serie => {
      this.updateData(this.batteryChart, serie, 'Poziom baterii');
    });

    this.handleLoadingState();
  }

  handleLoadingState() {
    this.dataService.refreshAction$.pipe(
      takeUntil(this.onDestroy$),
    ).subscribe(() => {
      this.loading = true;
    });

    this.dataService.series$.pipe(
      takeUntil(this.onDestroy$),
    ).subscribe(() => {
      this.loading = false;
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    this.reflowCharts();
}

  setTemperatureChartInstance(chart: Highcharts.Chart) {
    this.temperatureChart = chart;
    this.reflowCharts();
  }

  setHumidityChartInstance(chart: Highcharts.Chart) {
    this.humidityChart = chart;
    this.reflowCharts();
  }

  setBatteryChartInstance(chart: Highcharts.Chart) {
    this.batteryChart = chart;
    this.reflowCharts();
  }

  private reflowCharts() {
    this.reflowChart(this.temperatureChart, this.temperatureChartEl);
    this.reflowChart(this.humidityChart, this.humidityChartEl);
    this.reflowChart(this.batteryChart, this.batteryChartEl);
  }

  private reflowChart(chart?: Highcharts.Chart, el?: ElementRef) {
    if (chart && el) {
      chart.setSize(el.nativeElement.offsetWidth, el.nativeElement.offsetHeight);
    }
  }

  private updateData(chart: Highcharts.Chart | undefined, data: DataPoint[], label: string) {
    if (!chart) {
      return;
    }
    const newDataPoints = data.map(v => [v.timestamp, v.value]);
    if (chart.series.length > 0) {
      chart.series[0].setData(newDataPoints);
    } else {
      chart.addSeries({
        name: label,
        type: 'spline',
        data: newDataPoints,
      });
    }
    
  }
}
