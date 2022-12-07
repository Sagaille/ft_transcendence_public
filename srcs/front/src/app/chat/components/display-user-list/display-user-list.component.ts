import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from 'src/app/user/user.interface';
import { UserService } from 'src/app/user/user.service';
import { RoomI } from '../../model/room.interface';
import { ChatHelperService } from '../../services/chat-service/chat-helper.service';
import { ChatService } from '../../services/chat-service/chat.service';

@Component({
  selector: 'app-display-user-list',
  templateUrl: './display-user-list.component.html',
  styles: [
  ]
})
export class DisplayUserListComponent implements OnInit {

  @Input() selectedRoom: RoomI;
  @Input() adminList: Set<number>;

  user: BehaviorSubject<UserI>;

  constructor(
    private authService: AuthService, private chatHelperService: ChatHelperService,
    private chatService: ChatService, private userService: UserService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.user = this.authService.user$;
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    // this.router.onSameUrlNavigation = 'reload';
  }

  getUserProfileImg(user: UserI): string {
    return this.chatHelperService.getUserProfileImg(user);
  }

  /* Get link to the User profile */
  goToUserProfile(user: UserI) {
    if (user && user.id && this.user && this.user.value && this.user.value.id && user.id == this.user.value.id) {
      this.chatHelperService.goMyProfileUrl(this.user.value);
    } else {
      this.chatHelperService.goToUserProfile(user);
    }
  }

  formatUserTitles(user: UserI): string {
    return this.chatHelperService.formatUserTitles(user, this.selectedRoom, this.adminList);
  }

  isAdmin(user: UserI): boolean {
    return this.chatHelperService.isAdmin(user, this.adminList);
  }

  isChannelOwner(user: UserI): boolean {
    return this.chatHelperService.isChannelOwner(user, this.selectedRoom);
  }

  /* Display either Unblock or Block depending on the current status */
  getBlockActionStatus(targetUser: UserI): string {
    if (this.chatHelperService.isUserBlock(this.user.value, targetUser) == true) {
      return 'Unblock';
    } else {
      return 'Block';
    }
  }

  /* Call function to block or unblock the user depending on current condition */
	toggleBlockUser(targetUser: UserI) {
    if (this.user && this.user.value && this.user.value.id && targetUser && targetUser.id) {
			if (this.chatHelperService.isUserBlock(this.user.value, targetUser) == true) {
				// Unblock
				this.chatService.unBlockUser(this.user.value.id, targetUser.id);
				// remove the targetUser from array and update behaviour object 
        this.user.value.blockingUsers = this.user.value.blockingUsers.filter((u) => u.id != targetUser.id)
			} else {
				// Block User
				this.chatService.blockUser(this.user.value.id, targetUser.id);
				// update behaviour object
				this.user.value.blockingUsers.push(targetUser);
			}
		}
	}

  getMuteStatus(targetUser: UserI) {
    if (this.chatHelperService.isMuted(targetUser, this.selectedRoom)) {
      return "Unmute";
    } else {
      return "Mute"
    }
  }

  toggleMuteUser(targetUser: UserI) {
    if (this.chatHelperService.isMuted(targetUser, this.selectedRoom)) {
      this.chatService.unmuteUser(this.selectedRoom, this.user.value, targetUser);
      return;
    }
    let options: muteUserOptions[] = [
      { value: 1, viewValue: '1 minute' },
      { value: 5, viewValue: '5 minutes' },
      { value: 60, viewValue: '1 hour' },
      { value: 60 * 24, viewValue: '1 day' },
    ]
    const dialogRef = this.dialog.open(MuteUserDialog, {
      width: '300px',
      data: { options: options, selectedValue: 0 },
    });
    dialogRef.afterClosed().subscribe(timeInMinutes => {
      if (timeInMinutes) {
        let endMuteAt = this.chatHelperService.addMinutes(timeInMinutes);
        this.chatService.muteUser(this.selectedRoom, this.user.value, targetUser, endMuteAt);
      }
    });
  }

  giveAdminRight(targetUser: UserI) {
    if (this.user && this.user.value && this.user.value.id && targetUser && targetUser.id) {
      if (this.isAdmin(this.user.value) && !this.adminList.has(targetUser.id)) {
        // Apply changes localy as well
        if (this.selectedRoom && this.selectedRoom.adminUsers) {
          this.selectedRoom.adminUsers.push(targetUser);
          if (this.adminList)
            this.adminList.add(targetUser.id);
          // call update on DB
          this.chatService.giveAdminRight(this.selectedRoom, this.user.value, targetUser);
        }
      }
    }
  }

  banUser(targetUser: UserI) {
    if (this.user && this.user.value && this.user.value.id && targetUser && targetUser.id) {
      if (this.isAdmin(this.user.value) || this.isChannelOwner(this.user.value)) {

        // Apply changes localy as well
        if (this.selectedRoom && this.selectedRoom.bannedUsers) {
          this.selectedRoom.bannedUsers.push(targetUser);
          if (this.adminList && this.isAdmin(targetUser))
            this.adminList.delete(targetUser.id); //remove from admin

          this.selectedRoom.bannedUsers.push(targetUser);
          // call update on DB
          this.chatService.banUser(this.selectedRoom, this.user.value, targetUser.id);
        }

      }
    }
  }
}

export interface muteUserOptions {
  value: number,
  viewValue: string,
}
@Component({
  selector: 'mute-user-dialog',
  templateUrl: 'mute-user-dialog.html',
})
export class MuteUserDialog {
  constructor(
    public dialogRef: MatDialogRef<MuteUserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
