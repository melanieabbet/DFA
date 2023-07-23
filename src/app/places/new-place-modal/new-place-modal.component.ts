import { Component,Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PlaceRequest } from '../place.model';
import { PlaceService } from '../place.service';


@Component({
  selector: 'app-new-place-modal',
  templateUrl: './new-place-modal.component.html',
  styleUrls: ['./new-place-modal.component.scss']
})
export class NewPlaceModalComponent {
  @Input() tripId!: string;
  constructor(readonly modalRef: BsModalRef, private placeService: PlaceService,) {

  }
  createNewPlace(placeData: PlaceRequest): void {
    placeData.tripId = this.tripId;
    console.log(this.placeService.checkPlaceNameExists(placeData.name));

    this.placeService.checkPlaceNameExists(placeData.name).subscribe((exists:boolean) => {
      if (exists) {
        alert("Ce lieu existe déjà, veuillez choisir un autre nom");
      } else {
        this.placeService.postPlace(placeData).subscribe({
          next: (places) =>{
            if (places){
              this.modalRef.hide();
            }
          }, error: () => {
            alert("Erreur lors de l'ajout du lieu");
          },
        });
      }
    });

  }

}
