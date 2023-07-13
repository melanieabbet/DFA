import { Component, Input } from '@angular/core';
import { Trip } from '../trip.model';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-trip-card',
  templateUrl: './trip-card.component.html',
  styleUrls: ['./trip-card.component.scss']
})
export class TripCardComponent {
  @Input({required:true}) trip!: Trip;
  constructor (private readonly tripsService: TripService){
    //this.trips = this.tripsService.GetCurrentUserTrips();
  }
}
