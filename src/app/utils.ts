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
};
