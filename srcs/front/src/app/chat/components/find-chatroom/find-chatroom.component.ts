import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from 'src/app/user/user.interface';
import { RoomI, RoomPaginatedI } from '../../model/room.interface';
import { ChatHelperService } from '../../services/chat-service/chat-helper.service';
import { ChatService } from '../../services/chat-service/chat.service';

@Component({
  selector: 'app-find-chatroom',
  templateUrl: './find-chatroom.component.html',
  styleUrls: ['./find-chatroom.component.scss']
})
export class FindChatroomComponent implements OnInit, AfterViewInit {

  user: BehaviorSubject<UserI>;
  rooms$: Observable<RoomPaginatedI> = this.chatService.getPublicRooms();
  joinRoomStatus$: Observable<any> = this.chatService.getJoinChatRoomFeedback();

  selectedRoom: RoomI | null = null;
  // MatPaginator Output
  pageEvent: PageEvent;

  constructor(
    public authService: AuthService, private chatService: ChatService, private chatHelperService: ChatHelperService,
    public dialog: MatDialog, private snackBar: MatSnackBar,
    private router: Router, private activatedRoute: ActivatedRoute) { }


  ngOnInit(): void {
    this.user = this.authService.user$;
    this.chatService.emitPaginatePublicRooms(10, 0);

  }

  ngAfterViewInit() {
    this.chatService.emitPaginatePublicRooms(10, 0);
  }

  /* selected room from list of rooms */
  onSelectRoom(event: MatSelectionListChange) {
    this.selectedRoom = event.source.selectedOptions.selected[0].value;
  }

  // onPaginateRooms(pageEvent: PageEvent) {
  //   this.chatService.emitPaginatePublicRooms(pageEvent.pageSize, pageEvent.pageIndex);
  //   return pageEvent;
  // }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action , {
       duration: 3000
    });
  }

  joinRoomDialog(): void {
    const dialogRef = this.dialog.open(JoinChatroomDialog, {
      width: '300px',
      data: { room: this.selectedRoom, user: this.user, hide: true },
    });
    dialogRef.afterClosed().subscribe(password => {
      if (!password) {
        console.log("password missing from joinRoomDialog");
        return ;
      }
      this.chatService.joinChatRoom(this.selectedRoom!, this.user.value.id!, password);

      this.joinRoomStatus$.subscribe((data) => {
        if (data && data.status == 200) {
          this.chatHelperService.openSnackBar("Successfully joined chatroom!", '');
          this.router.navigate(['../dashboard'], {relativeTo: this.activatedRoute}); 
        } else if (data && data.status == 400) {
          this.chatHelperService.openSnackBar("Invalid Password", '');
        }
      })

    }) 
  };

  joinChatRoom(): void {
    this.chatService.joinChatRoom(this.selectedRoom!, this.user.value.id!, '');
    this.openSnackBar("Successfully joined chatroom!", '');
    this.router.navigate(['../dashboard'], {relativeTo: this.activatedRoute}); 
  }
}


export interface joinRoomData {
  room: RoomI;
  user: UserI;
  passwordInput: string;
  hide: boolean;
}

@Component({
  selector: 'join-chatroom-dialog',
  templateUrl: 'join-chatroom-dialog.html',
})
export class JoinChatroomDialog {
  constructor(
    public dialogRef: MatDialogRef<JoinChatroomDialog>,
    @Inject(MAT_DIALOG_DATA) public data: joinRoomData,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
