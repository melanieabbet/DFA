import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import {Place, PlaceRequest } from '../place.model';
import { latLng, marker, Marker, Map, LeafletMouseEvent, tileLayer } from 'leaflet';
import { defaultIcon } from '../map/default-marker';
import { Geolocation } from 'src/app/utils';

@Component({
  selector: 'app-place-form',
  templateUrl: './place-form.component.html',
  styleUrls: ['./place-form.component.scss'],
})
export class PlaceFormComponent implements OnInit {

  formError: boolean;
  placeForm: FormGroup;

  @Input() placeData!: Place;
  @Output() submitted = new EventEmitter<PlaceRequest>();

  // map proprieties
  mapOptions: L.MapOptions;
  mapMarkers: Marker[] = [];
  selectedLocation: [number, number] | null = null;
  mapCenter: [number, number] = [46.778186, 6.641524]; // default value to center the map

  constructor(
    readonly modalRef: BsModalRef,
    formBuilder: FormBuilder
  ) {
    console.log("Form: "+this.placeData);
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
      console.log("Form OnInit: "+ this.placeData);
      this.placeForm.patchValue({
        name: this.placeData.name,
        description: this.placeData.description,
        pictureUrl: this.placeData.pictureUrl
      });
    }
  }
  onMapReady(map: Map){
    //center map on place if place is define
    setTimeout(() => map.invalidateSize(), 0);
    if (this.placeData){
      const coordinates = this.placeData.location.coordinates;
      this.selectedLocation = [coordinates[0], coordinates[1]];
      this.mapMarkers = [
        marker([coordinates[0], coordinates[1]], {
          icon: defaultIcon,
          title: 'Position actuelle du lieu'
        })
      ];
      this.mapCenter = [coordinates[0], coordinates[1]];
      map.setView(this.mapCenter, 13);
    } else {
      //center map on user location if place is define
      Geolocation.getCurrentPosition()
      .then((position) => {
        this.mapCenter = [position.coords.latitude, position.coords.longitude];
        map.setView(this.mapCenter, 13);
      })
      .catch((error) => {
        console.error('Error getting geolocation:', error);
        //default position
        const fallbackLatitude = 46.778186; 
        const fallbackLongitude = 6.641524; 
        this.mapCenter = [fallbackLatitude, fallbackLongitude];
        map.setView(this.mapCenter, 13);
      });
    }
    
  }
  // Add marker on map when clicked
  onMapClick(event: LeafletMouseEvent) {
    const lat = event.latlng.lat;
    const lng = event.latlng.lng;
    this.selectedLocation = [lat,lng];
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
