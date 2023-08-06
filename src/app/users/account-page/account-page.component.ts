import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from '../user.model';
import { DatePipe } from '@angular/common';
import { isDefined } from 'src/app/utils';
import { Router } from '@angular/router';
import { UserUpdateRequest } from 'src/app/users/user-request.model';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss'],
  providers: [DatePipe],
})

export class AccountPageComponent implements OnInit {

  user?: User; //Define OnInit until there could be null or undefine
  isEditMode: boolean = false; // Switch Edit mode variable
  userUpdateRequest: UserUpdateRequest ={};
  userForm!: NgForm; // Déclarez le formulaire ngForm ici
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
    if (this.user){
        // Store the original name and set password to undefine
        // We replace dummy value so we don't send wrong data when change are saved
       this.userUpdateRequest.name = this.user.name;
       this.userUpdateRequest.password = undefined;
    }
  }

   /**
   * Fonction to update the user data
   */
   saveChanges() {

    /**
     * Check that we get the data we need to start the action of saving
     * We need the original authenticated user - for modification
     * 2nd layer of security: updateRequest should be initialize when edit button is hit & the Form don't allow empty input
     * 2nd layer of security: button submit should be disable when form is invalid
     */
    if (!this.user || !this.userUpdateRequest.name || this.userForm.invalid) {
      this.errorMessage = "Les données nécessaire sont imcomplètes";
      this.actionError = true;
      return;
    }
  
    if (this.user.name !== this.userUpdateRequest.name) {
      console.log("le nom a changé");
      this.authService
        .checkUserNameExists$(this.userUpdateRequest.name)
        .pipe(
          mergeMap((exists: boolean) => {
            if (exists) {
              this.errorMessage =
                'Cet utilisateur existe déjà, choisi un autre nom';
              return throwError(() => new Error('Cet utilisateur existe déjà'));
            } else {
              // 1: If available - Update user
              console.log("le nom est dispo");
              return this.authService.updateUser$(this.user!.id, this.userUpdateRequest)
                .pipe(
                  catchError((err) => {
                    console.warn(`Update user failed: ${err.message}`);
                    return of (null); // Return empty to complete the observable
                  })
                );
            }
          }),
          catchError((err) => {
            console.warn(`Authentication failed: ${err.message}`);
            return of (null); // Return empty to complete the observable
          })
        )
        .subscribe((updatedUser) => {
          // 2: Once done - Reset file with new data and disable edit mode
          console.log("l'user est updaté");
          if (updatedUser) {
            this.user = updatedUser;
          }
          this.isEditMode = false;
        });
    } else if (this.user.name == this.userUpdateRequest.name && (this.userUpdateRequest.password !== null || this.userUpdateRequest.password !== undefined) ) {
      console.log("le mdp a changé");
      this.authService.updateUser$(this.user!.id, this.userUpdateRequest).pipe(
        catchError((err) => {
          console.warn(`Update user failed: ${err.message}`);
          return of (null);
        })).subscribe((updatedUser) => {
          // 2: Once done - Reset file with new data and disable edit mode
          if (updatedUser) {
            this.user = updatedUser;
          }
          this.isEditMode = false;
        });
    }else{
      //no change made - juste close editMode
      this.isEditMode = false;
    }
  }
  





  // saveChanges() {

  //   //si le nom a été modifié il nous faut vérifier la disponibilité du nouveau nom
  //   if (this.user && this.userUpdateRequest.name && (this.user.name !== this.userUpdateRequest.name)){

  //     this.authService.checkUserNameExists$(this.userUpdateRequest.name).pipe(
  //       mergeMap((exists: boolean) => {
  //         if (exists) {
  //           // Not available: Error
  //           this.errorMessage = "Cet utilisateur existe déjà, choisi un autre nom";
  //           return throwError(() => new Error("Cet utilisateur existe déjà"));
  //         } else {
  //           // 2: If available - Update user
  //           return this.authService.updateUser$(this.user!.id,this.userUpdateRequest).subscribe((updatedatedUser) => this.user = updatedatedUser);
  //           //on devrait aussi récupérer les erreur de l'api lors de l'udate (console.warn /catchError)
  //         }
  //       }),
  //       catchError((err) => {
  //         //this.registerError = true; // If not initialized inside the pipe the default error message will be displayed
  //         console.warn(`Authentication failed: ${err.message}`);
  //         return []; // empty array to complete observable
  //       })
  //     ).subscribe({
  //     next: () => {
  //      // 4: Once done - Reset file with new data and disable edit mode
  //      //code pour reste data
  //      this.isEditMode = false;
  //     }
  //   });
      
  //     // this.authService.updateUser$(this.user.id,this.userUpdateRequest).subscribe({
  //     //   next: (user) => {

  //     //   }, error: (err) => { 
  //     //     this.actionError = true;
  //     //     this.errorMessage = "Une erreur s'est produite lors de la modification du compte.";
  //     //     console.warn(`Action failed: ${err.message}`);
  //     //   }
  //     // });
  //   }
  //   // option 1: le nom est le même mais l'inout du mot de passe n'est pas vide c'est qu'il a changé il nous faut updater l'user
  //   // option 2:le nom est le même et le champ mot de passe est vide -rien n'as changé on peut juste passer en mode non éditable.
  // }

  /**
   * Cancel action:
   * 1. Cancel the action of update user data - disable editMode 
   * 2. Reset the current user data
   */
  cancelEdit() {
    this.isEditMode = false;
    if (this.user){
      // Restore the original name and password (dummy value) if editing is canceled
      //this.user.name = this.originalName;
      //this.originalPassword = "password";
      this.userUpdateRequest.name = this.user.name;
      this.userUpdateRequest.password = "password";
    }
  }
  onNameChange(value: string) {
    this.userUpdateRequest.name = value;
  }
  
  onPasswordChange(value: string) {
    this.userUpdateRequest.password = value;
  }
}
