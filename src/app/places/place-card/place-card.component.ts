import { Component,EventEmitter,Input, Output } from '@angular/core';
import { Place, PlaceRequest } from '../place.model';
import { PlaceService } from '../place.service';
import { isDefined } from 'src/app/utils';
import { BsModalService } from 'ngx-bootstrap/modal';
import { EditPlaceModalComponent } from '../edit-place-modal/edit-place-modal.component';
import { BooleanInput } from 'ngx-bootstrap/focus-trap/boolean-property';


@Component({
  selector: 'app-place-card',
  templateUrl: './place-card.component.html',
  styleUrls: ['./place-card.component.scss']
})
export class PlaceCardComponent {
  @Input({required:true}) place!: Place;
  @Input() tripOwnedByUser: BooleanInput;
  @Output() placeDeleted = new EventEmitter<string>();
  @Output() placeEdited = new EventEmitter<boolean>();
  formModal: any;
  constructor (private readonly placeService: PlaceService,  private bsModalService: BsModalService){
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
