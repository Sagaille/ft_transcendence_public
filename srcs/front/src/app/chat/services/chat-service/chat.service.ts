import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable } from 'rxjs';
import { RoomI, RoomPaginatedI } from 'src/app/chat/model/room.interface';
import { MessageI, messagePaginateI } from 'src/app/chat/model/message.interface';
import { CustomSocket } from '../../sockets/custom-socket';
import { UserI } from 'src/app/user/user.interface';
import { UserService } from 'src/app/user/user.service';
import { AuthService } from 'src/app/login/auth.service';
import { HttpClient } from '@angular/common/http';
import { ChatHelperService } from './chat-helper.service';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient, private socket: CustomSocket,
    private chatHelperService: ChatHelperService, private router: Router, private activatedRoute: ActivatedRoute) { }

  connectSocket() {
    this.socket.connect();
  }
  
  disconnectSocket() {
    this.socket.disconnect();
  }

  /* Expect .emit('messageAdded', createdMessage) from backend */
  sendMessage(message: MessageI) {
    this.socket.emit('addMessage', message);
  }

  /* Expect emit('messages', messages) from backend */
  joinRoom(room: RoomI) {
    this.socket.emit('joinRoom', room);
  }

  leaveRoom(room: RoomI) {
    this.socket.emit('leaveRoom', room);
  }
  
  createRoom(room: RoomI) {
    this.socket.emit('createRoom', room);
    this.chatHelperService.openSnackBar(`Room ${room.name} created successfully`, 'Close');
  }

  createDirectMessage(userTarget: UserI) {
    this.socket.emit('createDirectMessage', userTarget);
    this.chatHelperService.openSnackBar(`DM with ${userTarget.username} created successfully`, 'Close');
  }

  joinChatRoom(room: RoomI, userId: number, password: string) {
    this.socket.emit('joinChatRoom', { room: room, userId: userId, passwordTyped: password});
  }

  getJoinChatRoomFeedback(): Observable<any> {
    return this.socket.fromEvent('passwordFeedback');
  }

  leaveChatRoom(room: RoomI, userId: number) {
    this.socket.emit('leaveChatRoom', { room: room, userId: userId});
  }

  /* To Verify with the help of DTO. In case of Type and pass change, verify the condition */
  updateChatRoom(room: RoomI, userId: number) {
    this.socket.emit('updateChatRoom', { room: room, userId: userId });
  }

  giveAdminRight(selectedRoom: RoomI, byUser: UserI, userTarget: UserI) {
    this.socket.emit('giveAdminRight', { roomId: selectedRoom.id, byUserId: byUser.id, targetUserId: userTarget.id});
  }

  banUser(selectedRoom: RoomI, byUser: UserI, targetUserId: number) {
    this.socket.emit('banUser', { roomId: selectedRoom.id, byUserId: byUser.id, targetUserId: targetUserId});
  }
  
  youGotBanned() {
    this.socket.on('youGotBanned', (response: any) => {
      this.router.navigateByUrl("chat/dashboard");
    });
  }

  muteUser(selectedRoom: RoomI, byUser: UserI, targetUser: UserI, endMuteAt: Date) {
    this.socket.emit('muteUser',
      { roomId: selectedRoom.id, byUserId: byUser.id, targetUserId: targetUser.id, endMuteAt: endMuteAt}
    );
  }
  
  unmuteUser(selectedRoom: RoomI, byUser: UserI, targetUser: UserI) {
    this.socket.emit('unmuteUser',
      { roomId: selectedRoom.id, byUserId: byUser.id, targetUserId: targetUser.id }
    );
  }

  getMessages(): Observable<messagePaginateI> {
    return this.socket.fromEvent<messagePaginateI>('messages');
  }

  getAddedMessage(): Observable<MessageI> {
    return this.socket.fromEvent<MessageI>('messageAdded');
  }

  /* first call to dashbaord */
  initDashboard(user: UserI) {
    this.socket.emit('initDashboard', user);
  }

  /* Get List of rooms */
  emitPaginateRooms(limit: number, page: number) {
    this.socket.emit('paginateRooms', { limit, page });
  }

  getMyRooms(): Observable<RoomPaginatedI> {
    return this.socket.fromEvent<RoomPaginatedI>('getMyRooms')
  }

  /* Get Selected Room */
  emitSelectedRoom(room: RoomI) {
    this.socket.emit('selectedRoom', room);
  }

  getSelectedRoom(): Observable<RoomI> {
    return this.socket.fromEvent<RoomI>('getSelectedRoom')
  }

  /* Get list of public + protected Rooms available */
  emitPaginatePublicRooms(limit: number, page: number) {
    this.socket.emit('paginatePublicRooms', { limit, page });
  }

  getPublicRooms(): Observable<RoomPaginatedI> {
    return this.socket.fromEvent<RoomPaginatedI>('getPublicRooms')
  }

  findMyDirectMessages(username: string): Observable<RoomI[]> {
		return this.http.get<RoomI[]>(`http://localhost:3000/chat/find-my-dm?username=${username}`);
	}

  blockUser(byUserId: number, targetUserId: number) {
    this.socket.emit('blockUser', {byUserId, targetUserId});
  }

  unBlockUser(byUserId: number, targetUserId: number) {
    this.socket.emit('unBlockUser', {byUserId, targetUserId});
  }
}
