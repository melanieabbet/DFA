import { NgModule } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { LoginPageComponent } from './login-page/login-page.component';
import { FormsModule } from "@angular/forms";
import { LogoutButtonComponent } from './logout-button/logout-button.component';
import { RegisterPageComponent } from './register-page/register-page.component';



@NgModule({
  declarations: [
    LoginPageComponent,
    LogoutButtonComponent,
    RegisterPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AppRoutingModule,
  ],
  exports: [
    LoginPageComponent,
    LogoutButtonComponent,
    RegisterPageComponent
  ],
})
export class AuthModule { }
