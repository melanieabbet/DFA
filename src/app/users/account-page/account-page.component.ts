import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from '../user.model';
import { DatePipe } from '@angular/common';
import { isDefined } from 'src/app/utils';
import { Router } from '@angular/router';
import { UserUpdateRequest } from 'src/app/auth/user-register-request.model';

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss'],
  providers: [DatePipe],
})

export class AccountPageComponent implements OnInit {

  user?: User; //Define OnInit until there could be null or undefine
  isEditMode: boolean = false; // Switch Edit mode variable
  originalUserRequest?: UserUpdateRequest; // Store the original user object
  /**
   * Manage error: 
   * actionError to define if there is an error
   * errorMessage the value to display to the user
   */
  actionError: boolean;
  errorMessage = "Une erreur s'est produite";

  constructor(
    private authService: AuthService,
    private datePipe: DatePipe,
    private router: Router,
  ) {
    this.actionError = false; //Define starting value

  }

  ngOnInit(): void {
    /**
     * Get the current user
     */
    this.authService.getUser$().subscribe((user) => {
      this.user = user;
      this.isEditMode = false;
      if (user){
        //Initialize the values with the user object
        this.originalUserRequest = { 
          name: user.name,
         }; 
      }
    });
  }
  /**
   * Fonction to transform actual "string" Date into a formated date
   */
  formatDate(date: string): string {
    const dateObj = new Date(date);
    return this.datePipe.transform(dateObj, 'yyyy-MM-dd') || '';
  }
  /**
   * 1. Delete the current user
   * 2. Reset authentication to null with logout
   * (This help against unwilling behavior: Like back action on the page)
   * 3. Redirect to Login Page
   */
  delete(): void{
    if (isDefined(this.user)) {
      this.authService.deleteUser(this.user.id).subscribe({
        next: () => {
          this.authService.logout(); //2.
          this.router.navigate(['/login']); // 3.
        }, error: (err) => { 
          this.actionError = true;
          this.errorMessage = "Une erreur s'est produite lors de la suppression du compte.";
          console.warn(`Action failed: ${err.message}`);
        }
      });
    }
  }
  /**
   * Fonction to make the input field editable via the boolean variable
   */
  enableEditMode() {
    this.isEditMode = true;
  }
   /**
   * Fonction to update the user data
   */
  saveChanges() {
    // Vous pouvez appeler ici votre service pour mettre à jour les informations de l'utilisateur
    // par exemple : this.authService.updateUser(this.user).subscribe(...);
    this.isEditMode = false;
  }
  /**
   * Cancel action:
   * 1. Cancel the action of update user data - Reset the current user data
   * 2. disable editMode
   */
  cancelEdit() {
    this.authService.getUser$().subscribe((user) => {
      this.user = user;
    });
    this.isEditMode = false;
  }
}
