import { Injectable } from '@angular/core';
import { Place, PlaceRequest } from './place.model';
import { AuthService } from '../auth/auth.service';
import { Observable,map, switchMap, of} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  getCurrentUserPlaces(): Observable<Place[]> {
    return this.authService.getUser$().pipe(
      switchMap((user) => {
        if (user) {
          const userId = user.id;
          return this.http.get<Place[]>(`${environment.apiUrl}/places?user=${userId}`);
        } else {
          // Handle the case where no user is authenticated
          return of([]);
        }
      })
    );
  }
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
