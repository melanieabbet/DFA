import { Component,Input } from '@angular/core';
import { Place } from '../place.model';
import { PlaceService } from '../place.service';

@Component({
  selector: 'app-place-card',
  templateUrl: './place-card.component.html',
  styleUrls: ['./place-card.component.scss']
})
export class PlaceCardComponent {
  @Input({required:true}) place!: Place;
  constructor (private readonly placeService: PlaceService){
  }

}
