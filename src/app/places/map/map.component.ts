import { AfterViewInit, Component, NgZone, OnInit, ViewChild,ElementRef, Input, OnChanges, SimpleChanges  } from '@angular/core';
import { defaultIcon } from './default-marker';
import { latLng, MapOptions, tileLayer, marker, Marker, Map, LatLngExpression } from 'leaflet';
import { Place, PlaceService } from '../place.service';
import { Trip, TripService } from 'src/app/trips/trip.service';
import { CustomMarkerOptions } from './custom-marker-options';
import { Geolocation } from 'src/app/utils';
import { Router } from '@angular/router';
import { MapService } from './map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('mappopup') mappopup?: ElementRef; // Reference to the popup element in the template. undefine till creation of the marker
  mapOptions: MapOptions;
  mapMarkers: Marker[];
  map: Map | undefined;
  @Input() trips?: Trip[]; 
  selectedTripId: string =""; // ID of selected 
  searchText: string = ''; // input text value
  existPlaces: boolean; // to display to the user if no places exist
  userLocationPermission: boolean = false; //toggle button availability based on user location permission
  constructor(private mapService: MapService, private placeService: PlaceService, private tripService: TripService, private router: Router,private ngZone: NgZone){
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
    this.placeService.getCurrentUserPlaces$().subscribe((places: Place[]) => {
      // Transform places into marker
      this.mapMarkers = this.createMarkersWithPopups(places);
      if (this.mapMarkers.length > 0){
        this.existPlaces = true;
      }else{
        this.existPlaces = false;
      }
    });
    // Check if geolocation permission is granted for button sate
    if ("geolocation" in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        this.userLocationPermission = permissionStatus.state === 'granted';
      });
    }
  }
    /**
   * Lifecycle hook - To stay tuned when trips list from parent component change
   */
  ngOnChanges(changes: SimpleChanges) {
    //Used for update on the select input options
  }

  // Initializes the click event listener for the popup link after the view is fully initialized.
  // Listens for clicks on the link and calls the onPopupLinkClick method to redirect.
  ngAfterViewInit() {
    if (this.mappopup) {
      const popupElement: HTMLElement = this.mappopup.nativeElement;
      console.log("const popUp:" + popupElement);
      popupElement.addEventListener('click', (event: Event) => this.onPopupLinkClick(event));
    }
  }
  /**
   * Event handler for clicking on a link inside a popup.
   * Ensures navigation is performed within the Angular zone to prevent the "Navigation triggered outside Angular zone" error.
   * 
   * @param event The click event object.
   */
  onPopupLinkClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('details-link')) {
      const tripId = target.dataset['tripid']; // Get the tripId from the link's text
      const placeId = target.dataset['placeid']; // Get the placeId from the link's text
      if (placeId) {
        // set the active place id to link with the accordion 
        this.mapService.setActivePlace(placeId);
      }
      // Use ngZone.run() to navigate within the Angular zone.
      this.ngZone.run(() => {
        // Use the Router service to navigate to the trip details page
        this.router.navigate(['/trips', tripId]);
      });
    }
  }
  

  /**
   * Action to execute when mMap is ready
   * 1: center the map on user at starting point or default position
   */
  onMapReady(map: Map) {
    this.map = map;
    this.centerMapOnUserLocation();
  }
    /**
   * Function to center map on user location when available
   */
  centerMapOnUserLocation() {
      Geolocation.getCurrentPosition()
        .then((position) => {
          this.centerMapOnGeolocation(position.coords.latitude, position.coords.longitude);
        })
        .catch((error) => {
          console.error('Error getting geolocation:', error);
          //default position
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
      this.map.setView([latitude, longitude], 8);
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
        picture: place.pictureUrl, // picture if there
        tripId: place.tripId, // Id use later for action see trip
        id: place.id // Id used to link to accordion item
      };

      const marker = this.createMarker(this.convertToLatLng(place.location.coordinates), markerOptions);

      const title = marker.options.title;
      // We need to expend the Marker Options with CustomMarkerOptions to add custom value
      const description = (marker.options as CustomMarkerOptions)?.description;
      const tripId = (marker.options as CustomMarkerOptions)?.tripId; // useful to link to correct trip page
      const id = (marker.options as CustomMarkerOptions).id; // useful to define which accordion item to open
       // Check if the picture exists or use the default image URL
       const pictureUrl = place.pictureUrl ? place.pictureUrl : 'https://media.istockphoto.com/id/1373024887/de/vektor/karten-pin-icon-mit-langem-schatten-auf-leerem-hintergrund-flat-design.jpg?s=612x612&w=0&k=20&c=E09D9kCH8kkqEQoxS3llgN3nRNDfsQxAFf4llj6zq2g=';
      //Popup template
      const popupContent = `
        <div #mappopup class="map-popup">
          <img src="${pictureUrl}" alt="Image du voyage" class="w-100 pb-1">
          <h3 class="mb-1"><strong>${title}</strong></h3>
          <p class="m-0 mb-2">${description}</p> 
          <button class="details-link btn btn-primary" data-placeId="${id}" data-tripId="${tripId}">Détails</button>  
        </div>
      `;
      this.attachPopupToMarker(marker, popupContent);
      // Add the click event listener to the popup link
    marker.on('popupopen', () => {
      const popupElement = document.querySelector('.map-popup');
      if (popupElement) {
        popupElement.addEventListener('click', (event: Event) => this.onPopupLinkClick(event));
      }
    });
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


