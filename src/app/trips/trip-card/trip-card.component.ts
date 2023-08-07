import { Component, Input, OnInit } from '@angular/core';
import { Trip } from '../trip.model';
import { PlaceService } from 'src/app/places/place.service';
import { Place } from 'src/app/places/place.service';

@Component({
  selector: 'app-trip-card',
  templateUrl: './trip-card.component.html',
  styleUrls: ['./trip-card.component.scss']
})
export class TripCardComponent implements OnInit {
  @Input({required:true}) trip!: Trip; // Either all trips (inpsiration page) or current user trips (Mon espace)
  tripImage: string | undefined;

  constructor (private readonly placeservice : PlaceService) {}

  ngOnInit() {
    // Call the service to retrieve places associated with the trip (by its ID) 
    this.placeservice.getThisTripPlaces(this.trip.id).subscribe((places: Place[]) => {
      // Use the default image if no image found later
      this.tripImage = 'https://media.istockphoto.com/id/1371796051/fr/vectoriel/fus%C3%A9e-ic%C3%B4ne-avec-une-ombre-longue-sur-fond-vide-flat-design.jpg?s=612x612&w=0&k=20&c=7zpv79eehuXa6ebU6B7bppSTmEjaE1fEJNY3umbPVuM=';
      // Loop through the places to find a valid image
      for (const place of places) {
        if (place.pictureUrl) {
          // Use the image of the place if it has one
          this.tripImage = place.pictureUrl;
          return; // Exit the loop as a valid image has been found
        }
      }
    });
  }
}

