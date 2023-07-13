import { Injectable, Injector, inject } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { switchMap, first } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class ApiTokenInterceptorService implements HttpInterceptor {
  #auth?: AuthService;

  // Inject the AuthService only when we need to acccess it.
  // Otherwise there would be a circular dependency:
  //  AuthInterceptorProvider -> AuthService -> HttpClient -> AuthInterceptorProvider.
  get auth(): AuthService {
    if (this.#auth === undefined) {
      this.#auth = inject(AuthService);
    }
    return this.#auth;
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Get the auth token, if any
    return this.auth.getToken$().pipe(
      // getToken$ is an Observable that never completes.
      // But an Angular Interceptor must provide an Observable that completes,
      // otherwise the request handling hangs indefinitely.
      // The first() operator creates an Observable that emit the first value
      // emitted by its source observable (here getToken$()), then completes.
      first(),
      switchMap((token) => {
        // If the token exists and the header does not...
        if (token !== undefined && !req.headers.has("Authorization")) {
          // Clone the actual request and add the required header
          req = req.clone({
            headers: req.headers.set("Authorization", `Bearer ${token}`),
          });
        }
        // Process this updated request
        return next.handle(req);
      })
    );
  }
}