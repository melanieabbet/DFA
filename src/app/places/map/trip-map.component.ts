import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { MapService } from '../map/map.service'; 
import { Place, PlaceService } from '../place.service';
import { latLng, MapOptions, tileLayer, marker, Marker, Map, LatLngExpression } from 'leaflet';
import { defaultIcon } from './default-marker';

@Component({
  selector: 'app-trip-map',
  templateUrl: './trip-map.component.html',
  styleUrls: ['./trip-map.component.scss']
})
export class TripMapComponent implements OnInit {
  @Input({ required: true }) tripId!: string; 
  mapOptions: MapOptions;
  mapMarkers: Marker[];
  map: Map | undefined;
  existPlaces: boolean;

  constructor(private mapService: MapService, private placeService: PlaceService) {
    this.mapOptions = {
      layers: [
        tileLayer(
          'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { maxZoom: 18 }
        )
      ],
      zoom: 10,
      center: latLng(46.778186, 6.641524)
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

  ngOnInit() {
    // Nothing to do here yet
  }

  private loadMarkersAndCenter() {
     // get the trip places
    this.placeService.getThisTripPlaces(this.tripId).subscribe((places: Place[]) => {
      this.mapMarkers = this.createMarkers(places);
        //center the places on the map if existing
      if (this.mapMarkers.length > 0 && this.map) {
        this.centerMapOnMarker(this.mapMarkers[0]);
      }

    });
  }

  private createMarkers(places: any[]): Marker[] {
    const markers: Marker[] = [];
    places.forEach(place => {
      const markerOptions = {
        icon: defaultIcon,
      };
      const marker = this.createMarker(this.convertToLatLng(place.location.coordinates), markerOptions);
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
}
