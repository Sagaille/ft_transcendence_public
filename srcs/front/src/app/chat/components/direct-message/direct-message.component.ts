import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from 'src/app/user/user.interface';
import { UserService } from 'src/app/user/user.service';
import { RoomI } from '../../model/room.interface';
import { ChatService } from '../../services/chat-service/chat.service';


export interface addDirectMessageData {
  user: UserI;
  UserInput: string;
}

@Component({
  selector: 'app-direct-message',
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss']
})
export class DirectMessageComponent implements OnInit {

  searchUsername = new FormControl('');
  filteredUsers: UserI[] = [];
  selectedUser: UserI | null;
  myDirectMessages: RoomI[] = [];
  DMAlreadyExistWithUser: Set<number>;

  constructor(
    public dialogRef: MatDialogRef<DirectMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: addDirectMessageData,
    private userService: UserService,
    private chatService: ChatService,
  ) { }

  ngOnInit(): void {
    this.chatService.findMyDirectMessages(this.data.user.username).subscribe(dms => {
      let userIdSet = new Set<number>()
      if (dms) {
        dms.forEach((dm: RoomI) => {
          if (dm && dm.users) {
            dm.users?.forEach((user: UserI) => {
              if (user && user.id)
                userIdSet.add(user.id);
            })
          }
        })
      }
      this.DMAlreadyExistWithUser = userIdSet;
    });
    this.searchUsername.valueChanges.pipe( // gets triggerd everytime value changes
      debounceTime(500),                   // set 500ms before change is accepted
      distinctUntilChanged(),
      switchMap( (username: any) => this.userService.findByUsername(username).pipe(
        tap((users: UserI[]) => this.filteredUsers = (!users) ? [] : users.filter(
          user => (user && user.username != this.data.user.username && !this.DMAlreadyExistWithUser.has(user.id!))          
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
    this.filteredUsers = [];
    this.searchUsername.setValue(null);
  }

  clearSelectedUser() {
    this.filteredUsers = [];
    this.selectedUser = null;
    this.searchUsername.setValue(null);
  }

  onNoClick(): void {
    this.clearSelectedUser();
    this.dialogRef.close();
  }
}