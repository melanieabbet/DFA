import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth.service";
import { map } from "rxjs";

export const authGuard: CanActivateFn = () => {
  // The inject() function can be used to get an @Injectable singleton "manually".
  const authService = inject(AuthService);
  const router = inject(Router);

  return (
    authService
      // Use this to check if the user is authenticated
      .isAuthenticated$()
      // If they're authenticated, return true, otherwise, returns an UrlTree to redirect to the login page
      .pipe(map((auth) => (auth ? true : router.parseUrl("/login"))))
  );
};