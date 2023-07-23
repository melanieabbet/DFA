import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ApiTokenInterceptorService } from "./auth/api-token-interceptor.service";
import { AuthModule } from "./auth/auth.module";
import { DummyPageComponent } from './dummy-page/dummy-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { InspiPageComponent } from './inspi-page/inspi-page.component';
import { NavElementComponent } from './layout/navbar/nav-element.component';
import { PlaceCardComponent } from './places/place-card/place-card.component';
import { PlaceFormComponent } from './places/place-form/place-form.component';
import { TripCardComponent } from './trips/trip-card/trip-card.component';
import { TripFormComponent } from './trips/trip-form/trip-form.component';
import { TripPageComponent } from './trips/trip-page/trip-page.component';
import { NewTripModalComponent } from './trips/new-trip-modal/new-trip-modal.component';
import { EditTripModalComponent } from './trips/edit-trip-modal/edit-trip-modal.component';
import { NewPlaceModalComponent } from './places/new-place-modal/new-place-modal.component';


@NgModule({
  declarations: [
    AppComponent,
    DummyPageComponent,
    HomePageComponent,
    TripCardComponent,
    NavElementComponent,
    InspiPageComponent,
    TripPageComponent,
    PlaceCardComponent,
    PlaceFormComponent,
    TripFormComponent,
    NewTripModalComponent,
    EditTripModalComponent,
    NewPlaceModalComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    AuthModule,
    BrowserAnimationsModule,
    ModalModule.forRoot(),
    AccordionModule.forRoot(),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiTokenInterceptorService,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
