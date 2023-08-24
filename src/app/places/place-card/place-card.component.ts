import { Component,EventEmitter,Input, Output, OnDestroy,  NgZone, ChangeDetectorRef  } from '@angular/core';
import { Place } from '../place.model';
import { PlaceService } from '../place.service';
import { isDefined } from 'src/app/utils';
import { BsModalService } from 'ngx-bootstrap/modal';
import { EditPlaceModalComponent } from '../edit-place-modal/edit-place-modal.component';
import { BooleanInput } from 'ngx-bootstrap/focus-trap/boolean-property';
import { MapService } from '../map/map.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-place-card',
  templateUrl: './place-card.component.html',
  styleUrls: ['./place-card.component.scss']
})
export class PlaceCardComponent implements OnDestroy {
  @Input({required:true}) place!: Place;
  @Input() tripOwnedByUser: BooleanInput;
  @Output() placeDeleted = new EventEmitter<string>();
  @Output() placeEdited = new EventEmitter<boolean>();
  private subscription: Subscription | undefined; 

  selectedPlaceId: string | null = null; // check if user come from map Marker
  openedAccordionId: string | null = null; // define which item has to be open

  formModal: any;

  constructor (
    private mapService: MapService,
    private readonly placeService: PlaceService,
    private bsModalService: BsModalService,
    private ngZone: NgZone, // Need to avoid delayed or miscommunication with map
    private cdr: ChangeDetectorRef // Need to avoid delayed or miscommunication with map
    ){
    /**
   * Listen to selected item in case user come from the map Marker
   */
    this.subscription = this.mapService.getSelectedPlaceId().subscribe(selectedPlaceId => {
      this.ngZone.run(() => {
        if (selectedPlaceId !== null) {
          this.openedAccordionId = selectedPlaceId;
          this.cdr.detectChanges(); // Force change detection
        }
      });
    });
  }
  /**
   * Destroy subscription when item is not displayed to avoid surcharge
   */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  delete(): void {
    if (isDefined(this.place.id)) {
      this.placeService.deletePlace(this.place.id).subscribe({
        next: (deletedPlace: Place) => {
          // Suppression réussie, effectuez les actions nécessaires
          console.log('Le lieu a été supprimé :', deletedPlace);
          this.onDeletePlace();
        }, error: () => { alert('Une erreur s\'est produite lors de la suppression du lieu :');}
      }
      );
    }
  }
  onDeletePlace(): void {
    // Output l'événement avec l'ID du lieu supprimé
    this.placeDeleted.emit(this.place.id);
    //Update map marker
    this.mapService.deletePlace(this.place.id);
  }
  showEditModal(): void {
    if (isDefined(this.place)) {
      console.log("Card: "+this.place);
      this.formModal = this.bsModalService.show(EditPlaceModalComponent, {
        initialState: {placeData: this.place},
      });
      
      if (this.formModal) {
        this.formModal.onHidden.subscribe(() => {
          this.placeEdited.emit(true);
          console.log("MAJ")
        });
      }
    }
  }
}
