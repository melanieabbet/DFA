import { Component } from '@angular/core';
import { AuthRequest } from 'src/app/auth/auth-request.model';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { mergeMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { UserRegisterRequest } from '../../users/user-request.model';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
})
export class RegisterPageComponent {
  /**
   * This authentication request object will be updated when the user
   * edits the register form. It will then be sent to the API.
   */
  authRequest: AuthRequest;
  /**
   * If true, it means that the authentication API has return a failed response
   * (probably because the name was already taken).
   */
  registerError: boolean;
  errorMessage = "Une erreur c'est produite lors de la création du compte";
  constructor(private auth: AuthService, private router: Router) {
    this.authRequest = { username: '', password: '' };
    this.registerError = false;
  }
  /**
   * Called when the login form is submitted.
   */
  onSubmit(form: NgForm) {
    // Only do something if the form is valid
    if (form.valid) {
      // Hide any previous login error.
      this.registerError = false;
      // Run fonction to create this new user.
      this.createNewUser();
    }
  }
  /**
   * Called when the form is submitted and valid
   * The Process of creation:
   * 1: Check user name available
   * 2: If available - Create user
   * 3: Login of the new user
   * 4: Once done - Redirect to homepage
   */
  createNewUser() {
    // The API - need a different object to create a user ( value name instead of username) so we create this object
    const userRegistrationRequest: UserRegisterRequest = { name: this.authRequest.username, password: this.authRequest.password };
    //1: Check user name available
    this.auth.checkUserNameExists$(userRegistrationRequest.name).pipe(
      mergeMap((exists: boolean) => {
        if (exists) {
          // Not available: Error
          this.errorMessage = "Cet utilisateur existe déjà, choisi un autre nom";
          return throwError(() => new Error("Cet utilisateur existe déjà"));
        } else {
          // 2: If available - Create user
          return this.auth.createUser$(userRegistrationRequest);
        }
      }),
      mergeMap((user) => {
        if (user) {
          // 3: Login of the new user (with the element used for the creation - no human error possible here (wrong password etc)
          return this.auth.login$(this.authRequest);
        } else {
          // No user: Error
          this.errorMessage = "Une erreur c'est produite lors de la création du compte";
          return throwError(() => new Error("Erreur lors de l'ajout de l'utilisateur"));
        }
      }),
      catchError((err) => {
        this.registerError = true; // If not initialized inside the pipe the default error message will be displayed
        console.warn(`Authentication failed: ${err.message}`);
        return []; // empty array to complete observable
      })
    ).subscribe({
      next: () => {
       // 4: Once done - Redirect to homepage
        this.router.navigateByUrl("/");
      }
    });
  }

  
}
