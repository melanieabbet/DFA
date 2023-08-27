import { Component, Input } from '@angular/core';
import { TripService } from '../trip.service';
import { UserApiService } from 'src/app/users/user.service';
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
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-trip-page',
  templateUrl: './trip-page.component.html',
  styleUrls: ['./trip-page.component.scss'],
  providers: [DatePipe],
})
export class TripPageComponent {
  tripId?: string;
  places?: Place[];
  userName ="";
  tripOwnedByUser = false;
  @Input({ required: true }) trip?: Trip;
  formModal: any;
  oneAtATime = true;
  deleteTripError = false;
  errorMessage = "Une erreur s'est produite lors de la tentative de suppression du voyage";
  tripExist=true;
  constructor(
    private route: ActivatedRoute,
    private tripService: TripService,
    private placeService: PlaceService,
    private userApiService : UserApiService,
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
       
      ]).subscribe({
        next: ([trip, places, user]) =>{
          this.trip = trip;
          this.places = places;
          this.tripOwnedByUser = user.id === trip.userId;
          // Get the userName using the retrieved trip's userId
          this.userApiService.getUserName$(trip.userId).subscribe((userName) => {this.userName = userName;});
        }, error: (err) =>{
          if(err instanceof HttpErrorResponse && err.status === 404){
            this.tripExist =false;
          }
          console.warn(`Charge trippage failed: ${err.message}`);
        }
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
          // Redirect user to home page
          this.router.navigate(['/home']);
        }, error: (err) => {
           // Initialize Error message (http response) and display to user
           if(err instanceof HttpErrorResponse && err.status === 401){
            const errorCode = err.error.code; // Error code send from the API
            switch (errorCode) {
              case 'authHeaderMissing':
                // 401 Unauthorized - This resource requires authentication
                this.errorMessage = "Seuls les utilisateur connectés peuvent supprimer des voyages";
                break;
              case 'authHeaderMalformed':
                // 401 authHeaderMalformed - Your Authorization header is not in the correct format.
                this.errorMessage = "Problème d'authentification - reconnexion nécessaire";
                break;
              case 'authTokenExpired':
                // 401 authTokenExpired -  The token you sent in the Authorization header was valid but has expired
                this.errorMessage = "Session expirée - reconnexion nécessaire";
                break;
              case 'authTokenInvalid':
                //401 Unauthorized - The token you sent in the Authorization header is invalid
                this.errorMessage = "Problème d'authentification - reconnexion nécessaire";
                break;
              default:
                // default
                this.errorMessage = "Une erreur s'est produite lors de la tentative de suppression du voyage du voyage.";
            }
          }else if (err instanceof HttpErrorResponse && err.status === 403){
            // 403 forbidden
            this.errorMessage = "Vous ne possédez pas les droits de suppression sur ce voyage";
          }else{
            // default
            this.errorMessage = "Une erreur s'est produite lors de la tentative de suppression";
          }
          this.deleteTripError = true;
          console.warn(`Delete trip failed: ${err.message}`);
          }
      }
      );
    }
  }
  //User confirmation to delete
  confirmDelete(): void {
    const result = confirm('Êtes-vous sûr de vouloir supprimer ce voyage ? Tous les lieux affiliés au voyage seront supprimé également.');
    if (result) {
      this.delete();
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
