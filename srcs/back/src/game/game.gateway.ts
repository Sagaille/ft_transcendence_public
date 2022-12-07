import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { GameService } from './game.service';
import { Socket, Server } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
import { PlayerI, PlayerStatus } from './interfaces/player.interface';
import { GameStatus } from './interfaces/game.interface';
import { PlayerService } from './player/player.service';

@WebSocketGateway({ cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] } })
export class GameGateway {
	constructor(
		private readonly gameService: GameService,
		private readonly userService: UserService,
		private readonly playerService: PlayerService,
	) { }

	@WebSocketServer()
	server: Server;

	async handleDisconnect(socket: Socket) {
		if ( this.playerService.socketsUser[socket.id]) {
			let userID: number = this.playerService.socketsUser[socket.id].id;
			let user: User = await this.userService.getOneById(userID);
			if (!user)
				return;
			console.log(`client: ${user.username} excluded from Game gateway | socketID: ${socket.id}`);
			if (this.playerService.isUserInTab(user, this.playerService.playersSpectate)) {
				this.playerService.removeSpecator(user);
			}
			if (this.playerService.isUserInTab(user, this.playerService.playersInQueue)) {
				this.playerService.removeFromTab(user, this.playerService.playersInQueue);
			}
			this.playerService.usersSocket[user.username] = undefined;
			this.playerService.socketsUser[socket.id] = undefined;
			user.status = 'offline';
			this.userService.updateUser(user);
		}
	}

	//======================= Game Part =======================//

	@SubscribeMessage('userConnectToPlayPong')
	userConnectToPlay(@ConnectedSocket() client: Socket) {
		// console.log("________Currently Queing_________________");
		// this.playerService.showPlayersInQueue();
		// console.log("________Currently Playing________________");
		// this.playerService.showPlayersInGame();
		// console.log("________Currently Watching________________");
		// this.playerService.showPlayersInSpectate();
	}

	@SubscribeMessage('saveClient')
	saveClient(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		let user: User = data['user'];
		if (!this.playerService.usersSocket[user.username] || this.playerService.usersSocket[user.username].id != client.id) {
			console.log(`client: ${user.username} registered on Game Gateway | socketID: ${client.id}`);
			this.playerService.addUserSocket(user, client);
		}
		this.playerService.userStatusCheck(user);
	}

	//======================= Friendly Game Part =======================//

	@SubscribeMessage('friendGameInvitation')
	friendlyGameInvitation(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		let sender: User = data['sender'];
		let receiver: User = data['receiver'];
		let receiverClient: Socket = this.playerService.usersSocket[receiver.username];
		if (receiverClient)
			receiverClient.emit('getFriendInvitation', sender);
	}

	@SubscribeMessage('friendGameAcceptation')
	friendlyGame(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		let sender: User = data['sender'];
		let receiver: User = data['receiver'];

		if (sender.status != PlayerStatus.ONLINE || receiver.status != PlayerStatus.ONLINE) {
			console.log('At least one of the player cannot join the game');
			return;
		}
		else {
			let senderClient: Socket = this.playerService.usersSocket[sender.username];
			if (senderClient)
				senderClient.emit('navigateTo', ['/game']);
			let receiverClient: Socket = this.playerService.usersSocket[receiver.username];
			if (receiverClient)
				receiverClient.emit('navigateTo', ['/game']);

			let player1: PlayerI = this.playerService.userToPlayer(sender);
			let player2: PlayerI = this.playerService.userToPlayer(receiver);
			player1.user.status = PlayerStatus.PLAYING;
			player2.user.status = PlayerStatus.PLAYING;
			this.playerService.playersPlaying.push(player1);
			this.playerService.playersPlaying.push(player2);
			this.playerService.userStatusCheck(player1.user);
			this.playerService.userStatusCheck(player2.user);
			this.gameService.createGame(player1, player2);
		}
	}
	@SubscribeMessage('friendGameDecline')
	friendlyGameDecline(@ConnectedSocket() client: Socket, @MessageBody() data: User) {
		let sender: User = data['sender'];
		let receiver: User = data['receiver'];
		let senderClient: Socket = this.playerService.usersSocket[sender.username];
		if (senderClient)
			senderClient.emit('invitationDecline', receiver);
	}

	@SubscribeMessage('invitationPlayerStatus')
	async invitationPlayerStatus(@ConnectedSocket() client: Socket, @MessageBody() data: User) {
		let sender = await this.userService.getOneById(data['sender'].id);
		let receiver = await this.userService.getOneById(data['receiver'].id);
		if (sender.status == PlayerStatus.ONLINE && receiver.status == PlayerStatus.ONLINE)
			client.emit('invitationPlayerStatus', { sender: sender, receiver: receiver });
		else
			client.emit('invitationStatusFailed');
	}
	//======================= END Friendly Game Part =======================//

	@SubscribeMessage('checkStatus')
	checkStatus(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		let user: User = data['user'];
		if (user.status == PlayerStatus.SPECTATE)
			this.playerService.removeSpecator(user);
	}

	@SubscribeMessage('joinQueue')
	startMatchmaking(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		let user: User = data['user'];
		if (user.status == PlayerStatus.ONLINE) {
			this.customData[user.username] = undefined;
			this.playerService.addPlayerToQueue(user);
			this.playerService.checkQueue(this.customData);
		}
		this.playerService.showPlayersInQueue();
	}

	@SubscribeMessage('quitQueue')
	quitMatchmaking(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		let user: User = data['user'];
		if (user.status == PlayerStatus.INQUEUE) {
			this.playerService.removeFromTab(user, this.playerService.playersInQueue);
			this.customData[user.username] = undefined;
			client.emit('playerLeftTheQueue');
		}
		this.playerService.showPlayersInQueue();
	}

	@SubscribeMessage('speed')
	speed(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		let user: User = data['user'];

		if (user.status == PlayerStatus.PLAYING) {
			let direction: number = data['speed'];
			let player: PlayerI = this.playerService.getPlayerByUser(this.playerService.playersPlaying, user);
			this.gameService.speedPaddle(this.gameService.games[player.gameId], player.playerId, direction);
		}
	}

	@SubscribeMessage('userDisconnectFromGame')
	userDisconnectFromGame(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		let user: User = data['user'];
		if (user.status == PlayerStatus.INQUEUE)
			this.playerService.removeFromTab(user, this.playerService.playersInQueue);
	}

	//=======================Spec Part =======================//

	@SubscribeMessage('userConnectToSpectate')
	userConnectToSpectate(@ConnectedSocket() client: Socket) {
		// console.log("________Currently Queing_________________");
		// this.playerService.showPlayersInQueue();
		// console.log("________Currently Playing________________");
		// this.playerService.showPlayersInGame();
		// console.log("________Currently Watching________________");
		// this.playerService.showPlayersInSpectate();
	}

	@SubscribeMessage('getOnGoingGameList')
	getOnGoingGameList(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		client.emit("getOnGoingGameList", this.gameService.shareGameList());
	}

	@SubscribeMessage('SpectateRequest')
	spectateRequest(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		let user: User = data['user'];
		let gameId: number = data['gameId'];
		if (this.gameService.games[gameId].status != GameStatus.DONE) {
			this.playerService.addSpectator(user, gameId);
		}
		else {
			client.emit("getOnGoingGameList", this.gameService.shareGameList());
		}
	}

	@SubscribeMessage('quitSpecGame')
	quitSpecGame(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		let user: User = data['user'];
		this.playerService.removeSpecator(user);
	}

	@SubscribeMessage('userDisconnectFromSpectate')
	userDisconnectFromSpectate(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		let user: User = data['user'];
		console.log("catch Quit spec");
		if (user.status == PlayerStatus.SPECTATE)
			this.playerService.removeSpecator(user);
	}

	//======================= Custom Game =======================//

	customData: any = {};

	@SubscribeMessage('startCustom')
	startCustom(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		let user: User = data['user'];
		if (user.status == PlayerStatus.ONLINE) {
			this.customData[user.username] = data['customInfo'];
			this.playerService.addPlayerToQueue(user);
			this.playerService.checkQueue(this.customData); //Start a game if at least two players are queuing
		}
		this.playerService.showPlayersInQueue();
	}
}
