export type Place = {
    name: string;
    description: string;
    location:{
        type: string,
        coordinates: [number, number],
    }
    tripHref: string;
    tripId: string;
    pictureUrl: String;
  };