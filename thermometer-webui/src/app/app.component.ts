import { Observable } from 'rxjs';
import { TimeframeService } from './data/timeframe.service';
import { Component } from '@angular/core';

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
  ) {
    this.timeframe$ = timeframeService.timeframe$;
  }

  changeTimeframe(newTimeframe: string) {
    this.timeframeService.change(newTimeframe);
  }

}
