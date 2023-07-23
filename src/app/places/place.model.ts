export type Place = {
    name: string;
    description: string;
    location:{
        type: string,
        coordinates: [number, number],
    }
    tripHref: string;
    tripId: string;
    pictureUrl: string;
  };

export type PlaceRequest = {
    name: string;
    description: string;
    location?:{
        type: string,
        coordinates: [number, number],
    }
    tripId: string;
    pictureUrl?: string;
  };