import { Component, Input } from '@angular/core';
import { TripService } from '../trip.service';
import { Trip } from '../trip.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Place } from 'src/app/places/place.model';
import { PlaceService } from 'src/app/places/place.service';
import { AuthService } from 'src/app/auth/auth.service';
import { filter, first, forkJoin } from 'rxjs';
import { isDefined } from 'src/app/utils';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-trip-page',
  templateUrl: './trip-page.component.html',
  styleUrls: ['./trip-page.component.scss'],
  providers: [DatePipe]
})
export class TripPageComponent {
  tripId?: string;
  places?: Place[];
  tripOwnedByUser = false;
  @Input({ required: true }) trip?: Trip;

  constructor(
    private route: ActivatedRoute,
    private tripService: TripService,
    private placeService: PlaceService,
    private auth: AuthService,
    private datePipe: DatePipe
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      if (!params.has('id')) {
        throw TypeError('Trip ID does not exist');
      }
      this.tripId = params.get('id') as string;
      // this.tripService.getTrip(this.tripId).subscribe((trip) => {
      //   this.trip = trip;
      // });
      // this.placeService
      //   .getThisTripPlaces(this.tripId)
      //   .subscribe((places) => (this.places = places));
      // this.auth
      //   .getUser$()
      //   .pipe(
      //     filter((user) => user !== undefined),
      //     first()
      //   )
      //   .subscribe((user) => {});

      // Execute if all observable are completed
      forkJoin([
        this.tripService.getTrip(this.tripId),
        this.placeService.getThisTripPlaces(this.tripId),
        // Tricks to complete an observable that normally never end
        this.auth.getUser$().pipe(
          // Say to typescript that user is define
          filter(isDefined),
          first()
        ),
      ]).subscribe(([trip, places, user]) => {
        this.trip = trip;
        this.places = places;
        this.tripOwnedByUser = user.id === trip.userId;
      });

    });
  }
  formatDate(date: string): string {
    const dateObj = new Date(date);
    return this.datePipe.transform(dateObj, 'yyyy-MM-dd') || '';
  }
}

