import { HomePageComponent } from "./home-page/home-page.component"
import { authGuard } from "./auth/guards/auth.guard";
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from "./auth/login-page/login-page.component";
import { RegisterPageComponent } from "./auth/register-page/register-page.component";
import { InspiPageComponent } from "./inspi-page/inspi-page.component";
import { TripPageComponent } from "./trips/trip-page/trip-page.component";
import { AccountPageComponent } from "./users/account-page/account-page.component";

const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  {
    path: "login",
    component: LoginPageComponent,
  },
  {
    path: "register",
    component: RegisterPageComponent,
  },
  {
    path: "account",
    component: AccountPageComponent,
    // Prevent access to this page to unauthenticated users
    canActivate: [authGuard],
  },
  {
    path: "home",
    component: HomePageComponent,
    // Prevent access to this page to unauthenticated users
    canActivate: [authGuard],
  },
  {
    path: "inspiration",
    component: InspiPageComponent,
    // Prevent access to this page to unauthenticated users
    canActivate: [authGuard],
  },
  {
    path: "trips/:id",
    component: TripPageComponent,
    // Prevent access to this page to unauthenticated users
    canActivate: [authGuard],
  },
  {
    path: "**",
    component: LoginPageComponent,
    // Ajouter error component one day
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
