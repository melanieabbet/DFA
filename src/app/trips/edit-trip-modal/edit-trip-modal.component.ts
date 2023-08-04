import { Component,EventEmitter, Output, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Trip, TripRequest } from '../trip.model';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-edit-trip-modal',
  templateUrl: './edit-trip-modal.component.html',
  styleUrls: ['./edit-trip-modal.component.scss'],
})
export class EditTripModalComponent {
  @Input() tripData!: Trip;
  @Input() tripId!: string;
  originalTitle = "";
  @Output() tripModified = new EventEmitter<boolean>();
  constructor(readonly modalRef: BsModalRef, private tripService: TripService,) {

  }
  ngOnInit(): void {
    if (this.tripData) {
      console.log("Trip Modal: "+this.tripData);
      this.originalTitle = this.tripData.title;
    }
  }


  editNewTrip(tripData: TripRequest): void {
    // Vérifier si le titre a été modifié
    if (this.originalTitle !== tripData.title) {
      this.tripService.checkTripNameExists(tripData.title).subscribe((exists: boolean) => {
        if (exists) {
          alert("Ce nom de voyage est déjà utilisé");
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
    this.tripService.updateTrip(this.tripId, tripData).subscribe({
      next: (trips) => {
        if (trips) {
          // Fermer la modale
          this.modalRef.hide();
          // Émettre un événement indiquant qu'un voyage a été modifié
          this.tripModified.emit(true);
        }
      },
      error: () => {
        alert("Erreur lors de la modification du voyage");
      },
    });
  }
}
