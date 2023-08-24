import { Component,Input, platformCore } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PlaceRequest, Place } from '../place.model';
import { PlaceService } from '../place.service';
import { MapService } from '../map/map.service';

@Component({
  selector: 'app-new-place-modal',
  templateUrl: './new-place-modal.component.html',
  styleUrls: ['./new-place-modal.component.scss']
})
export class NewPlaceModalComponent {
  @Input() tripId!: string;
  constructor(readonly modalRef: BsModalRef, private placeService: PlaceService, private mapService:MapService) {
  }

  // Method to create a new place
  createNewPlace(placeData: PlaceRequest): void {
    placeData.tripId = this.tripId;
    console.log(this.placeService.checkPlaceNameExists(placeData.name));
    // Check if the place name already exists
    this.placeService.checkPlaceNameExists(placeData.name).subscribe((exists:boolean) => {
      if (exists) {
        alert("Ce lieu existe déjà, veuillez choisir un autre nom");
      } else {
        this.placeService.postPlace(placeData).subscribe({
          next: (newPlace: Place) => {
            if(newPlace){
            // Hide the modal and add the new place to the map
            this.modalRef.hide();
            this.mapService.addPlace(newPlace);
            }
          }, error: () => {
            alert("Erreur lors de l'ajout du lieu");
          },
        });
      }
    });

  }

}
