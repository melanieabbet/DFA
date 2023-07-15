import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Trip, TripRequest } from '../trip.model';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss'],
})
export class TripFormComponent implements OnInit {
  // trips?: Trip[];
  // newTrip: TripRequest = {
  //   title: '',
  //   description: '',
  // };
  formError: boolean;
  tripForm: FormGroup;

  // @Input() trip?: Trip;
  @Output() submitted = new EventEmitter<TripRequest>();

  constructor(
    // private tripService: TripService,
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
    //this.tripForm.patchValue({})
  }
  onSubmit(){
    if (this.tripForm.valid) {
      const formData = this.tripForm.value;
      this.submitted.emit(formData);
    } else {
      this.formError = true;
    }
  }
 }
