import { Injectable } from '@angular/core';
import { Trip, TripRequest } from './trip.model';
import { AuthService } from '../auth/auth.service';
import { Observable, map, of, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }


  getTrips$():  Observable<Trip[]>{
    return this.http.get<Trip[]>(`${environment.apiUrl}/trips`);
  }

  getCurrentUserTrips$(): Observable<Trip[]> {
    return this.authService.getUser$().pipe(
      switchMap((user) => {
        if (user) {
          const userId = user.id;
          return this.http.get<Trip[]>(`${environment.apiUrl}/trips?user=${userId}`);
        } else {
          // Handle the case where no user is authenticated
          return of([]);
        }
      })
    );
  }

  getTrip$(id: string): Observable<Trip> {
    return this.http.get<Trip>(`${environment.apiUrl}/trips/${id}`);
  }

  postTrip$(newTrip: TripRequest): Observable<Trip[]> {
    return this.http.post<Trip[]>(`${environment.apiUrl}/trips`,newTrip);
  }

  checkTripNameExists$(tripTitle: string): Observable<boolean> {
    return this.http.get<Trip[]>(`${environment.apiUrl}/trips?title=${tripTitle}`).pipe(
      map((trips: Trip[]) => trips.length > 0)
    );
  }

  deleteTrip(id: string) {
    return this.http.delete<Trip>(`${environment.apiUrl}/trips/${id}`);
  }

  updateTrip$(id:string, updatedTrip: TripRequest): Observable<Trip[]> {
    return this.http.patch<Trip[]>(`${environment.apiUrl}/trips/${id}`,updatedTrip);
  }

}

export { Trip };
