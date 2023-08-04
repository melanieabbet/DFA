import { Trip } from "../trips/trip.model";

export type Place = {
    id: string;
    href:string;
    name: string;
    description: string;
    location:{
        type: string,
        coordinates: [number, number],
    }
    tripHref: string;
    tripId: string;
    pictureUrl?: string;
    createdAt:string;
    updateAt:string;
    trip?: Trip;
  };

export type PlaceRequest = {
    name: string;
    description: string;
    location:{
        type: string,
        coordinates: [number, number],
    }
    tripId: string;
    pictureUrl?: string;
  };