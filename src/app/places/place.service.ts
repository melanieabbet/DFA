import { Injectable } from '@angular/core';
import { Place, PlaceRequest } from './place.model';
import { Observable,map} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  constructor(
    private http: HttpClient,
  ) { }

  getThisTripPlaces(tripId: string):  Observable<Place[]>{
    return this.http.get<Place[]>(`${environment.apiUrl}/places?trip=${tripId}`);
  }
  postPlace(newPlace: PlaceRequest): Observable<PlaceRequest[]> {
    return this.http.post<Place[]>(`${environment.apiUrl}/places`,newPlace);
  }
  checkPlaceNameExists(placeName: string): Observable<boolean> {
    return this.http.get<Place[]>(`${environment.apiUrl}/places?name=${placeName}`).pipe(
      map((places: Place[]) => places.length > 0)
    );
  }

}
