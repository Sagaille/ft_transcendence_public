import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserI } from 'src/app/user/user.interface';
import { RoomI } from '../../model/room.interface';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root'
})
export class ChatHelperService {

  constructor(public datepipe: DatePipe, private router: Router, private snackbar: MatSnackBar) { }

  /* Get Avatar from User object, if it doesn't exixts, return a default avatar */ 
  getUserProfileImg(user: UserI): string { 
    if (user && user.avatar) {
      return user.avatar;  
    }
    return '../../../assets/chat/noPic.svg';
  }

  /* Get link to the User profile */ 
  goToUserProfile(user: UserI) {
    let path: string = user.username;
    if (user && user.username) {
      this.router.navigateByUrl("/profile/"+ path)
    }
  }

  goMyProfileUrl(user: UserI) {
    if (user && user.username) {
      this.router.navigateByUrl("/user")
    }
  }

  /* format the name of chatroom depending on whether its a DM or not. */
  formatChatRoomName(room: RoomI, user: UserI): string {
    let nameOfChat: string = '';
    if (room.type == 'directMessage') {
      let dmWithUser = room.users?.find((u) => u.id != user.id);
      if (dmWithUser)
        nameOfChat = "".concat('DM | ', dmWithUser.username, ' (', dmWithUser.ingame_name, ')');
      else {
        nameOfChat = "User left";
      }
    } else {
      nameOfChat = "".concat(room.type!, ' | ', room.name!);
    }
    return nameOfChat;
  }

  formatUserTitles(user: UserI, room: RoomI, adminList: Set<number>): string {
    let titles = '';
    if (room.type != 'directMessage') {
      if (room.ownedByUser?.id == user.id) {
        titles = "Channel Owner";
      }
      if (this.isAdmin(user, adminList)) {
        if (titles)
          titles = titles.concat(" | ", "Admin");
        else
          titles = titles.concat("Admin");
      }
    }
    return titles;
  }

  /* create a Set() of Adminusers from the selectedRoom */
  initAdminSet(selectedRoom: RoomI): Set<number> {
    let adminList = new Set<number>;
    selectedRoom.adminUsers?.forEach((admin) => {
      if (admin.id)
        adminList.add(admin.id);
    })
    return adminList;
  }

  isAdmin(user: UserI, adminList: Set<number>): boolean {
    if (user && user.id && adminList) {
      return (adminList.has(user.id));
    }
    return false;
  }

  isChannelOwner(user: UserI, selectedRoom: RoomI): boolean {
    if (user && user.id && selectedRoom && selectedRoom.ownedByUser && selectedRoom.ownedByUser.id) {
      return (selectedRoom.ownedByUser.id == user.id)
    }
    return false;
  }

  /* check if I am blocking userTarget */
  isUserBlock(me: UserI, targetUser: UserI): boolean {
    if (me.blockingUsers) {
      for (let u of me.blockingUsers) {
        if (u && u.id == targetUser.id) return true;
      }
    }
    return false;
  }

  /* check if userTarget is muted in the chat */
  isMuted(targetUser: UserI, selectedRoom: RoomI): boolean {
    if (targetUser && targetUser.id && selectedRoom && selectedRoom.mutedUsers) {
      for (let u of selectedRoom.mutedUsers) {
        if (u && u.mutedUserId == targetUser.id && selectedRoom.id == u.roomId) {
          if (new Date(u.endAt) > new Date()) {
            return true; 
          }
        }
      }
    }
    return false;
  }

  /* check if userTarget is banned in the chat */
  isBanned(targetUser: UserI, selectedRoom: RoomI): boolean {
    if (targetUser && targetUser.id && selectedRoom && selectedRoom.bannedUsers) {
      for (let u of selectedRoom.bannedUsers) {
        if (u && u.id == targetUser.id) {
            return true; 
        }
      }
    }
    return false;
  }
  
  /* Return a Set of BlockList */
  getListOfBlock(user: UserI): Set<number> {
    let blockList = new Set<number>;
    user.blockingUsers?.forEach((u) => {
      if (u.id)
      blockList.add(u.id);
    })
    return blockList;
  }

  convertTime(timestamp: Date) : string | null {
    let now = new Date();
    let tmp = new Date(timestamp);
    if (now.getFullYear() === tmp.getFullYear() && now.getMonth() === tmp.getMonth() && now.getDate() === tmp.getDate()) {
      return this.datepipe.transform(timestamp, 'h:mm a');
    }
    return this.datepipe.transform(timestamp, 'dd/MM/yyyy');
   }

  addHours(numOfHours: number, date = new Date()) {
    date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
    return date;
  }

  addMinutes(numOfMinutes: number, date = new Date()) {
    date.setTime(date.getTime() + numOfMinutes * 60 * 1000);
    return date;
  }

  openSnackBar(message: string, action: string) {
    this.snackbar.open(message, action, {
      duration: 3000
    });
  }
}
