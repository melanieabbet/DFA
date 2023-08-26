import { Component, } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TripRequest } from '../trip.model';
import { TripService } from '../trip.service';
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'app-new-trip-modal',
  templateUrl: './new-trip-modal.component.html',
  styleUrls: ['./new-trip-modal.component.scss'],
})
export class NewTripModalComponent {
  addTripError: boolean;
  errorMessage = "Une erreur s'est produite lors de l'ajout du voyage";
  constructor(readonly modalRef: BsModalRef, private tripService: TripService,) {
    this.addTripError = false;
  }
  /**
   * Called when submitted and when TripForm is valid.
   */
  createNewTrip(tripData: TripRequest): void {
    
    this.tripService.checkTripNameExists$(tripData.title).subscribe((exists: boolean) => {
      if (exists) {
        this.errorMessage = "Ce nom de voyage existe déjà, choisis un autre nom";
        this.addTripError = true;
      } else {
        this.tripService.postTrip$(tripData).subscribe({
          next: (trips) =>{
            if (trips){
              //close modal -> this will trigger the TripPAge onHidden event
              this.modalRef.hide();
            }
          }, error: (err) => {
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
            }else{
              // default
              this.errorMessage = "Une erreur s'est produite lors de l'ajout du voyage.";
            }
            this.addTripError = true;
            console.warn(`Add new trip failed: ${err.message}`);
          },
        });
      }
    });

  }
}
