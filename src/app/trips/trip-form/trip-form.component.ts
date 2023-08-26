import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TripRequest } from '../trip.model';


@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss'],
})
export class TripFormComponent implements OnInit {
  formError: boolean;
  tripForm: FormGroup;

  @Input() tripData!: TripRequest;
  @Input() tripId!: string;
  @Output() submitted = new EventEmitter<TripRequest>();

  constructor(
    readonly modalRef: BsModalRef,
    formBuilder: FormBuilder
  ) {
    this.formError = false;
    this.tripForm = formBuilder.group({
      title: formBuilder.control('', [
        Validators.minLength(3),
        Validators.required,
      ]), description: formBuilder.control('',[ Validators.minLength(5), Validators.required])
    });
  }

  ngOnInit(): void {
    // If trip is defined, set its value as the form input's value
    if (this.tripData) {
      console.log("Trip Form: "+this.tripData);
      this.tripForm.patchValue({
        title: this.tripData.title,
        description: this.tripData.description,
      });
    }
  }
  onSubmit(){
    //Send data to NewTripModal to be processes if form info are valid 
    if (this.tripForm.valid) {
      const formData = this.tripForm.value;
      this.submitted.emit(formData);
    } else {
      //Display message error to corresponding input the user
      this.formError = true;
    }
  }
 }
