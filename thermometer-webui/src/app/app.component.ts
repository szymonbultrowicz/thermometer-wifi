import { DataService } from './data/data.service';
import { Observable } from 'rxjs';
import { TimeframeService } from './data/timeframe.service';
import { Component } from '@angular/core';
import { _MAT_HINT } from '@angular/material/form-field';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly title = 'thermometer-webui';
  readonly timeframe$: Observable<string>;

  constructor(
    private readonly timeframeService: TimeframeService,
    private readonly dataService: DataService,
  ) {
    this.timeframe$ = timeframeService.timeframe$;
  }

  changeTimeframe(newTimeframe: string) {
    this.timeframeService.change(newTimeframe);
  }

  refresh() {
    this.dataService.refresh();
  }

}
