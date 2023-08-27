import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, of, switchMap} from "rxjs";
import { User } from "./user.model";
import { AuthService } from '../auth/auth.service';

// Import environment.ts
import { environment } from "src/environments/environment";



@Injectable({
  providedIn: "root",
})
export class UserApiService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    ) {}

  loadAllUsers$(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }
  getUserName$(userId: string): Observable<string> {
    return this.http.get<User>(`${environment.apiUrl}/users/${userId}`).pipe(
      map(user => user.name)
    );
  }
}