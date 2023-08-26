import { Component, OnInit } from '@angular/core';
import { TripService } from '../trips/trip.service';
import { Trip } from '../trips/trip.model';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NewTripModalComponent } from '../trips/new-trip-modal/new-trip-modal.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {

 //ici soucis undefine avec onHidden. autre solutions que any ?
  formModal: any;
  trips?: Trip[];

  constructor(
    private tripService: TripService,
    private bsModalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.loadTrips();
  }
  loadTrips(): void{
    this.tripService.getCurrentUserTrips$()
    .subscribe((trips) => {this.trips = trips;});
  }

  openFormModal() {
    this.formModal = this.bsModalService.show(NewTripModalComponent);
    if (this.formModal) {
      this.formModal.onHidden.subscribe(() => {
        this.loadTrips();

      });
    }
  }
  
}
