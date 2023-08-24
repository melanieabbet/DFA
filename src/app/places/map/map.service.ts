import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Place } from '../place.model';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private selectedPlaceId = new BehaviorSubject<string | null>(null); // connection with accordion item
  // Observable to listen for new places
  private placeAddedSource = new Subject<Place>();
  placeAdded$ = this.placeAddedSource.asObservable();
  // Observable to listen for deleted places
  private placeDeletedSource = new Subject<string>();
  placeDeleted$ = this.placeDeletedSource.asObservable();
  // Observable to listen for updates to a specific place's details
  private placeUpdatedSource = new Subject<Place>();
  placeUpdated$ = this.placeUpdatedSource.asObservable();

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
  /**
   * manage changes
   * added places
   * deleted places
   * update places
   */
  addPlace(place: Place) {
    this.placeAddedSource.next(place);
  }
  deletePlace(placeId: string) {
    this.placeDeletedSource.next(placeId);
  }
  updatePlaceDetails(updatedPlace: Place) {
    this.placeUpdatedSource.next(updatedPlace);
  } 

}
