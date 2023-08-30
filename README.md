# Travely

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.4. for the DFA course with Mathias Oberson (HE-ARC | MAS-RAD | CAS-DAF)

## The app

Travely is a web application that allows users to plan trips or find inspiration for future travel. Users can also find inspiration for their next trip and places to visit. 

## The fonctionality

See Travely-Flow.jpg to get an overview of how to navigate the app

### Login / Register:

The application is not accessible to users without an account.
On the starting page, users can log in directly or create an account. They are then redirected to the home page, which corresponds to their travel space.
On the application, users have access to an "account" area where they can delete their account or change their password and/or account name.
(Each user has a unique identifier).

### Home page:

On the Main page the user has access to all these trips and can create new trips. They can also have an overview on a map of all the places they have saved, filter them by trip or carry out a keyword search.

By default, the map is centred on the user's position, provided that the user accepts the use of their geolocation. If necessary, they can also use a button to recentre the map on their position. If the user refuses to allow his geolocation data to be used, the map will be centred on the first location saved or on a default location. The button is then deactivated.

When you click on one of the markers on the map, information about a location is displayed, along with a link to the trip page of the location (Coming from the map, the location will be displayed in details).

By clicking on one of the journeys, the user is redirected to the journey's page and access to the different locations within it (coming from the Trip card now location are showen in details).

### Trip page:

On the Trip page the user has access, to the trip details (name, description, creation date, user of the trip and description). As well as to the register places.
If the user is authentificated and if the trip belong to him/her, the user has the possibility to modify the trip information (name and description) and create or modify existing places.
Trip element are related to trip Marker on a map. On the click of each one of them (marker or element) the corresponding element is "activated".
Once an element is "activated" its details are shown.
If the user is authentificated he can modify or delete a place.

### Inspiration Page

On this page the user can find inspiration from other users (all trips existing are showns).

## Main challenges

For me one of the main challenge was to understand how to make connection between component. 
For example one specifics challenge was form to create different component(Modal) to edit and create Place or Trip while stille using the same form. I figured how to use correctly @input and @output EventEmitter to transfer data from the form to the modal and later to the page component.
For the other connection/update of element I mainly used observable.
The second diffculty for me is i struggle a bit to understand how i should organise my elements and when divided things into different services and component. For exemple in my app the map component is so closely related to the place component that perhaps I could find a better way to organize them.
