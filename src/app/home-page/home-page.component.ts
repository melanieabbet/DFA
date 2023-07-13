import { Component, OnInit, TemplateRef} from '@angular/core';
import { TripService } from '../trips/trip.service';
import { Trip } from '../trips/trip.model';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent  implements OnInit{
  formModal?: BsModalRef;
  trips?:Trip[];
  constructor(private tripService: TripService, private bsModalService: BsModalService){};
  ngOnInit(): void {
  this.tripService.getCurrentUserTrips().subscribe(trips => this.trips = trips);
  }
  openFormModal(template: TemplateRef<any>) {
    this.formModal = this.bsModalService.show(template);
  }

}
