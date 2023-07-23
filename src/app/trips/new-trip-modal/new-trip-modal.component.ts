import { Component,EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TripRequest } from '../trip.model';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-new-trip-modal',
  templateUrl: './new-trip-modal.component.html',
  styleUrls: ['./new-trip-modal.component.scss'],
})
export class NewTripModalComponent {
  //@Output() tripAdded = new EventEmitter<boolean>();
  constructor(readonly modalRef: BsModalRef, private tripService: TripService,) {

  }

  createNewTrip(tripData: TripRequest): void {
    console.log(this.tripService.checkTripNameExists(tripData.title));

    this.tripService.checkTripNameExists(tripData.title).subscribe((exists: boolean) => {
      if (exists) {
        alert("Ce voyage existe déjà, veuillez choisir un autre nom");
      } else {
        this.tripService.postTrip(tripData).subscribe({
          next: (trips) =>{
            if (trips){
              //fermez la modale
              this.modalRef.hide();
              // Une fois l'ajout terminé avec succès, émettre un événement indiquant qu'un nouveau voyage a été ajouté
              // this.tripAdded.emit(true);
            }
          }, error: () => {
            alert("Erreur lors de l'ajout du voyage");
          },
        });
      }
    });

    //this.modalRef.hide();
    //placer ici la logique de création add(trip)
    //puis fermer la modal avec la ref modalRef
  }
  //ajouter la logique de validation existant actuellement dans trip-form-component




}
