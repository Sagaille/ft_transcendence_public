import { AfterViewInit, Component, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { RoomI, RoomPaginatedI } from 'src/app/chat/model/room.interface';
import { UserI } from 'src/app/user/user.interface';
import { AuthService } from 'src/app/login/auth.service';
import { ChatService } from '../../services/chat-service/chat.service';
import { Router } from '@angular/router';

// ES6 Modules or TypeScript
import Swal from 'sweetalert2'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnChanges, AfterViewInit {

  rooms$: Observable<RoomPaginatedI> = this.chatService.getMyRooms();
  user: UserI = this.authService.getLoggedInUser();
  selectedRoom$: Observable<RoomI> = this.chatService.getSelectedRoom();

  // MatPaginator Output
  pageEvent: PageEvent;

  constructor(private chatService: ChatService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.chatService.initDashboard(this.user);  //  initiate this service so we can track when the user disconnects
  }

  ngOnChanges(changes: SimpleChanges): void { }

  ngAfterViewInit() {
    this.chatService.emitPaginateRooms(10, 0);
    this.chatService.youGotBanned();
  }

  onRoomSelected(room: RoomI) {
    this.chatService.emitSelectedRoom(room);
  }

  // onPaginateRooms(pageEvent: PageEvent) {
  //   this.chatService.emitPaginateRooms(pageEvent.pageSize, pageEvent.pageIndex);
  //   return pageEvent;
  // }
}
