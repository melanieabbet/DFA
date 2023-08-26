import { Observable } from "rxjs";

// Retourne une valeur non null définie
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

//geolocalisation
const hasApi = "geolocation" in navigator;
export const Geolocation = {
  getCurrentPosition(options: PositionOptions = {}): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!hasApi) {
        reject("The Geolocation API is not available on this browser");
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  },
  // watchPosition(options: PositionOptions = {}): Observable<GeolocationPosition> {
  //   return new Observable((subscriber) => {
  //     if (!hasApi) {
  //       subscriber.error("The Geolocation API is not available on this browser");
  //       subscriber.complete();
  //     }
  //     navigator.geolocation.watchPosition(
  //       (position) => subscriber.next(position),
  //       (error) => subscriber.error(error),
  //       options
  //     );
  //   });
  // },
};
