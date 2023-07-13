import { Component } from '@angular/core';
import { TripService } from '../trips/trip.service';
import { Trip } from '../trips/trip.model';

@Component({
  selector: 'app-inspi-page',
  templateUrl: './inspi-page.component.html',
  styleUrls: ['./inspi-page.component.scss']
})
export class InspiPageComponent {
 trips?:Trip[];
 constructor(private tripService: TripService){
  this.tripService.getTrips().subscribe(trips => this.trips = trips)
 };
}
