import { Component,EventEmitter,Input, Output, OnDestroy,  NgZone, ChangeDetectorRef, OnInit  } from '@angular/core';
import { Place } from '../place.model';
import { PlaceService } from '../place.service';
import { isDefined } from 'src/app/utils';
import { BsModalService } from 'ngx-bootstrap/modal';
import { EditPlaceModalComponent } from '../edit-place-modal/edit-place-modal.component';
import { BooleanInput } from 'ngx-bootstrap/focus-trap/boolean-property';
import { MapService } from '../map/map.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-place-card',
  templateUrl: './place-card.component.html',
  styleUrls: ['./place-card.component.scss']
})
export class PlaceCardComponent implements OnInit, OnDestroy {
  @Input({required:true}) place!: Place;
  @Input() tripOwnedByUser: BooleanInput;
  @Output() placeDeleted = new EventEmitter<string>();
  @Output() placeEdited = new EventEmitter<boolean>();

  openedAccordionId: string | null = null; // define which item has to be open

  private previousPanelState = false; // To avoid muliple call on accordionPanelOpene() if a marker is clicked
  private placeActivatedSubscription: Subscription | undefined; // Subscription for placeActivated$ for action on marker
  
  deletePlaceError = false;
  errorMessage = "Une erreur s'est produite lors de la tentative de suppression du lieu";

  formModal: any;

  constructor (
    private mapService: MapService,
    private readonly placeService: PlaceService,
    private bsModalService: BsModalService,
    private ngZone: NgZone, // Need to avoid delayed or miscommunication with map
    private cdr: ChangeDetectorRef // Need to avoid delayed or miscommunication with map
    ){}

  ngOnInit(): void {
    // Subscribe to changes in the selected place's ID
    this.placeActivatedSubscription = this.mapService.placeActivated$.subscribe(selectedPlaceId => {
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
    if (this.placeActivatedSubscription) {
      this.placeActivatedSubscription.unsubscribe();
    }
  }
   //User confirmation to delete
   confirmDelete(): void {
    const result = confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?');
    if (result) {
      this.delete();
    }
  }
  delete(): void {
    if (isDefined(this.place.id)) {
      this.placeService.deletePlace$(this.place.id).subscribe({
        next: (deletedPlace: Place) => {
          // Suppression réussie, effectuez les actions nécessaires
          console.log('Le lieu a été supprimé :', deletedPlace);
          this.onDeletePlace();
        }, error: (err) => {
          // Initialize Error message (http response) and display to user
          if(err instanceof HttpErrorResponse && err.status === 401){
            const errorCode = err.error.code; // Error code send from the API
            switch (errorCode) {
              case 'authHeaderMissing':
                // 401 Unauthorized - This resource requires authentication
                this.errorMessage = "Seuls les utilisateur connectés peuvent supprimer des lieu";
                break;
              case 'authHeaderMalformed':
                // 401 authHeaderMalformed - Your Authorization header is not in the correct format.
                this.errorMessage = "Problème d'authentification - reconnexion nécessaire";
                break;
              case 'authTokenExpired':
                // 401 authTokenExpired -  The token you sent in the Authorization header was valid but has expired
                this.errorMessage = "Session expirée - reconnexion nécessaire";
                break;
              case 'authTokenInvalid':
                //401 Unauthorized - The token you sent in the Authorization header is invalid
                this.errorMessage = "Problème d'authentification - reconnexion nécessaire";
                break;
              default:
                // default
                this.errorMessage = "Une erreur s'est produite lors de la tentative de suppression du lieu du voyage.";
            }
          }else if (err instanceof HttpErrorResponse && err.status === 403){
            // 403 forbidden
            this.errorMessage = "Vous ne possédez pas les droits de suppression sur ce lieu";
          }else{
            // default
            this.errorMessage = "Une erreur s'est produite lors de la tentative de suppression";
          }
          this.deletePlaceError = true;
          console.warn(`Delete trip failed: ${err.message}`);
        }
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
        });
      }
    }
  }

  accordionPanelOpened(isOpen: boolean, panelId: string): void {
    if (isOpen && !this.previousPanelState) {
      this.previousPanelState = true;
      this.mapService.setActivePlace(panelId);
      console.log('Accordion panel opened:', panelId);
    } else {
      this.previousPanelState = isOpen;
    }
  }

}
