import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { User } from "./user.model";
// Import environment.ts
import { environment } from "src/environments/environment";



@Injectable({
  providedIn: "root",
})
export class UserApiService {
  constructor(
    private http: HttpClient,
    ) {}

  loadAllUsers$(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }
 
  
}