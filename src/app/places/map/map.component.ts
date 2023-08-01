import { Component, OnInit } from '@angular/core';
import { defaultIcon } from './default-marker';
import { latLng, MapOptions, tileLayer, marker, Marker, Map, LatLngExpression } from 'leaflet';
import { Place, PlaceService } from '../place.service';
import { Trip, TripService } from 'src/app/trips/trip.service';
import { CustomMarkerOptions } from './custom-marker-options';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  mapOptions: MapOptions;
  mapMarkers: Marker[];
  map: Map | undefined;
  trips: Trip[] = []; // Liste de tous les voyages de l'utilisateur
  selectedTripId: string | null = null; // ID du voyage sélectionné
  searchText: string = ''; // Valeur de l'input texte

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
  }
  ngOnInit() {

    this.tripService.getCurrentUserTrips().subscribe((trips: Trip[]) => {
      this.trips = trips;
    });

    this.placeService.getCurrentUserPlaces().subscribe((places: Place[]) => {
      // Transforme les lieux en marqueurs en utilisant la fonction marker de Leaflet
      this.mapMarkers = this.createMarkersWithPopups(places);
    });
  }
  onMapReady(map: Map) {
    // this.map = map;
    // this.map.on('moveend', () => {
    //   const center = this.map?.getCenter();
    //   if(center){
    //     console.log(`Map moved to ${center.lng}, ${center.lat}`);
    //   }
    // });
  }
  onTripSelectionChange() {
    this.updateMarkers();
  }
  onSearchTextChanged() {
    this.updateMarkers();
  }
  updateMarkers() {
    const searchText = this.searchText.trim().toLowerCase();
    const filteredMarkers: Marker[] = [];
  
    this.mapMarkers.forEach((mapMarker: Marker) => {
      const title = mapMarker.options?.title?.toLowerCase();
      const description = (mapMarker.options as CustomMarkerOptions)?.description?.toLowerCase();
      const tripId = (mapMarker.options as CustomMarkerOptions)?.tripId;
  
      // Filtrer par TripId (si existant) et textsearch
      const showMarker =
        (!this.selectedTripId || this.selectedTripId === tripId) &&
        (title?.includes(searchText) || description?.includes(searchText));
  
      if (showMarker) {
        this.map?.addLayer(mapMarker); // Afficher les marqueurs sur la map
        filteredMarkers.push(mapMarker); // MAJ de la liste des marqueurs
      } else {
        this.map?.removeLayer(mapMarker); // Cacher les marqueurs
      }
    });
  
    // Centrer la carte
    if (filteredMarkers.length > 0) {
      this.centerMapOnMarker(filteredMarkers[0]);
    }
  }
  private centerMapOnMarker(marker: Marker | null) {
    if (marker) {
      this.map?.panTo(marker.getLatLng());
    }
  }
  // Fonction pour convertir les coordonnées en une expression LatLng de Leaflet
  private convertToLatLng(coordinates: [number, number]): LatLngExpression {
    return latLng(coordinates[0], coordinates[1]);
  }

  private createMarkersWithPopups(places: any[]): Marker[] {
    const markers: Marker[] = [];

    places.forEach(place => {
      const markerOptions = {
        icon: defaultIcon,
        title: place.name, // Nom du lieu
        description: place.description, // Description du lieu
        photo: place.pictureUrl, // Photo du lieu (si disponible)
        tripId: place.tripId // Id du voyage correspondant
      };

      const marker = this.createMarker(this.convertToLatLng(place.location.coordinates), markerOptions);

      const title = marker.options.title;
      const description = (marker.options as CustomMarkerOptions)?.description;
      const popupContent = `
        <div>
          <h3 class=""><strong>${title}</strong></h3>
          <p>${description}</p> 
        </div>
      `;

      this.attachPopupToMarker(marker, popupContent);

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


