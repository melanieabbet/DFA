import { Component } from '@angular/core';
// Import the file with the default icon configuration
import { defaultIcon } from './default-marker';
import { latLng, MapOptions, tileLayer, marker, Marker, Map } from 'leaflet';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  mapOptions: MapOptions;
  mapMarkers: Marker[];
  map: Map | undefined;

  constructor(){
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
    this.mapMarkers = [
      marker([ 46.778186, 6.641524 ], { icon: defaultIcon }),
      marker([ 46.780796, 6.647395 ], { icon: defaultIcon }),
      marker([ 46.784992, 6.652267 ], { icon: defaultIcon })
    ];
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
}


