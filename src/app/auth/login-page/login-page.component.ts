import { Component } from "@angular/core";
import { AuthRequest } from "src/app/auth/auth-request.model";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";
import { NgForm } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-login-page",
  templateUrl: "./login-page.component.html",
  styleUrls: ["./login-page.component.scss"],
})
export class LoginPageComponent {
  /**
   * This authentication request object will be updated when the user
   * edits the login form. It will then be sent to the API.
   */
  authRequest: AuthRequest;
  /**
   * If true, it means that the authentication API has return a failed response
   * (probably because the name or password is incorrect).
   * Display an error message : here default - initialized depending on the error
   */
  loginError: boolean;
  errorMessage = "Une erreur s'est produite lors de l'authentification";

  constructor(private auth: AuthService, private router: Router) {
    //this.authRequest = new AuthRequest();
    this.authRequest = {username:"",password:""};
    this.loginError = false;
  }

  /**
   * Called when the login form is submitted.
   */
  onSubmit(form: NgForm) {
    // Only do something if the form is valid
    if (form.valid) {
      // Hide any previous login error.
      this.loginError = false;
      // Perform the authentication request to the API.
      this.auth.login$(this.authRequest).subscribe({
        next: () => this.router.navigateByUrl("/"),
        error: (err) => {
          // Initialize Error message and display to user
          if(err instanceof HttpErrorResponse && err.status === 401){
            const errorCode = err.error.code; // Error code send from the API
            switch (errorCode) {
              case 'authCredentialsMissing':
                // 401 Unauthorized - You have not sent the username or the password.
                this.errorMessage = "Identifiant ou mot de passe manquant.";
                break;
              case 'authCredentialsUnknown':
                // 401 Unauthorized - No user exists with the specified username.
                this.errorMessage = "Cet utilisateur n'existe pas";
                break;
              case 'authCredentialsInvalid':
                // 401 Unauthorized - The password is incorrect.
                this.errorMessage = "Mot de passe incorrect.";
                break;
              default:
                // default
                this.errorMessage = "Une erreur s'est produite lors de l'authentification.";
            }
          }else{
            // default
            this.errorMessage = "Une erreur s'est produite lors de l'authentification.";
          }
          this.loginError = true;
          console.warn(`Authentication failed: ${err.message}`);
        },
      });
    }
  }
}