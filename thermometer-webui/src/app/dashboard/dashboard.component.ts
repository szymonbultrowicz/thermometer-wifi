import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reading } from '../data';
import { DataService } from './../data/data.service';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  lastValue$: Observable<Reading>;
  historicalData$: Observable<Reading[]>;

  constructor(
    private readonly dataService: DataService,
  ) { }

  ngOnInit(): void {
    this.lastValue$ = this.dataService.lastValue$.pipe(
      map(data => data.result),
    );
    this.historicalData$ = this.dataService.historicalData$.pipe(
      map(data => data.result),
    );
  }

}
