import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PlaceRequest } from '../place.model';

@Component({
  selector: 'app-place-form',
  templateUrl: './place-form.component.html',
  styleUrls: ['./place-form.component.scss'],
})
export class PlaceFormComponent implements OnInit {

  formError: boolean;
  placeForm: FormGroup;

  @Input() placeData!: PlaceRequest;
  //@Input() tripId!: string;
  @Output() submitted = new EventEmitter<PlaceRequest>();

  constructor(
    readonly modalRef: BsModalRef,
    formBuilder: FormBuilder
  ) {
    this.formError = false;
    this.placeForm = formBuilder.group({
      name: formBuilder.control('', [
        Validators.minLength(3),
        Validators.required,
      ]), description: formBuilder.control('',[ 
        Validators.minLength(5), 
        Validators.required
      ])
    });
  }

  ngOnInit(): void {
    // If place is defined, set its value as the form input's value
    if (this.placeData) {
      this.placeForm.patchValue({
        name: this.placeData.name,
        description: this.placeData.description,
      });
    }
  }
  onSubmit(){
    if (this.placeForm.valid) {
      const formData = this.placeForm.value;
      this.submitted.emit(formData);
    } else {
      this.formError = true;
    }
  }
 }
