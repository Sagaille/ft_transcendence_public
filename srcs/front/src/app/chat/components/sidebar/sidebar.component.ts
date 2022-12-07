import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from 'src/app/user/user.interface';
import { RoomI, RoomPaginatedI } from '../../model/room.interface';
import { ChatService } from '../../services/chat-service/chat.service';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DirectMessageComponent } from '../direct-message/direct-message.component';
import { Router } from '@angular/router';
import { ChatHelperService } from '../../services/chat-service/chat-helper.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() roomsObs: Observable<RoomPaginatedI>;
  @Output() roomClicked: EventEmitter<any> = new EventEmitter();

  constructor(
    public authService: AuthService,
    private chatService: ChatService,
    public datepipe: DatePipe,
    public dialog: MatDialog,
    public router: Router,
    private chatHelperService: ChatHelperService,) { }
  
  searchText: string;
  rooms: RoomI[];

  user: BehaviorSubject<UserI>;

  ngOnInit(): void {
    this.user = this.authService.user$;
    this.roomsObs.subscribe(val => {
      // deal with async Observable result
      this.rooms = val.items;
    })
  }

  getUserProfile() { 
    if (this.user && this.user.value && this.user.value.avatar) {
      return this.user.value.avatar;  
    }
    return '../../../../assets/chat/noPic.svg'
  }

  get filteredRooms() {
    return this.rooms.filter((room) => {
      return (
        room.name!
          .toLowerCase()
          .includes(this.searchText.toLowerCase())
      );
    });
  }

  getChatRoomPicture(room: RoomI): string {
    let pathToImg = "../../../../assets/chat/noPic.svg";
    if (room.type == 'directMessage') {
      let dmWithUser = room.users?.find((user) => user.id != this.user.value.id);
      if (dmWithUser && dmWithUser.avatar)
        pathToImg = dmWithUser.avatar;
    } else {
      pathToImg = "../../../../assets/chat/icons8-group-64.png"
    }
    return pathToImg;
  }

  formatChatRoomName(room: RoomI): string {
    let nameOfChat: string = '';
    if (room.type == 'directMessage') {
      let dmWithUser = room.users?.find((user) => user.id != this.user.value.id);
      if (dmWithUser)
        nameOfChat = "".concat('DM | ', dmWithUser.username, ' (', dmWithUser.ingame_name, ')');
    } else {
      nameOfChat = "".concat(room.type!, ' | ', room.name!);
    }
    return nameOfChat;
  }

  convertTime(timestamp: Date) : string | null {
    return this.chatHelperService.convertTime(timestamp);
   }

  addDirectMessageDialog(): void {
    const dialogRef = this.dialog.open(DirectMessageComponent, {
      width: '300px',
      data: { user: this.user.value, userInput: ''}, 
    });

    dialogRef.afterClosed().subscribe((selectedUser: UserI) => {
      if (selectedUser)
        this.chatService.createDirectMessage(selectedUser);
    });
  }
  
  goMyProfileUrl() {
    if (this.user && this.user.value && this.user.value.username) {
      this.chatHelperService.goMyProfileUrl(this.user.value);
    }
  }
}
