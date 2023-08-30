import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from '../user.model';
import { DatePipe } from '@angular/common';
import { isDefined } from 'src/app/utils';
import { Router } from '@angular/router';
import { UserUpdateRequest } from 'src/app/users/user-request.model';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { NgForm } from '@angular/forms';
import { AuthRequest } from 'src/app/auth/auth-request.model';

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss'],
  providers: [DatePipe],
})

export class AccountPageComponent implements OnInit {

  user?: User; //Define OnInit until there could be null or undefine
  isEditMode: boolean = false; // Switch Edit mode variable
  userUpdateRequest: UserUpdateRequest ={}; // value use to send the updateUser$()
  userForm!: NgForm; 

  /**
   * Manage error: 
   * actionError to define if there is an error
   * errorMessage the value to display to the user
   */
  actionError: boolean;
  errorMessage = "Une erreur s'est produite"; //Default value
  actionSuccess: boolean;
  successMessage = "Succès lors de la modification du compte"; //Default value

  constructor(
    private authService: AuthService,
    private datePipe: DatePipe,
    private router: Router,
  ) {
    this.actionError = false; //Define starting value
    this.actionSuccess = false; //Define starting value
  }

  ngOnInit(): void {
    /**
   * Get the current connected user
   */
  this.authService.getUser$().pipe(
    tap((user) => {
      this.user = user;
      this.isEditMode = false;
      if (user) {
        this.userUpdateRequest.name = user.name;
        this.userUpdateRequest.password = "password"; // Dummy text for UX - will be erased when modification allowed
      }
    })
  ).subscribe();
  }

  /**
   * Fonction to transform actual "string" Date into a formated date
   */
  formatDate(date: string): string {
    const dateObj = new Date(date);
    return this.datePipe.transform(dateObj, 'yyyy-MM-dd') || '';
  }
 //User confirmation to delete
 confirmDelete(): void {
  const result = confirm('Êtes-vous sûr de vouloir supprimer ce compte ? Tous les lieux et voyages affiliés au compte seront supprimé.');
  if (result) {
    this.delete();
  }
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
    this.actionError = false;
    this.actionSuccess =false;
    if (this.user){
        // Store the original name and set password to undefine
        // We replace dummy value so we don't send wrong data when change are saved
       this.userUpdateRequest.name = this.user.name;
       this.userUpdateRequest.password = "";
    }
  }

   /**
   * Function to update the user data
   * 1: Options: A: change name (Need check name availability) B: No change name
   * 2: Update User
   * 3: Update Auth
   * 4: Close editMode  & Reset displayed data
   */
   saveChanges() {
    console.log("triggered:"+this.userUpdateRequest.name+" "+this.userUpdateRequest.password);
    /**
     * Check that we get the data we need to start the action of saving
     * We need the original authenticated user - for modification
     */
    if (!this.user || !this.userUpdateRequest.name) {
      this.errorMessage = "Les données nécessaire sont imcomplètes";
      this.actionError = true;
      return;
    }
     /**
     * Option A: wish to update the username
     * We need to check name availability before updating
     */
    if (this.user.name !== this.userUpdateRequest.name) {
      console.log("le nom a changé");
      // 1: Check name availability
      this.authService.checkUserNameExists$(this.userUpdateRequest.name).pipe(
        switchMap((exists: boolean) => {
          if (exists) {
            this.errorMessage = 'Cet utilisateur existe déjà, choisi un autre nom';
            this.actionError = true;
            return throwError(() => new Error("Cet utilisateur existe déjà"));
          } else {
            console.log("le nom est dispo");
            // 2: Update user if the new name is available
            return this.authService.updateUser$(this.user!.id, this.userUpdateRequest).pipe(
              catchError((err) => {
                console.warn(`Update user failed: ${err.message}`);
                this.errorMessage = 'Erreur lors de la mise à jour de l\'utilisateur, veuillez réessayer.';
                this.actionError = true;
                return of(null);// return null to complete observable
              })
            );
          }
        }),
        switchMap((updatedUser) => {
          /**
           * If the name is available and the user was updated successfully
           * 3: Update Authentication
           */
          if (updatedUser && isDefined(this.userUpdateRequest.name) && isDefined(this.userUpdateRequest.password) ) {
            //map the input data to friendly user login object
            const userRefresh: AuthRequest = {username:this.userUpdateRequest.name,password:this.userUpdateRequest!.password };
            // 4: Disable edit mode
            this.isEditMode = false; // Disable edit mode here, after the update operation is completed
            this.actionError =false;
            //3: Update Authentication
            return this.authService.login$(userRefresh).pipe(
              catchError((err) => {
                console.warn(`Authentication failed after update: ${err.message}`);
                return of(null); // Null or subscribe to observable login$()
              })
            );
          } else {
            this.errorMessage = 'Erreur lors de la mise à jour de l\'utilisateur, veuillez réessayer.';
            this.actionError = true;
            return of(null);
          }
        }),
        catchError((err) => {
          console.warn(`Authentication failed: ${err.message}`);
          return []; // empty array to complete observable
        })
      ).subscribe((loginResult) => {
        // Handle the loginResult if needed.
        if (loginResult) {
          // Login successful
          this.actionSuccess = true;
        }
      });
    }else{
      /**
     * Option B: no username change
     * 1. We need don't need to check name availability before updating
     * 2. Update User
     */
      this.authService.updateUser$(this.user!.id, this.userUpdateRequest).subscribe({
        next: (updatedUser) => {
          if (updatedUser && isDefined(this.userUpdateRequest.name) && isDefined(this.userUpdateRequest.password)) {
            // map the input data to friendly user login object
            const userRefresh: AuthRequest = {username: this.userUpdateRequest.name, password: this.userUpdateRequest!.password };
            // 4: Disable edit mode
            this.isEditMode = false; // Disable edit mode here, after the update operation is completed
            // 3: Update Authentication
            this.authService.login$(userRefresh).subscribe({
              next: () => {
                // Success case (optional handling if needed)
                this.actionSuccess = true;
              },
              error: (error) => {
                // Handle the observable login$() error separately
                console.warn(`Authentication failed after update: ${error.message}`);
                // You can handle the error here if needed.
              }
            });
          }
        },
        error: (error) => {
          // Handle the observable updateUser$() error separately
          console.warn(`Update user failed: ${error.message}`);
          this.errorMessage = 'Erreur lors de la mise à jour de l\'utilisateur, veuillez réessayer.';
          this.actionError = true;
        }
      });
    }
  }

  /**
   * Cancel action:
   * 1. Cancel the action of update user data - disable editMode 
   * 2. Reset the current user data
   */
  cancelEdit() {
    this.isEditMode = false;
    this.actionError = false;
    if (this.user){
      // Restore the original name and password (dummy value) if editing is canceled
      this.userUpdateRequest.name = this.user.name;
      this.userUpdateRequest.password = "password";
    }
  }
  /**
   * Listen to input value: name
   */
  onNameChange(value: string) {
    this.userUpdateRequest.name = value;
    console.log("name changed:"+this.userUpdateRequest.name);
  }
    /**
   * Listen to input value: password
   */
  onPasswordChange(value: string) {
    this.userUpdateRequest.password = value;
    console.log("psw changed:"+this.userUpdateRequest.password);
  }
}
