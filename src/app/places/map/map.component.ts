import { Component, OnInit } from '@angular/core';
import { defaultIcon } from './default-marker';
import { latLng, MapOptions, tileLayer, marker, Marker, Map, LatLngExpression } from 'leaflet';
import { PlaceService } from '../place.service';
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

  constructor(private placeService: PlaceService){
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
        // Appelez la fonction du service pour récupérer les lieux de l'utilisateur actuel
        this.placeService.getCurrentUserPlaces().subscribe((places) => {
          // Transformez les lieux en marqueurs en utilisant la fonction marker de Leaflet
          this.mapMarkers = places.map(place => {
            const markerOptions = {
              icon: defaultIcon,
              title: place.name, // Nom du lieu
              description: place.description, // Description du lieu
              photo: place.pictureUrl // Photo du lieu (si disponible)
            };
            return marker(this.convertToLatLng(place.location.coordinates), markerOptions);
          });
    
          // Ajoutez une pop up personnalisé pour chaque marqueur et interface pour le donnée non "officiel as mapmarker"
          this.mapMarkers.forEach((mapMarker: Marker) => {
            const title = mapMarker.options.title;
            const description = (mapMarker.options as CustomMarkerOptions)?.description;
            const popupContent = `
              <div>
               <strong>${title}</strong><br>
                ${description ? description + '<br>' : ''}
              </div>
            `;
            console.log('Options :', mapMarker.options);
            // Attachez la popup au marqueur
            mapMarker.bindPopup(popupContent).openPopup();
          });
        });
  }
  onMapReady(map: Map) {
    this.map = map;
    this.map.on('moveend', () => {
      const center = this.map?.getCenter();
      if(center){
        console.log(`Map moved to ${center.lng}, ${center.lat}`);
      }
    });
    // Do other stuff with the map if needed
  }
  
  // Fonction pour convertir les coordonnées en une expression LatLng de Leaflet
  private convertToLatLng(coordinates: [number, number]): LatLngExpression {
    return latLng(coordinates[0], coordinates[1]);
  }
}


