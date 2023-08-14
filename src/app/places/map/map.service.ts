import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private selectedPlaceId = new BehaviorSubject<string | null>(null);
   /**
   * Make the link between map and accordion item
   * (set the clicked item and return an observable)
   */
  setSelectedPlaceId(id: string): void {
    this.selectedPlaceId.next(id);
  }
  getSelectedPlaceId(): Observable<string | null> {
    return this.selectedPlaceId.asObservable();
  }
  

}
