import { Component, Input } from '@angular/core';
import { TripService } from '../trip.service';
import { Trip } from '../trip.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Place} from 'src/app/places/place.model';
import { PlaceService } from 'src/app/places/place.service';
import { AuthService } from 'src/app/auth/auth.service';
import { filter, first, forkJoin } from 'rxjs';
import { isDefined } from 'src/app/utils';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { EditTripModalComponent } from '../edit-trip-modal/edit-trip-modal.component';
import { NewPlaceModalComponent } from 'src/app/places/new-place-modal/new-place-modal.component';

@Component({
  selector: 'app-trip-page',
  templateUrl: './trip-page.component.html',
  styleUrls: ['./trip-page.component.scss'],
  providers: [DatePipe],
})
export class TripPageComponent {
  tripId?: string;
  places?: Place[];
  tripOwnedByUser = false;
  @Input({ required: true }) trip?: Trip;
  formModal: any;
  oneAtATime = true;

  constructor(
    private route: ActivatedRoute,
    private tripService: TripService,
    private placeService: PlaceService,
    private auth: AuthService,
    private datePipe: DatePipe,
    private router: Router,
    private bsModalService: BsModalService
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      if (!params.has('id')) {
        throw TypeError('Trip ID does not exist');
      }
      this.tripId = params.get('id') as string;

      // Execute if all observable are completed
      forkJoin([
        this.tripService.getTrip$(this.tripId),
        this.placeService.getThisTripPlaces$(this.tripId),
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

  showEditModal(): void {
      if (isDefined(this.trip)) {
        this.formModal = this.bsModalService.show(EditTripModalComponent, {
          initialState: {tripData: this.trip , tripId: this.tripId },
        });
        if (this.formModal) {
          this.formModal.onHidden.subscribe(() => {
            this.loadTrip();
          });
        }
      }
  }
  delete(): void {
    if (isDefined(this.tripId)) {
      this.tripService.deleteTrip(this.tripId).subscribe({
        next: (deletedTrip: Trip) => {
          //Deleted with success now do the necessary action
          console.log('Le voyage a été supprimé :', deletedTrip);
          // Redirect user to home page
          this.router.navigate(['/home']);
        }, error: () => { alert('Une erreur s\'est produite lors de la suppression du voyage :');}
      }
      );
    }
  }
  loadTrip(): void{
    if(this.tripId){
      this.tripService.getTrip$(this.tripId).subscribe((trip) => {this.trip = trip;});
    };
  }
  loadPlace(): void{
    if(this.tripId){
      this.placeService.getThisTripPlaces$(this.tripId).subscribe((places)=> {this.places = places;})
    };
  }
  /**
   * Called to open new place modal & form
   */
  showAddPlaceModal(): void {
    this.formModal = this.bsModalService.show(NewPlaceModalComponent, {
      // Create a place within actual trip
      initialState: { tripId: this.tripId },
    });
    if (this.formModal) {
      this.formModal.onHidden.subscribe(() => {
        // refresh the view once place was correctly created (mean when modal is hidden)
        this.loadPlace();
      });
    }
  }
  //Call if delete place is call from PlaceCardComponent in order to update the listed places
  onPlaceDeleted(placeId: string): void {
    // Update place with a filter
    this.places = this.places?.filter(place => place.id !== placeId);
  }
}
