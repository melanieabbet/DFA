import { Component,Input, platformCore } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PlaceRequest, Place } from '../place.model';
import { PlaceService } from '../place.service';
import { MapService } from '../map/map.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-new-place-modal',
  templateUrl: './new-place-modal.component.html',
  styleUrls: ['./new-place-modal.component.scss']
})
export class NewPlaceModalComponent {
  @Input() tripId!: string;
  addPlaceError: boolean;
  errorMessage = "Une erreur s'est produite lors de l'ajout du voyage";
  constructor(readonly modalRef: BsModalRef, private placeService: PlaceService, private mapService:MapService) {
    this.addPlaceError = false;
  }

  // Method to create a new place - called when submitted and when PlaceForm is valid
  createNewPlace(placeData: PlaceRequest): void {
    placeData.tripId = this.tripId;
    // Check if the place name already exists
    this.placeService.checkPlaceNameExists$(placeData.name).subscribe((exists:boolean) => {
      if (exists) {
        this.errorMessage = "Ce lieu existe déjà, veuillez choisir un autre nom";
        this.addPlaceError = true;
      } else {
        this.placeService.postPlace$(placeData).subscribe({
          next: (newPlace: Place) => {
            if(newPlace){
            // Hide the modal and add the new place to the map
            this.modalRef.hide();
            this.mapService.addPlace(newPlace);
            }
          }, error: (err) => {
            // Initialize Error message (http response) and display to user
            if(err instanceof HttpErrorResponse && err.status === 401){
              const errorCode = err.error.code; // Error code send from the API
              switch (errorCode) {
                case 'authHeaderMissing':
                  // 401 Unauthorized - This resource requires authentication
                  this.errorMessage = "Seuls les utilisateur connectés peuvent créer des lieux";
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
            this.addPlaceError = true;
            console.warn(`Add new trip failed: ${err.message}`);
          },
        });
      }
    });

  }

}
