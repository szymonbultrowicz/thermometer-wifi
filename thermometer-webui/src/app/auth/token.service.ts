import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  readonly token$: Observable<undefined | string>;

  constructor(
    route: ActivatedRoute,
  ) {
    this.token$ = route.queryParams.pipe(
      map(queryParams => queryParams.token),
      startWith(route.snapshot.queryParams),
      shareReplay(1),
    );
  }
}
