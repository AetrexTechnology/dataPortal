import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedServiceService {

  constructor() { }
  private sub = new Subject();
  subj$ = this.sub.asObservable();

  send(value: boolean) {
    this.sub.next(value);
  }
}
