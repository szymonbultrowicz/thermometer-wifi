import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

const DEFAULT_TIMEFRAME = '1d';

@Injectable({
  providedIn: 'root'
})
export class TimeframeService {

  private _timeframe$ = new BehaviorSubject(DEFAULT_TIMEFRAME);

  get timeframe$() {
    return this._timeframe$.asObservable();
  }

  change(value: string) {
    this._timeframe$.next(value);
  }

}
