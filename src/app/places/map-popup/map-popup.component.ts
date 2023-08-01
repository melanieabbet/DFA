import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-map-popup',
  templateUrl: './map-popup.component.html',
  styleUrls: ['./map-popup.component.scss']
})
export class MapPopupComponent {
  @Input() title!: string;
  @Input() description!: string;
 // @Input() photo!: string | null;
}
