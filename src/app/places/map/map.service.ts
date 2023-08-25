import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Place } from '../place.model';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private placeAddedSource = new Subject<Place>();
  placeAdded$ = this.placeAddedSource.asObservable();
  // Observable to listen for deleted places
  private placeDeletedSource = new Subject<string>();
  placeDeleted$ = this.placeDeletedSource.asObservable();
  // Observable to listen for updates to a specific place's details
  private placeUpdatedSource = new Subject<Place>();
  placeUpdated$ = this.placeUpdatedSource.asObservable();
  // Observable to listen for active place
  private placeActivatedSource = new BehaviorSubject<string | null>(null);
  placeActivated$ = this.placeActivatedSource.asObservable();

  
  /**
   * manage changes with observable
   * active place
   * added place
   * deleted place
   * update place
   */
  setActivePlace(id: string | null) {
    this.placeActivatedSource.next(id);
  }
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
