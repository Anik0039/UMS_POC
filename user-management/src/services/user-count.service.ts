import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserCountService {
  private userCountSubject = new BehaviorSubject<number>(0);
  public userCount$ = this.userCountSubject.asObservable();

  updateUserCount(count: number): void {
    this.userCountSubject.next(count);
  }

  getCurrentCount(): number {
    return this.userCountSubject.value;
  }
}
