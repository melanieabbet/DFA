import { Component,EventEmitter, Output, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Trip, TripRequest } from '../trip.model';
import { TripService } from '../trip.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-edit-trip-modal',
  templateUrl: './edit-trip-modal.component.html',
  styleUrls: ['./edit-trip-modal.component.scss'],
})
export class EditTripModalComponent {
  @Input() tripData!: Trip;
  @Input() tripId!: string;
  originalTitle = ""; // save old title to check if updated
  editTripError: boolean;
  errorMessage = "Une erreur s'est produite lors de la modification du voyage";
  @Output() tripModified = new EventEmitter<boolean>();
  constructor(readonly modalRef: BsModalRef, private tripService: TripService,) {
    this.editTripError = false;
  }
  ngOnInit(): void {
    if (this.tripData) {
      console.log("Trip Modal: "+this.tripData);
      this.originalTitle = this.tripData.title;
    }
  }


  editNewTrip(tripData: TripRequest): void {
    // If title change check title disposability
    if (this.originalTitle !== tripData.title) {
      this.tripService.checkTripNameExists$(tripData.title).subscribe((exists: boolean) => {
        if (exists) {
          this.errorMessage = "Ce nom de voyage existe déjà, choisis un autre nom";
          this.editTripError = true;
        } else {
          this.emitModifiedTrip(tripData);
        }
      });
    } else {
      this.emitModifiedTrip(tripData);
    }
  }

  emitModifiedTrip(tripData: TripRequest): void {
    console.log(this.tripId);
    this.tripService.updateTrip$(this.tripId, tripData).subscribe({
      next: (trips) => {
        if (trips) {
          // Close modal
          this.modalRef.hide();
          // Emit that the trip was edited for update in TripPage
          this.tripModified.emit(true);
        }
      },
      error: (err) => {
        // Initialize Error message (http response) and display to user
        if(err instanceof HttpErrorResponse && err.status === 401){
          const errorCode = err.error.code; // Error code send from the API
          switch (errorCode) {
            case 'authHeaderMissing':
              // 401 Unauthorized - This resource requires authentication
              this.errorMessage = "Seuls les utilisateur connectés peuvent créer des voyages";
              break;
            case 'authHeaderMalformed':
              // 401 authHeaderMalformed - Your Authorization header is not in the correct format.
              this.errorMessage = "Problème d'authentification - reconnexion nécessaire";
              break;
            case 'authTokenExpired':
              // 401 authTokenExpired -  The token you sent in the Authorization header was valid but has expired
              this.errorMessage = "Session expirée - reconnexion nécessaire";
              break;
            default:
              // default
              this.errorMessage = "Une erreur s'est produite lors de l'ajout du voyage.";
          }
        }else if (err instanceof HttpErrorResponse && err.status === 422){
          // 422 (invalid) Unprocessable Entity - The request contains semantically invalid properties.
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = "Une erreur s'est produite lors de l'ajout du voyage.";
          }
        }else if(err instanceof HttpErrorResponse && err.status === 403){
         // 403 Forbidden - You are not authorized to perform this action.
         this.errorMessage = "Vous n'avez pas les permissions requises pour éditer ce voyage";
        } else {
          // default
          this.errorMessage = "Une erreur s'est produite lors de l'ajout du voyage.";
        }
        this.editTripError = true;
        console.warn(`Add new trip failed: ${err.message}`);
      },
    });
  }
}
