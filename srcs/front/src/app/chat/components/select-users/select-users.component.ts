import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap, filter, map } from 'rxjs';
import { UserI } from 'src/app/user/user.interface';
import { AuthService } from 'src/app/login/auth.service';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-select-users',
  templateUrl: './select-users.component.html',
  styleUrls: ['./select-users.component.scss']
})
export class SelectUsersComponent implements OnInit {

  /* Get values from the parent component: create-room -> here */
  @Input() users: UserI[];
  @Input() type: string;
  
  /* If add user from form using this module, we return outputs to the Parent Component 
  ** ex: here -> create-room
  */
  @Output() addUser: EventEmitter<UserI> = new EventEmitter<UserI>();
  @Output() removeUser: EventEmitter<UserI> = new EventEmitter<UserI>();
  
  searchUsername = new FormControl('');
  filteredUsers: UserI[] = [];
  selectedUser: UserI | null;
  selectedUserNames: string[] = [];
  LoggedInUser: UserI = this.authService.getLoggedInUser();

  constructor(private userService: UserService, private authService: AuthService) { }


  ngOnInit(): void {
    this.searchUsername.valueChanges.pipe( // gets triggerd everytime value changes
      debounceTime(500),                   // set 500ms before change is accepted
      distinctUntilChanged(),
      switchMap( (username: any) => this.userService.findByUsername(username).pipe(
        tap((users: UserI[]) => this.filteredUsers = (!users) ? [] : users.filter(
          user => (user.username != this.LoggedInUser.username) && (!this.selectedUserNames.includes(user?.username!)) 
        ))
      ))
    ).subscribe();
  }

  displayFn(user: UserI) {
    if (user && user.username) {
      return user.username;
    } else {
      return '';
    }
  }

  setSelectedUser(user: UserI) {
    this.selectedUser = user;
    if (user.username)
      this.selectedUserNames.push(user.username)
  }

  /* emit event to Parent (create-room), passing the UserI */
  addUserToForm() {
    if (this.selectedUser)
      this.addUser.emit(this.selectedUser);
    
    /* Reset the form and data after submission to Parent*/
    this.filteredUsers = []
    this.selectedUser = null;
    this.searchUsername.setValue(null);
  }

  removeUserFromForm(user: UserI){
    if (user.username) {
      const index = this.selectedUserNames.indexOf(user.username, 0);
      if (index > -1) {
        this.selectedUserNames.splice(index, 1);
      }
    }
    this.removeUser.emit(user);
  }
}
