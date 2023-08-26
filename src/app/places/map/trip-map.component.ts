import { Component, Input, OnDestroy, OnInit} from '@angular/core';
import { MapService } from '../map/map.service'; 
import { Place, PlaceService } from '../place.service';
import { latLng, MapOptions, tileLayer, marker, Marker, Map, LatLngExpression } from 'leaflet';
import { defaultIcon } from './default-marker';
import * as L from 'leaflet'; // To personalize Marker
import { CustomMarkerOptions } from './custom-marker-options';
import { Subscription } from 'rxjs'; // Import Subscription for change on places

@Component({
  selector: 'app-trip-map',
  templateUrl: './trip-map.component.html',
  styleUrls: ['./trip-map.component.scss']
})
export class TripMapComponent implements OnInit, OnDestroy{
  @Input({ required: true }) tripId!: string;
  mapOptions: MapOptions;
  mapMarkers: Marker[];
  map: Map | undefined;
  existPlaces: boolean; // to display to the user if no places exist
  enlargedMarker: Marker | null = null; // To rest old clicked marker once a new one is selected
  //selectedPlaceId: string | null = null;
  private placeAddedSubscription: Subscription | undefined; // Subscription for placeAdded$
  private placeDeletedSubscription: Subscription | undefined; // Subscription for placeDeleted$
  private placeUpdatedSubscription: Subscription | undefined; // Subscription for placeDeleted$
  private placeActivatedSubscription: Subscription | undefined; // Subscription for placeActivated$

  constructor(private mapService: MapService, private placeService: PlaceService) {
    this.mapOptions = {
      layers: [
        tileLayer(
          'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { maxZoom: 18 }
        )
      ],
      zoom: 10,
      center: latLng(46.778186, 6.641524) //Default value
    };
    this.mapMarkers = [];
    this.existPlaces = false;
  }

 /**
   * Action to execute only once Map is ready
   */
  onMapReady(map: Map) {
    this.map = map;
    this.loadMarkersAndCenter();
  }
/**
   * Subscribe to event that will impact markers
   */
  ngOnInit() {
    // Souscrivez au flux placeAdded$
    this.placeAddedSubscription = this.mapService.placeAdded$.subscribe((place: Place) => {
        this.addMarker(place);
    });
    // Souscrivez au flux placeDeleted$
    this.placeDeletedSubscription = this.mapService.placeDeleted$.subscribe((placeId: string) => {
        this.removeMarker(placeId);
    });
    // Souscrivez au flux placeUpdated$
    this.placeDeletedSubscription = this.mapService.placeUpdated$.subscribe((place: Place) => {
        this.updateMarker(place);
    });
    // Subscribe to changes in the selected place's ID
    this.placeActivatedSubscription = this.mapService.placeActivated$.subscribe(selectedPlaceId => {
        this.updateActiveMarker(selectedPlaceId);
      });
  }
  /**
   * On hide or delete end subscription to avoid overload
   */
  ngOnDestroy() {
    // unsubscribe when destroyed to avoid overload
    if (this.placeAddedSubscription) {
      this.placeAddedSubscription.unsubscribe();
    }
    if (this.placeDeletedSubscription) {
        this.placeDeletedSubscription.unsubscribe();
    }
    if (this.placeUpdatedSubscription) {
        this.placeUpdatedSubscription.unsubscribe();
    }
    if (this.placeActivatedSubscription) {
        this.placeActivatedSubscription.unsubscribe();
      }
  }
/**
   * Function to initiate the markers already existing and display, center them on the map
   */
  private loadMarkersAndCenter() {
     // get the trip places
    this.placeService.getThisTripPlaces$(this.tripId).subscribe((places: Place[]) => {
      this.mapMarkers = this.createMarkers(places);
        //center the places on the map if existing
      if (this.mapMarkers.length > 0 && this.map) {
        this.centerMapOnMarker(this.mapMarkers[0]);
        this.existPlaces = true;
      } else {
        this.existPlaces = false;
      }

    });
  }
/**
   * Function to create already existing markers with the element return by the fonction cretaeMarker()
   */
  private createMarkers(places: any[]): Marker[] {
    const markers: Marker[] = [];
    places.forEach(place => {
      const markerOptions = {
        icon: defaultIcon,
        id: place.id // Id used to link to accordion item
      };
      const marker = this.createMarker(this.convertToLatLng(place.location.coordinates), markerOptions);
      // Add on click behaviour (Bigger and open correct accordion item)
      marker.on('click', () => {
        // Reset last clicked marker size
        if (this.enlargedMarker) {
          this.resetMarkerSize(this.enlargedMarker);
        }
        // set the active place id to link with the accordion in order 
        this.mapService.setActivePlace(place.id);
        //console.log(place.id);
      });

      markers.push(marker);
    });
    return markers;
  }
  private createMarker(latLng: LatLngExpression, options: any): Marker {
    return marker(latLng, options);
  }

  private centerMapOnMarker(marker: Marker) {
    if (this.map) {
      this.map.panTo(marker.getLatLng());
    }
  }
  private convertToLatLng(coordinates: [number, number]): LatLngExpression {
    return latLng(coordinates[0], coordinates[1]);
  }
/**
   * Functions used to emphasizes the active/inactive marker 
   */
  private enlargeMarker(marker: Marker) {
    marker.setIcon(L.icon({
        iconSize: [40, 65], // Wished size
        iconAnchor: [20, 65], // reset position accordingly to size
        iconUrl: defaultIcon.options.iconUrl,
        shadowUrl: defaultIcon.options.shadowUrl
      }));
  }
  private resetMarkerSize(marker: Marker) {
    marker.setIcon(defaultIcon);
  }
/**
   * Functions to call when change in already existing markers or new marker
   */
  private addMarker(place: Place): void {
    const markerOptions = {
      icon: defaultIcon,
      id: place.id // Id used to link to accordion item
    };
    const marker = this.createMarker(this.convertToLatLng(place.location.coordinates), markerOptions);

    marker.on('click', () => {
      // Reset last clicked marker size
      if (this.enlargedMarker) {
        this.resetMarkerSize(this.enlargedMarker);
      }
      // set the active place id to link with the accordion 
      this.mapService.setActivePlace(place.id);
     console.log(place.id);
    });

    this.mapMarkers.push(marker);

    if (this.map) {
      this.map.addLayer(marker); // the new marker will be in a new layer
      this.centerMapOnMarker(marker);
      this.existPlaces = true;
    }
  }

  private removeMarker(placeId: string): void {
    //use of - CustomMarkerOptions  becaise id is a custom option
    const markerIndex = this.mapMarkers.findIndex(marker => (marker.options as CustomMarkerOptions).id === placeId);
    if (markerIndex !== -1) {
      const removedMarker = this.mapMarkers.splice(markerIndex, 1)[0];
      //remove the layer of the place to delete
      if (this.map) {
        this.map.removeLayer(removedMarker);
        if (this.mapMarkers.length <= 0) {
            this.existPlaces = false;
          }
      }
    }
  }
  
  private updateMarker(updatedPlace: Place): void {
    const markerIndex = this.mapMarkers.findIndex(marker => (marker.options as CustomMarkerOptions).id  === updatedPlace.id);
    if (markerIndex !== -1) {
      const existingMarker = this.mapMarkers[markerIndex];
      const updatedMarker = this.createMarker(this.convertToLatLng(updatedPlace.location.coordinates), {
        icon: defaultIcon,
        id: updatedPlace.id //should not change but how knows
      });

      // Remove the existing marker and add the updated marker
      this.map?.removeLayer(existingMarker);
      this.mapMarkers[markerIndex] = updatedMarker;
      this.map?.addLayer(updatedMarker);
    }
  }
/**
   * Function to update the active marker (marker's size - center) based on the selected place
   */
private updateActiveMarker(selectedPlaceId: string | null): void {
    this.mapMarkers.forEach(marker => {
        if ((marker.options as CustomMarkerOptions).id === selectedPlaceId) {
        this.enlargeMarker(marker);
        this.centerMapOnMarker(marker);
        } else {
        this.resetMarkerSize(marker);
        }
    });
}
}
