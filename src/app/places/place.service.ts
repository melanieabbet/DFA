import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { Observable} from 'rxjs';
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

}
