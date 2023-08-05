import { Component } from '@angular/core';
import { AuthRequest } from 'src/app/auth/auth-request.model';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { mergeMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { UserRegisterRequest } from '../user-register-request.model';

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
      this.createNewUser();
    }
  }

  // createNewUser(){
  //   this.auth.checkUserNameExists$(this.authRequest.username).subscribe((exists:boolean) => {
  //     if (exists) {
  //       alert("Cet utilisateur existe déjà, veuillez choisir un autre nom");
  //     } else {
  //       this.auth.createUser$(this.authRequest).subscribe({
  //         next: (user) =>{
  //           if (user){
  //             // User was created then perform the authentication request to the API and redirect to homepage.
  //             this.auth.login$(this.authRequest).subscribe({
  //               next: () => this.router.navigateByUrl("/"),
  //               error: (err) => {
  //                 this.registerError = true;
  //                 console.warn(`Authentication failed: ${err.message}`);
  //               },
  //             });
  //           }
  //         }, error: () => {
  //           alert("Erreur lors de l'ajout l'utilisateur");
  //         },
  //       });
  //     }
  //   });
  // }
  // createNewUser() {
  //   this.auth.checkUserNameExists$(this.authRequest.username).pipe(
  //     filter((exists: boolean) => !exists), //If name free, continue
  //     mergeMap(() => this.auth.createUser$(this.authRequest)),//Create the user
  //     filter((user) => !!user), //User was created then continue
  //     mergeMap(() => this.auth.login$(this.authRequest)), //Login with this new user information
  //     tap(() => this.router.navigateByUrl("/")),//redirect to homepage
  //     // catch the error
  //     catchError((err) => {
  //       this.registerError = true;
  //       console.warn(`Authentication failed: ${err.message}`);
  //       return []; // Return an empty array to complete the Observable gracefully
  //     })
  //   ).subscribe();
  // }

createNewUser() {
  const userRegistrationRequest: UserRegisterRequest = { name: this.authRequest.username, password: this.authRequest.password };
  this.auth.checkUserNameExists$(userRegistrationRequest.name).pipe(
    mergeMap((exists: boolean) => {
      if (exists) {
        // Retourne une erreur personnalisée pour indiquer que le nom d'utilisateur existe déjà
        return throwError(() => new Error("Cet utilisateur existe déjà, veuillez choisir un autre nom"));
      } else {
        // Crée l'utilisateur
        return this.auth.createUser$(userRegistrationRequest);
      }
    }),
    mergeMap((user) => {
      if (user) {
        // Effectue l'authentification et redirige vers la page d'accueil
        return this.auth.login$(this.authRequest);
      } else {
        // En cas d'erreur lors de la création, on génère une erreur personnalisée
        return throwError(() => new Error("Erreur lors de l'ajout de l'utilisateur"));
      }
    }),
    catchError((err) => {
      this.registerError = true;
      console.warn(`Authentication failed: ${err.message}`);
      return []; // Retourne un tableau vide pour compléter gracieusement l'Observable
    })
  ).subscribe({
    next: () => {
      this.router.navigateByUrl("/");
    }
  });
}

  
}
