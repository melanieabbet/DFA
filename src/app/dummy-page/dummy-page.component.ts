import { Component, OnInit } from "@angular/core";
import { UserApiService } from "../users/user-api.service";

@Component({
  selector: "app-dummy-page",
  templateUrl: "./dummy-page.component.html",
  styleUrls: ["./dummy-page.component.scss"],
})
export class DummyPageComponent {
  constructor(private readonly userApi: UserApiService) {}

  ngOnInit(): void {
    // Ask the service to make an API call on component initialisation
    this.userApi.loadAllUsers$().subscribe({
      next: (users) => console.log("Users", users),
      error: (error) => console.warn("Error", error),
    });
  }
}
