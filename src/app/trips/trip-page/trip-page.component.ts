import { Component, Input, Output } from '@angular/core';
import { TripService } from '../trip.service';
import { Trip } from '../trip.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Place, PlaceRequest } from 'src/app/places/place.model';
import { PlaceService } from 'src/app/places/place.service';
import { AuthService } from 'src/app/auth/auth.service';
import { filter, first, forkJoin } from 'rxjs';
import { isDefined } from 'src/app/utils';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { EditTripModalComponent } from '../edit-trip-modal/edit-trip-modal.component';
import { NewPlaceModalComponent } from 'src/app/places/new-place-modal/new-place-modal.component';

@Component({
  selector: 'app-trip-page',
  templateUrl: './trip-page.component.html',
  styleUrls: ['./trip-page.component.scss'],
  providers: [DatePipe],
})
export class TripPageComponent {
  tripId?: string;
  places?: Place[];
  tripOwnedByUser = false;
  @Input({ required: true }) trip?: Trip;
  formModal: any;

  constructor(
    private route: ActivatedRoute,
    private tripService: TripService,
    private placeService: PlaceService,
    private auth: AuthService,
    private datePipe: DatePipe,
    private router: Router,
    private bsModalService: BsModalService
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      if (!params.has('id')) {
        throw TypeError('Trip ID does not exist');
      }
      this.tripId = params.get('id') as string;

      // Execute if all observable are completed
      forkJoin([
        this.tripService.getTrip(this.tripId),
        this.placeService.getThisTripPlaces(this.tripId),
        // Tricks to complete an observable that normally never end
        this.auth.getUser$().pipe(
          // Say to typescript that user is define
          filter(isDefined),
          first()
        ),
      ]).subscribe(([trip, places, user]) => {
        this.trip = trip;
        this.places = places;
        this.tripOwnedByUser = user.id === trip.userId;
      });
    });
  }
  formatDate(date: string): string {
    const dateObj = new Date(date);
    return this.datePipe.transform(dateObj, 'yyyy-MM-dd') || '';
  }

  showEditModal(): void {
      if (isDefined(this.trip)) {
        console.log("Trip Page: "+this.trip);
        this.formModal = this.bsModalService.show(EditTripModalComponent, {
          initialState: {tripData: this.trip , tripId: this.tripId },
        });
        if (this.formModal) {
          this.formModal.onHidden.subscribe(() => {
            this.loadTrip();
            console.log("MAJ")
          });
        }
      }
  }
  delete(): void {
    if (isDefined(this.tripId)) {
      this.tripService.deleteTrip(this.tripId).subscribe({
        next: (deletedTrip: Trip) => {
          // Suppression réussie, effectuez les actions nécessaires
          console.log('Le voyage a été supprimé :', deletedTrip);
          // Redirigez l'utilisateur vers une autre page
          this.router.navigate(['/home']);
          // ou mettez à jour la liste des voyages dans votre composant parent
        }, error: () => { alert('Une erreur s\'est produite lors de la suppression du voyage :');}
      }
      );
    }
  }
  loadTrip(): void{
    if(this.tripId){
      this.tripService.getTrip(this.tripId).subscribe((trip) => {this.trip = trip;});
    };
  }
  loadPlace(): void{
    if(this.tripId){
      this.placeService.getThisTripPlaces(this.tripId).subscribe((places)=> {this.places = places;})
    };
    //améliorer pour ne mettre a jour que la nouvelle place?
  }
  showAddPlaceModal(): void {
    this.formModal = this.bsModalService.show(NewPlaceModalComponent, {
      initialState: { tripId: this.tripId },
    });
    if (this.formModal) {
      this.formModal.onHidden.subscribe(() => {
        this.loadPlace();
        console.log("MAJ")
      });
    }
  }
  // Fonction appelée lorsque le lieu est supprimé depuis le PlaceCardComponent
  onPlaceDeleted(placeId: string): void {
    // Mettez à jour la liste des lieux en filtrant le lieu supprimé
    this.places = this.places?.filter(place => place.id !== placeId);
  }
}
