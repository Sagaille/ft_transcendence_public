import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, findIndex, firstValueFrom, map, Observable, startWith, tap } from 'rxjs';
import { GameService } from 'src/app/game/game.service';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from 'src/app/user/user.interface';
import { messagePaginateI } from '../../model/message.interface';
import { RoomI } from '../../model/room.interface';
import { ChatHelperService } from '../../services/chat-service/chat-helper.service';
import { ChatService } from '../../services/chat-service/chat.service';
import { UpdateChatroomDialog } from '../update-room/update-chatroom.dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
	selector: 'app-chat-room',
	templateUrl: './chat-room.component.html',
	styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit, OnChanges, OnDestroy {

  @Input() selectedRoom: RoomI;
  @ViewChild('messages') private messageScroller: ElementRef;
  
  // when either `messageAdded` or `messages` gets trigger, emit the latest values from each as an array
  messagesPaginate$: Observable<messagePaginateI> = combineLatest(
    [this.chatService.getMessages(), this.chatService.getAddedMessage().pipe(startWith(null))]
  ).pipe(
    /* Content of the chatroom. map to apply sorting order */
    map(([messagePaginate, message]) => {
      if (message && message.room_id === this.selectedRoom.id &&
        !messagePaginate.items.some(m => m.id === message.id)) {  // check if message already existing
        messagePaginate.items.push(message);
      }

      const items = messagePaginate.items.sort((objA, objB) => new Date(objA?.createdAt!).getTime() - new Date(objB?.createdAt!).getTime());

      messagePaginate.items = items;
      return messagePaginate;
    })
  )

  chatMessage: string = '';
  openUserList: boolean;
  adminList: Set<number>;
  user: BehaviorSubject<UserI>;

  constructor(public authService: AuthService, private readonly chatService: ChatService,
    private router: Router, private activatedRoute: ActivatedRoute, private snackBar: MatSnackBar,
    private chatHelperService: ChatHelperService, private gameService: GameService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.user = this.authService.user$;
    this.openUserList = false;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
  }

  /* */
  ngOnChanges(changes: SimpleChanges): void {
    this.chatService.leaveRoom(changes['selectedRoom'].previousValue);
    this.openUserList = false;
    if (this.adminList)
      this.adminList.clear();
    if (this.selectedRoom) {
      this.chatService.joinRoom(this.selectedRoom);
      this.initAdminSet();
    }
  }

  /* */
  ngOnDestroy(): void {
    this.chatService.leaveRoom(this.selectedRoom);
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  /* read the user input and checks if User is able to send message or not */
  submitMessage(event: any) {

    /* Check if User is allowed to send messages */
    if (this.chatHelperService.isMuted(this.user.value, this.selectedRoom) == true) {
      this.chatHelperService.openSnackBar("You have been muted by an admin in this chatroom! Please wait until you allowed to submit meesage again.", '');
      return ;
    }

    /* Check if User is banned */
    if (this.chatHelperService.isBanned(this.user.value, this.selectedRoom) == true) {
      this.chatHelperService.openSnackBar("You have been permanently banned by an admin in this chatroom.", '');
      return ;
    }

    /* check Input Validity */
    let messageContent = event.target.value.trim();
    if (messageContent.length > 240) {
      this.chatHelperService.openSnackBar("A message must not exceed 240 characters.", '');
      return ;
    }
    this.chatMessage = '';
    if (messageContent.length < 1) return;

    /* Proceed to send message */
    this.chatService.sendMessage({ text: messageContent, room: this.selectedRoom, user: this.user.value });
    this.scrollToBottom();
  }

  leaveChatRoom(): void {
    this.chatHelperService.openSnackBar("Successfully left the chatroom!", '');
    // Leave the Room
    this.chatService.leaveChatRoom(this.selectedRoom!, this.user.value.id!);
    this.router.navigateByUrl("chat/dashboard");
  }

  /* helper for switching display of userlist */
  displayUserList(): void { this.openUserList = true; }
  hideUserList(): void { this.openUserList = false; }

  /* create a Set() of Adminusers from the selectedRoom */
  initAdminSet(): void {
    this.adminList = this.chatHelperService.initAdminSet(this.selectedRoom);
  }

  isAdmin(): boolean {
    if (this.user && this.user.value) {
      return this.chatHelperService.isAdmin(this.user.value, this.adminList);
    }
    return false;
  }

  isChannelOwner(): boolean {
    if (this.user && this.user.value) {
      return this.chatHelperService.isChannelOwner(this.user.value, this.selectedRoom);
    }
    return false;
  }

  /* Get Avatar from User object, if it doesn't exixts, return a default avatar */
  getUserProfileImg(user: UserI) {
    return this.chatHelperService.getUserProfileImg(user);
  }

  /* Get link to the User profile */
  goToUserProfile(user: UserI) {
    this.chatHelperService.goToUserProfile(user);
  }

  /* format the title of users when its not a DM. */
  formatUserTitles(user: UserI): string {
    return this.chatHelperService.formatUserTitles(user, this.selectedRoom, this.adminList);
  }

  /* Scroll screen to bottom after new chat message gets added */
  scrollToBottom(): void {
    // setTimeout(() => {this.messageScroller.nativeElement.scrollTop = this.messageScroller.nativeElement.scrollHeight}, 1);
  }

  /* format the name of chatroom depending on whether its a DM or not. */
  formatChatRoomName(room: RoomI): string {
    return this.chatHelperService.formatChatRoomName(room, this.user.value);
  }

  convertTime(timestamp: Date): string | null {
    return this.chatHelperService.convertTime(timestamp);
  }
  
  /* update ChatRoom Settings, if only user is channel Owner */
  openChatOption() {
    if (!this.isChannelOwner() || !this.selectedRoom) return ;
    const dialogRef = this.dialog.open(UpdateChatroomDialog, {
      width: '350px',
      data: this.selectedRoom, 
    });
    dialogRef.afterClosed().subscribe(res => {
    });
  }

  getDmTargetuser(): UserI | undefined {
    if (this.selectedRoom.type != 'directMessage' || !this.user || !this.user.value) return ;
    if (this.selectedRoom.users && this.selectedRoom.users.length > 0) {
      for (let u of this.selectedRoom.users!) {
        if (u && u.id && u.id != this.user.value.id) {
          return u;
        }
      }
    }
    return ;
  }

  spectateUser() {
		let username: string | undefined = this.getDmTargetuser()!.username;
		if (username != undefined) {
			this.gameService.spectatePlayer(username);
		}
	}

	inviteToPlay() {
		let target: UserI | undefined = this.getDmTargetuser()!;
		if (target && target.id)
			this.gameService.socket.emit('invitationPlayerStatus', { sender: this.user.value, receiver: target });
	}
}
