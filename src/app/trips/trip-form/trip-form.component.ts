import { Component, OnInit} from '@angular/core';
import { TripService } from '../trip.service';
import { Trip, TripRequest } from '../trip.model';
import { NgForm } from "@angular/forms";
declare var bootstrap: any; // Ajoutez cette ligne


@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss']
})
export class TripFormComponent implements OnInit {
  trips?: Trip[];
  newTrip: TripRequest = {
    title: '',
    description: ''
  };
  formError: boolean;
  formSubmitted: boolean;
  errorMessage: string;
  formModal: any;

  constructor(private tripService: TripService) {
    this.formError = false;
    this.formSubmitted = false;
    this.errorMessage = '';
  }
  ngOnInit(){
    this.formModal = new bootstrap.Modal( 
    document.getElementById('myModal')
    );
  }

  onSubmit(form: NgForm) {
    // Mark the form as submitted
    this.formSubmitted = true;
    this.errorMessage = '';
    // Check if the form is valid
    if (form.valid) {
      this.formError = false;
      this.tripService.checkTripNameExists(this.newTrip.title).subscribe(
        exists => {
          if (exists) {
            this.errorMessage = 'Ce nom de voyage existe déjà.';
          } else {
            this.addTrip();
          }
        },
        error => {
          this.errorMessage = 'Erreur lors de la vérification du nom du voyage.';
        }
      );
    } else {
      this.formError = true;
    }
  }

  addTrip() {
    this.tripService.postTrip(this.newTrip).subscribe(
      trips => {
        this.resetForm(); // Reset the form
        this.formModal.hide();
      },
      error => {
        this.errorMessage = 'Erreur lors de l\'ajout du voyage.';
      }
    );

  }
  resetForm(){
    this.newTrip = {
      title: '',
      description: ''
    };
  }
  closeForm() {
    this.formModal.hide();
  }
}
