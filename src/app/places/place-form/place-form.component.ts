import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PlaceRequest } from '../place.model';
import { latLng, marker, Marker, Map, LeafletMouseEvent, tileLayer } from 'leaflet';
import { defaultIcon } from '../map/default-marker';

@Component({
  selector: 'app-place-form',
  templateUrl: './place-form.component.html',
  styleUrls: ['./place-form.component.scss'],
})
export class PlaceFormComponent implements OnInit {

  formError: boolean;
  placeForm: FormGroup;

  @Input() placeData!: PlaceRequest;
  @Output() submitted = new EventEmitter<PlaceRequest>();

  // Propriétés pour la carte
  mapOptions: L.MapOptions;
  mapMarkers: Marker[] = [];
  selectedLocation: [number, number] | null = null;

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
      ]),
      pictureUrl: formBuilder.control(null, [Validators.pattern('https?://.+'),Validators.minLength(10)]), // Validation de base pour l'URL
    });
    this.mapOptions = {
      layers: [
        tileLayer(
          'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { maxZoom: 18 }
        )
      ],
      zoom: 13,
      center: latLng(46.778186, 6.641524)
    };
  }

  ngOnInit(): void {
    // If place is defined, set its value as the form input's value
    if (this.placeData) {
      this.placeForm.patchValue({
        name: this.placeData.name,
        description: this.placeData.description,
        pictureUrl: this.placeData.pictureUrl
      });
    }
  }
  onMapReady(map: Map){
    //centrer ici sur la localisation de l'user
    //Debug map
    setTimeout(() => map.invalidateSize(), 0);
  }
  // Fonction pour ajouter un marqueur sur la carte au clic
  onMapClick(event: LeafletMouseEvent) {
    const lat = event.latlng.lat;
    const lng = event.latlng.lng;
    this.selectedLocation = [lng, lat]; // Swap pour avoir les bonnes coordonées
    this.mapMarkers = [
      marker(event.latlng, {
        icon: defaultIcon,
        title: 'Nouveau lieu sélectionné'
      })
    ];
  }
  onSubmit(){
    if (this.placeForm.valid && this.selectedLocation) {
      const formData = this.placeForm.value;
      formData.location = {
        type: 'Point',
        coordinates: this.selectedLocation,
      };
      this.submitted.emit(formData);
    } else {
      this.formError = true;
    }
  }
 }
