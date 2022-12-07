import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { Socket, Server } from 'socket.io'
import { stringify } from 'querystring';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { RoomService } from '../service/room-service/room.service';
import { RoomI, RoomPaginatedI } from '../model/room.interface';
import { ConnectedUserI } from '../model/connected-user.interface';

import { ConnectedUserService } from '../service/connected-user/connected-user.service';
import { UserI } from 'src/user/user.interface';
import { PageI } from '../model/page.interface';
import { JoinedRoomService } from '../service/joined-room/joined-room.service';
import { MessageI } from '../model/message.interface';
import { JoinedRoomI } from '../model/joined-room.interface';
import { MessageService } from '../service/message/message.service';
import { MuteUserService } from '../service/mute-user/mute-user.service';
import { validatorDto } from 'src/auth/validator';
import { UserDTO } from 'src/user/user.dto';
import { CreateChatRoomDto } from '../model/dto/create-room.dto';
import { paginationDto } from '../model/dto/pagination.dto';
import { chatRoomDto, checkAdminRightDto, joinChatRoomDto, leaveChatRoomDto, muteUserDto, unmuteUserDto, updateChatRoomDto } from '../model/dto/chat-room.dto';
import { messageDto } from '../model/dto/message.dto';
import { blockUserDto } from '../model/dto/block-user.dto';

const bcrypt = require("bcrypt");

@WebSocketGateway({ cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] } })

export class ChatGateway implements OnGatewayDisconnect, OnModuleInit {

  @WebSocketServer()
  server: Server;

  constructor(
    private userService: UserService,
    private roomService: RoomService,
    private messageService: MessageService,
    private connectedUserService: ConnectedUserService,
    private joinedRoomService: JoinedRoomService,
    private muteUserService: MuteUserService,
  ) { }

  async onModuleInit() {
    /* clean connectedUser at start on module */
    await this.connectedUserService.deleteAll();
    await this.joinedRoomService.deleteAll();
  }

  /* Function of OnGatewayConnection: called on init of gateaway */
  async handleConnection(socket: Socket) {
    // console.log(`Chat Gateaway handle connection: Client connected: ${socket.id}`);
  }

  /* remove connection from database */
  async handleDisconnect(socket: Socket) {
    // console.log(`Chat Gateaway handleDisconnect: Client connected`);
    try {
      if (socket && socket.id)
        await this.connectedUserService.deleteBySocketId(socket.id);
    } catch (e) {
      let result = e.message; // error under useUnknownInCatchVariables
    }
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage('initDashboard')
  async getRooms(@ConnectedSocket() socket: Socket, @MessageBody() loginUser: UserI) {
    try {
      await validatorDto(UserDTO, loginUser, 'loginUser validation failed');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `initDashboard`');
    }

    try {
      const user: UserI = await this.userService.findByUserName(loginUser.username)
      if (!user) {
        console.log("Error in handleConnection: User not found");
        return this.disconnect(socket);
      } else {
        // store the user data in the socket, so we can use them for onCreateRoom() for ex.
        socket.data.user = user;
        const rooms = await this.roomService.getPaginatedRoomsForUser(user.id, { page: 1, limit: 10 });

        // save connection to database, if user is not added to the list of connectedUser.
        await this.connectedUserService.create(socket.id, user);

        // only emit rooms to the specific connected client
        return this.server.to(socket.id).emit('getMyRooms', rooms);
      }
    } catch (e) {
      let result = e.message; // error under useUnknownInCatchVariables
      console.log("Error in handleConnection")
      if (typeof e === "string") {
        console.log(e.toUpperCase()) // works, `e` narrowed to string
      } else if (e instanceof Error) {
        console.log(e.message) // works, `e` narrowed to Error
      }
      return this.disconnect(socket);
    }
  }

  /* Create room -> Send notification(update content) for all connected users */
  @SubscribeMessage('createRoom')
  async onCreateRoom(@ConnectedSocket() socket: Socket, @MessageBody() room: RoomI) {
    try {
      await validatorDto(CreateChatRoomDto, room, 'create chatroom validation failed');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `createRoom`');
    }

    // has password if exists
    if (room.password) {
      // generate salt to hash password
      const salt = await bcrypt.genSalt(10);
      room.password = await bcrypt.hash(room.password, salt);
    }
    const createdRoom: RoomI = await this.roomService.createRoom(room, socket.data.user);

    /* Amoung all users in the created chatroom, check if users are connected */
    for (const user of createdRoom.users) {
      const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);

      const rooms = await this.roomService.getPaginatedRoomsForUser(user.id, { page: 1, limit: 10 });
      for (const connection of connections) {
        await this.server.to(connection.socketId).emit('getMyRooms', rooms);
      }
    }
  }

  /* Create room -> Send notification(update content) for all connected users */
  @SubscribeMessage('createDirectMessage')
  async onCreateDirectMessage(@ConnectedSocket() socket: Socket, @MessageBody() userTarget: UserI) {
    try {
      await validatorDto(UserDTO, userTarget, 'createDirectMessage validation failed: UserDTO error');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `createDirectMessage`');
    }

    const createdRoom: RoomI = await this.roomService.createDirectMessage(userTarget, socket.data.user);

    /* Amoung all users in the created chatroom, check if users are connected */
    for (const user of createdRoom.users) {
      const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);

      const rooms = await this.roomService.getPaginatedRoomsForUser(user.id, { page: 1, limit: 10 });
      for (const connection of connections) {
        await this.server.to(connection.socketId).emit('getMyRooms', rooms);
      }
    }

  }

  /* Return list of Rooms the user jas joined */
  @SubscribeMessage('paginateRooms')
  async onPaginateRoom(@ConnectedSocket() socket: Socket, @MessageBody() page: PageI) {
    try {
      await validatorDto(paginationDto, page, 'paginateRooms validation failed: paginationDTo error');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `paginateRooms`');
    }
    if (!socket || !socket.data || !socket.data.user || !socket.data.user.id) {
      console.log("Info: @SubscribeMessage('paginateRooms'): Cannot access socket.data.user.id");
      return;
    }
    const rooms = await this.roomService.getPaginatedRoomsForUser(socket.data.user.id, this.handleIncomingPageRequest(page));
    return this.server.to(socket.id).emit('getMyRooms', rooms);
  }

  /* Return list of Rooms the user jas joined */
  @SubscribeMessage('paginatePublicRooms')
  async onPaginatePublicRoom(@ConnectedSocket() socket: Socket, @MessageBody() page: PageI) {
    try {
      await validatorDto(paginationDto, page, 'paginatePublicRooms validation failed: paginationDTo error');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `paginatePublicRooms`');
    }

    if (!socket || !socket.data || !socket.data.user || !socket.data.user.id) {
      console.log("Info: @SubscribeMessage('paginatePublicRooms'): Cannot access socket.data.user.id");
      return;
    }
    const rooms = await this.roomService.getPaginatedPublicRooms(socket.data.user.id);
    return this.server.to(socket.id).emit('getPublicRooms', rooms);
  }

  /* Return the selectedRoom from the chat-room page */
  @SubscribeMessage('selectedRoom')
  async onSelectedRoom(@ConnectedSocket() socket: Socket, @MessageBody() room: RoomI) {
    if (!room) return ;
    try {
      await validatorDto(chatRoomDto, room, 'selectedRoom validation failed: chatRoomDto error');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `selectedRoom`');
    }

    if (!socket || !socket.data || !socket.data.user || !socket.data.user.id) {
      console.log("Info: @SubscribeMessage('selectedRoom'): Cannot access socket.data.user.id");
      return;
    }
    const selectedRoom = await this.roomService.getRoom(room.id);
    return this.server.to(socket.id).emit('getSelectedRoom', selectedRoom);
  }


  /* TODO: Rename it to more of a 'session' join */
  @SubscribeMessage('joinRoom')
  async onJoinRoom(@ConnectedSocket() socket: Socket, @MessageBody() room: RoomI) {
    try {
      await validatorDto(chatRoomDto, room, 'joinRoom validation failed: chatRoomDto error');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `joinRoom`');
    }

    const messages = await this.messageService.getPaginatedMessages(room, { limit: 10, page: 1 });

    // save connection to room (database)
    const joinedRoom = {
      socketId: socket.id,
      user: socket.data.user,
      room: room
    }
    await this.joinedRoomService.create(joinedRoom);

    //send last messages from Room to User
    await this.server.to(socket.id).emit('messages', messages);
  }

  /* TODO: Rename it to more of a 'session' join */
  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(@ConnectedSocket() socket: Socket) {
    if (!socket || !socket.id) {
      console.log("Info: @SubscribeMessage('leaveRoom'): Cannot access socket.id");
      return;
    }
    await this.joinedRoomService.deleteBySocketId(socket.id);
  }


  /* join chat room */
  @SubscribeMessage('joinChatRoom')
  async onJoinChatRoom(@ConnectedSocket() socket: Socket, @MessageBody() { room, userId, passwordTyped }) {

    try {
      await validatorDto(joinChatRoomDto, { room, userId, passwordTyped }, 'joinChatRoom validation failed: chatRoomDto error');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `joinChatRoom`');
    }

    const user = await this.userService.getOne(userId);
    const roomToJoin = await this.roomService.getRoom(room.id);
    if (user && roomToJoin) {
      if (roomToJoin.type == 'protected' && passwordTyped) {  //pass required
        // check user password with hashed password stored in the database
        const validPassword = await bcrypt.compare(passwordTyped, roomToJoin.password);
        if (validPassword) {
          //send feedback to User
          console.log("Valid password");
          await this.server.to(socket.id).emit('passwordFeedback', { status: 200, message: "Valid password" });
          await this.roomService.joinChatRoom(roomToJoin, user);

          const rooms = await this.roomService.getPaginatedPublicRooms(socket.data.user.id);
          return this.server.to(socket.id).emit('getPublicRooms', rooms);
        } else {
          console.log("Wrong password");
          await this.server.to(socket.id).emit('passwordFeedback', { status: 400, message: "Invalid Password" });
        }
      } else {  //no pass required
        await this.roomService.joinChatRoom(roomToJoin, user);
      }
    }
  }

  /* leave chat room */
  @SubscribeMessage('leaveChatRoom')
  async onLeaveChatRoom(@ConnectedSocket() socket: Socket, @MessageBody() { room, userId }) {
    try {
      await validatorDto(leaveChatRoomDto, { room, userId }, 'leaveChatRoom validation failed: leaveChatRoomDto error');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `leaveChatRoom`');
    }
    // remove connection from JoinedRooms
    const user = await this.userService.getOne(userId);
    await this.roomService.leaveChatRoom(room, user);

    // Update for all Users connnected to Room
    const selectedRoom = await this.roomService.getRoom(room.id);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);
    for (const user of joinedUsers) {
      await this.server.to(user.socketId).emit('getSelectedRoom', selectedRoom);
    }
  }

  /* update chat room */
  @SubscribeMessage('updateChatRoom')
  async onUpdateChatRoom(@ConnectedSocket() socket: Socket, @MessageBody() { room, userId }) {
    try {
      await validatorDto(updateChatRoomDto, { room, userId }, 'updateChatRoom validation failed: updateChatRoomDto error');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `updateChatRoom`');
    }
    // Check whether User has right (is Channel owner)
    try {
      let selectedRoom: RoomI = await this.roomService.getRoom(room.id);
      if (selectedRoom.ownedByUser && selectedRoom.ownedByUser.id != userId) {
        throw new UnauthorizedException('Invalid Request: User is not owner of the chatroom!');
      }
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('updateChatRoom validation failed: updateChatRoomDto error');
    }

    // has password if exists
    if (room.password) {
      // generate salt to hash password
      const salt = await bcrypt.genSalt(10);
      room.password = await bcrypt.hash(room.password, salt);
    }

    await this.roomService.updateChatRoom(room);

    // Update for all Users connnected to Room
    const selectedRoom = await this.roomService.getRoom(room.id);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);
    for (const user of joinedUsers) {
      await this.server.to(user.socketId).emit('getSelectedRoom', selectedRoom);
    }
  }

  /* add new Admin to chat room */
  @SubscribeMessage('giveAdminRight')
  async onGiveAdminRight(@ConnectedSocket() socket: Socket, @MessageBody() { roomId, byUserId, targetUserId }) {
    try {
      await validatorDto(checkAdminRightDto, { roomId, byUserId, targetUserId }, 'checkAdminRight validation failed: checkAdminRightDto error');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `giveAdminRight`');
    }

    // Check whether User has right (is Admin or Channel owner)
    try {
      const user: UserI = await this.userService.getOne(byUserId);
      let isAdmin = false;
      if (user && user.admin_of_room) {
        for (let r of user.admin_of_room) {
          if (r.id == roomId) isAdmin = true;
        }
      }
      let isOwner = false;
      if (user && user.ownerRoom) {
        for (let r of user.ownerRoom) {
          if (r.id == roomId) isAdmin = true;
        }
      }
      if (!isAdmin && !isOwner) {
        throw new UnauthorizedException('Invalid Request: User is not admin of the chatroom!');
      }
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('giveAdminRight validation failed');
    }

    const selectedRoom = await this.roomService.getRoom(roomId);
    await this.roomService.giveAdminRight(selectedRoom, targetUserId);
    const updatedRoom = await this.roomService.getRoom(roomId);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(updatedRoom);
    for (const user of joinedUsers) {
      await this.server.to(user.socketId).emit('getSelectedRoom', updatedRoom);
    }
  }

  /* ban user from chat room */
  @SubscribeMessage('banUser')
  async onBanUser(@ConnectedSocket() socket: Socket, @MessageBody() { roomId, byUserId, targetUserId }) {

    try {
      await validatorDto(checkAdminRightDto, { roomId, byUserId, targetUserId }, 'checkAdminRight validation failed: checkAdminRightDto error');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `banUser`');
    }

    // Check whether User has right (is Admin or Channel owner)
    try {
      const user: UserI = await this.userService.getOne(byUserId);
      let isAdmin = false;
      if (user && user.admin_of_room) {
        for (let r of user.admin_of_room) {
          if (r.id == roomId) isAdmin = true;
        }
      }
      let isOwner = false;
      if (user && user.ownerRoom) {
        for (let r of user.ownerRoom) {
          if (r.id == roomId) isAdmin = true;
        }
      }
      if (!isAdmin && !isOwner) {
        throw new UnauthorizedException('Invalid Request: User is not admin of the chatroom!');
      }
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('banUser validation failed');
    }
    const selectedRoom = await this.roomService.getRoom(roomId);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(selectedRoom);
    await this.roomService.banUserFromChat(selectedRoom, targetUserId);
    const updatedRoom = await this.roomService.getRoom(roomId);
    for (const user of joinedUsers) {
      if (user.user.id == targetUserId)
      {
        await this.server.to(user.socketId).emit("youGotBanned", "");
      } else {
        await this.server.to(user.socketId).emit('getSelectedRoom', updatedRoom);
      }
    }
  }

  /* mute User in chat room */
  @SubscribeMessage('muteUser')
  async onMuteUser(@ConnectedSocket() socket: Socket, @MessageBody() { roomId, byUserId, targetUserId, endMuteAt }) {

    try {
      await validatorDto(muteUserDto, { roomId, byUserId, targetUserId, endMuteAt }, 'muteUser validation failed: muteUserDto error');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `muteUser`');
    }

    // Check whether User has right (is Admin or Channel owner)
    try {
      const user: UserI = await this.userService.getOne(byUserId);
      let isAdmin = false;
      if (user && user.admin_of_room) {
        for (let r of user.admin_of_room) {
          if (r.id == roomId) isAdmin = true;
        }
      }
      let isOwner = false;
      if (user && user.ownerRoom) {
        for (let r of user.ownerRoom) {
          if (r.id == roomId) isAdmin = true;
        }
      }
      if (!isAdmin && !isOwner) {
        throw new UnauthorizedException('Invalid Request: User is not admin of the chatroom!');
      }
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('muteUser validation failed');
    }

    await this.muteUserService.muteUser(roomId, targetUserId, endMuteAt);
    const selectedRoom = await this.roomService.getRoom(roomId);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(selectedRoom);
    for (const user of joinedUsers) {
      await this.server.to(user.socketId).emit('getSelectedRoom', selectedRoom);
    }
  }

  /* add new Admin to chat room */
  @SubscribeMessage('unmuteUser')
  async onUnmuteUser(@ConnectedSocket() socket: Socket, @MessageBody() { roomId, byUserId, targetUserId }) {
    try {
      await validatorDto(unmuteUserDto, { roomId, byUserId, targetUserId }, 'unmuteUser validation failed: unmuteUserDto error');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `unmuteUser`');
    }

    // Check whether User has right (is Admin or Channel owner)
    try {
      const user: UserI = await this.userService.getOne(byUserId);
      let isAdmin = false;
      if (user && user.admin_of_room) {
        for (let r of user.admin_of_room) {
          if (r.id == roomId) isAdmin = true;
        }
      }
      let isOwner = false;
      if (user && user.ownerRoom) {
        for (let r of user.ownerRoom) {
          if (r.id == roomId) isAdmin = true;
        }
      }
      if (!isAdmin && !isOwner) {
        throw new UnauthorizedException('Invalid Request: User is not admin of the chatroom!');
      }
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('unmuteUser validation failed');
    }

    await this.muteUserService.unmuteUser(roomId, targetUserId);
    const selectedRoom = await this.roomService.getRoom(roomId);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(selectedRoom);
    for (const user of joinedUsers) {
      await this.server.to(user.socketId).emit('getSelectedRoom', selectedRoom);
    }
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(@ConnectedSocket() socket: Socket, @MessageBody() message: MessageI) {

    try {
      await validatorDto(messageDto, message, 'addMessage validation failed: messageDto error');
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('validator error on `addMessage`');
    }

    // add `user` to the object message (using spread operator)
    const createdMessage: MessageI = await this.messageService.create(message);
    const room: RoomI = await this.roomService.getRoom(createdMessage.room.id);

    /* send new Message to all joined users of the room (currently online) */
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);
    for (const user of joinedUsers) {
      await this.server.to(user.socketId).emit('messageAdded', createdMessage);
    }
  }

  /* block User */
  @SubscribeMessage('blockUser')
  async onblockUser(@ConnectedSocket() socket: Socket, @MessageBody() { byUserId, targetUserId }) {
    
    try {
			await validatorDto(blockUserDto, { byUserId, targetUserId }, 'blockUserDto validation failed: blockUser error');
		} catch (errors) {
			console.log(errors);
			throw new UnauthorizedException('validator error on `blockUser`');
		}

    try {
      await this.userService.blockUser(byUserId, targetUserId);
    } catch (errors) {
      console.log(errors);
      throw new UnauthorizedException('blockUser failed');
    } 

    // await this.server.to(user.socketId).emit('getSelectedRoom', selectedRoom);
  }

   /* block User */
   @SubscribeMessage('unBlockUser')
   async onUnBlockUser(@ConnectedSocket() socket: Socket, @MessageBody() { byUserId, targetUserId }) {
     
     try {
       await validatorDto(blockUserDto, { byUserId, targetUserId }, 'blockUserDto validation failed: unBlockUser error');
     } catch (errors) {
       console.log(errors);
       throw new UnauthorizedException('validator error on `unBlockUser`');
     }
 
     try {
       await this.userService.unBlockUser(byUserId, targetUserId);
     } catch (errors) {
       console.log(errors);
       throw new UnauthorizedException('unBlockUser failed');
     } 
 
     // await this.server.to(user.socketId).emit('getSelectedRoom', selectedRoom);
   }

  private handleIncomingPageRequest(page: PageI) {
    page.limit = page.limit > 100 ? 100 : page.limit;
    // add +1 to match Angular Material Paginator
    page.page = page.page + 1;
    return page
  }
}
