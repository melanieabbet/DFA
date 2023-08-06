import { Component, OnInit } from '@angular/core';
import { defaultIcon } from './default-marker';
import { latLng, MapOptions, tileLayer, marker, Marker, Map, LatLngExpression } from 'leaflet';
import { Place, PlaceService } from '../place.service';
import { Trip, TripService } from 'src/app/trips/trip.service';
import { CustomMarkerOptions } from './custom-marker-options';
import { Geolocation } from 'src/app/utils';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  mapOptions: MapOptions;
  mapMarkers: Marker[];
  map: Map | undefined;
  trips: Trip[] = []; // list use for all current user trip
  selectedTripId: string | null = null; // ID of selected
  searchText: string = ''; // input text value
  existPlaces: boolean;
  constructor(private placeService: PlaceService, private tripService: TripService){
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
    this.mapMarkers = [];
    this.existPlaces = false;
  }

  ngOnInit() {
  /**
   * Get all current user Trip for input select
   */
    this.tripService.getCurrentUserTrips().subscribe((trips: Trip[]) => {
      this.trips = trips;
    });

    /**
   * Get all current user places to display on the map
   */
    this.placeService.getCurrentUserPlaces().subscribe((places: Place[]) => {
      // Transform places into marker
      this.mapMarkers = this.createMarkersWithPopups(places);
      if (this.mapMarkers){
        this.existPlaces = true;
      }else{
        this.existPlaces = false;
      }
    });
  }


  /**
   * Action to execute when mMap is ready
   * 1: center the map on user at starting point or default position
   */
  onMapReady(map: Map) {
    this.map = map;
    // Get the user location if possible
    Geolocation.getCurrentPosition()
      .then((position) => {
        this.centerMapOnGeolocation(position.coords.latitude, position.coords.longitude);
      })
      .catch((error) => {
        // Use of Location not permitted then default values
        console.error('Error getting geolocation:', error);
        const fallbackLatitude = 46.778186; 
        const fallbackLongitude = 6.641524; 
        this.centerMapOnGeolocation(fallbackLatitude, fallbackLongitude);
      });
  }

  /**
   * Filter marker on input change
   */
  onTripSelectionChange() {
    this.updateMarkers();
  }
  onSearchTextChanged() {
    this.updateMarkers();
  }

  updateMarkers() {
    //set const for filtering
    const searchText = this.searchText.trim().toLowerCase();
    const filteredMarkers: Marker[] = []; // dynamic list of filtered marker
  
    this.mapMarkers.forEach((mapMarker: Marker) => {
      //set Marker const for pop up
      const title = mapMarker.options?.title?.toLowerCase();
      const description = (mapMarker.options as CustomMarkerOptions)?.description?.toLowerCase();
      const tripId = (mapMarker.options as CustomMarkerOptions)?.tripId;
  
      // Filter by TripId (if exist) and textsearch value
      const showMarker =
        (!this.selectedTripId || this.selectedTripId === tripId) &&
        (title?.includes(searchText) || description?.includes(searchText));
  
      if (showMarker) {
        this.map?.addLayer(mapMarker); // Display marker on the map
        filteredMarkers.push(mapMarker); // Update the list of filtered marker
      } else {
        this.map?.removeLayer(mapMarker); //hide filteredmarker
      }
    });
  
    // center the map on first filtered marker
    if (filteredMarkers.length > 0) {
      this.existPlaces = true;
      this.centerMapOnMarker(filteredMarkers[0]);
    } else {
      this.existPlaces = false;
    }
  }

  private centerMapOnMarker(marker: Marker | null) {
    if (marker) {
      this.map?.panTo(marker.getLatLng());
    }
  }
  private centerMapOnGeolocation(latitude: number, longitude: number) {
    if (this.map) {
      this.map.setView([latitude, longitude], 13);
    }
  }
  // Fonction to convert coordinate into LatLng - Leaflet expression
  private convertToLatLng(coordinates: [number, number]): LatLngExpression {
    return latLng(coordinates[0], coordinates[1]);
  }
  //initialize Popups to display infos on marker click
  private createMarkersWithPopups(places: any[]): Marker[] {
    const markers: Marker[] = [];

    places.forEach(place => {
      const markerOptions = {
        icon: defaultIcon,
        title: place.name, // name of the place
        description: place.description, // Description of place
        photo: place.pictureUrl, // picture if there
        tripId: place.tripId // Id use later for action see trip
      };

      const marker = this.createMarker(this.convertToLatLng(place.location.coordinates), markerOptions);

      const title = marker.options.title;
      // We need to expend the Marker Options with CustomMarkerOptions to add custom value
      const description = (marker.options as CustomMarkerOptions)?.description;
      const tripId = (marker.options as CustomMarkerOptions)?.tripId;
      //Popup template
      const popupContent = `
        <div>
          <h3 class=""><strong>${title}</strong></h3>
          <p>${description}</p> 
          <p>${tripId}</p> 
        </div>
      `;
      this.attachPopupToMarker(marker, popupContent);
      //add the new marker to the markers list for later display / filter
      markers.push(marker);
    });

    return markers;
  }

  private createMarker(latLng: LatLngExpression, options: any): Marker {
    return marker(latLng, options);
  }
  private attachPopupToMarker(marker: Marker, popupContent: string): void {
    marker.bindPopup(popupContent).openPopup();
  }


}


