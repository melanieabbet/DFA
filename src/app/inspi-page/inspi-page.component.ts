import { Component } from '@angular/core';
import { TripService } from '../trips/trip.service';
import { Trip } from '../trips/trip.model';

@Component({
  selector: 'app-inspi-page',
  templateUrl: './inspi-page.component.html',
  styleUrls: ['./inspi-page.component.scss']
})
export class InspiPageComponent {
  trips?: Trip[];
  filteredTrips?: Trip[];

  constructor(private tripService: TripService) {
    this.tripService.getTrips().subscribe(trips => {
      this.trips = trips;
      this.filteredTrips = trips; // Initialize filteredTrips with all trips at the beginning
    });
  }

  filterTrips(event: Event) {
    const keyword = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.trips) {
      this.filteredTrips = this.trips.filter(trip =>
        trip.title.toLowerCase().includes(keyword) ||
        trip.description.toLowerCase().includes(keyword)
      );
    }
  }
}
