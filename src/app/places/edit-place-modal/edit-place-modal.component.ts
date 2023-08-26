import { Component,EventEmitter, Output, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Place, PlaceRequest } from '../place.model';
import { PlaceService } from '../place.service';
import { MapService } from '../map/map.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-edit-place-modal',
  templateUrl: './edit-place-modal.component.html',
  styleUrls: ['./edit-place-modal.component.scss']
})
export class EditPlaceModalComponent implements OnInit{
  @Input() placeData!: Place;
  originalName = ""; // save for comparison
  placeId ="";
  @Output() placeModified = new EventEmitter<boolean>();
  editPlaceError: boolean;
  errorMessage = "Une erreur s'est produite lors de la modification du lieu";
  constructor(readonly modalRef: BsModalRef, private placeService: PlaceService, private mapService:MapService) {
    this.editPlaceError = false;
  }
  ngOnInit(): void {
    if (this.placeData) {
      console.log("Modal: "+this.placeData);
      this.originalName = this.placeData.name;
      this.placeId = this.placeData.id;
    }
  }


  editPlace(placeData: PlaceRequest): void {
    // Check if place name change
    if (this.originalName !== placeData.name) {
      this.placeService.checkPlaceNameExists$(placeData.name).subscribe((exists: boolean) => {
        if (exists) {
          this.errorMessage = "Ce lieu existe déjà, veuillez choisir un autre nom";
          this.editPlaceError = true;
        } else {
          this.emitModifiedPlace(placeData);
        }
      });
    } else {
      this.emitModifiedPlace(placeData);
    }
  }

  emitModifiedPlace(placeData: PlaceRequest): void {

    this.placeService.updatePlace$(this.placeId, placeData).subscribe({
      next: (newPlace: Place) => {
        if (newPlace) {
          // Close modal
          this.modalRef.hide();
          // Emit that a place has change to update Place liste
          this.placeModified.emit(true);
          this.mapService.updatePlaceDetails(newPlace);
        }
      },
      error: (err) => {
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
              this.errorMessage = "Une erreur s'est produite lors de la modification du lieu.";
          }
        }else if (err instanceof HttpErrorResponse && err.status === 422){
          // 422 (invalid) Unprocessable Entity - The request contains semantically invalid properties.
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = "Une erreur s'est produite lors de la modification du lieu.";
          }
        }else if(err instanceof HttpErrorResponse && err.status === 403){
          // 403 Forbidden - You are not authorized to perform this action.
         this.errorMessage = "Vous n'avez pas les permissions requises pour éditer ce lieu";
        }
        this.editPlaceError = true;
        console.warn(`Add new trip failed: ${err.message}`);
      },
    });
  }

}
