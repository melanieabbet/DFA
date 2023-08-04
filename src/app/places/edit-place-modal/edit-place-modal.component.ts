import { Component,EventEmitter, Output, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Place, PlaceRequest } from '../place.model';
import { PlaceService } from '../place.service';

@Component({
  selector: 'app-edit-place-modal',
  templateUrl: './edit-place-modal.component.html',
  styleUrls: ['./edit-place-modal.component.scss']
})
export class EditPlaceModalComponent implements OnInit{
  @Input() placeData!: Place;
  originalName = "";
  placeId ="";
  @Output() placeModified = new EventEmitter<boolean>();
  constructor(readonly modalRef: BsModalRef, private placeService: PlaceService,) {

  }
  ngOnInit(): void {
    if (this.placeData) {
      console.log("Modal: "+this.placeData);
      this.originalName = this.placeData.name;
      this.placeId = this.placeData.id;
    }
  }


  editPlace(placeData: PlaceRequest): void {
    // Vérifier si le nom a été modifié
    if (this.originalName !== placeData.name) {
      this.placeService.checkPlaceNameExists(placeData.name).subscribe((exists: boolean) => {
        if (exists) {
          alert("Ce nom de lieu est déjà utilisé");
        } else {
          this.emitModifiedPlace(placeData);
        }
      });
    } else {
      this.emitModifiedPlace(placeData);
    }
  }
  emitModifiedPlace(placeData: PlaceRequest): void {

    this.placeService.updatePlace(this.placeId, placeData).subscribe({
      next: (places) => {
        if (places) {
          // Fermer la modale
          this.modalRef.hide();
          // Émettre un événement indiquant qu'un lieu a été modifié
          this.placeModified.emit(true);
        }
      },
      error: () => {
        alert("Erreur lors de la modification du lieu");
      },
    });
  }

}
