import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { GameService } from '../game.service';
import { GameConst, GameI } from '../interfaces/game.interface';
import { PlayerI, PlayerStatus } from '../interfaces/player.interface';

@Injectable()
export class PlayerService {

	constructor(
		@Inject(forwardRef(() => GameService))
		private readonly gameService: GameService,
		private readonly userService: UserService,
	) { };

	playersPlaying: PlayerI[] = [];
	playersInQueue: PlayerI[] = [];
	playersSpectate: PlayerI[] = [];
	usersSocket: {} = {};
	socketsUser: {} = {};

	addUserSocket(user: User, client: Socket) {
		this.usersSocket[user.username] = client;
		this.socketsUser[client.id] = user;
	}

	getClientByUser(user: User): Socket {
		return this.usersSocket[user.username];
	}

	updateFrontUser(user: User) {
		let client = this.getClientByUser(user);
		if (client)
			client.emit("updateUser", { user: user });
	}

	userToPlayer(user: User): PlayerI {
		let player: PlayerI;

		player = {
			user: user,
			score: 0,
			paddle:
			{
				x: 0,
				y: (GameConst.canvasH / 2) - GameConst.padHeight,
				height: GameConst.padHeight,
				width: GameConst.padWidth,
				speed: 0,
				speedUp: GameConst.speedUp,
				speedDown: GameConst.speedDown,
			},
		};
		return player;
	}

	playerGame(player: PlayerI, games: GameI[]): GameI | undefined {
		for (let index = 0; index < games.length; index++) {
			const element = games[index];
			if (player.user.username == element.player1.user.username)
				return element;
			else if (player.user.username == element.player2.user.username)
				return element;
		}
		return undefined;
	}

	getPlayerByUser(players: PlayerI[], user: User): PlayerI | undefined {
		for (let index = 0; index < players.length; index++) {
			const element = players[index];
			if (element.user.username == user.username)
				return element;
		}
		return undefined;
	}

	async userStatusCheck(userFront: User) {
		let user: User = await this.userService.getOneById(userFront.id);
		if (!user)
			return ;
		if (this.isUserInTab(user, this.playersInQueue)) {
			user.status = PlayerStatus.INQUEUE;
			await this.userService.updateUser(user);
			this.updateFrontUser(user);
		}
		else if (this.isUserInTab(user, this.playersPlaying)) {
			user.status = PlayerStatus.PLAYING;
			await this.userService.updateUser(user);
			this.updateFrontUser(user);
		}
		else if (this.isUserInTab(user, this.playersSpectate)) {
			user.status = PlayerStatus.SPECTATE;
			await this.userService.updateUser(user);
			this.updateFrontUser(user);
		}
		else {
			let client = this.getClientByUser(user)
			{
				if (client && client.connected) {
					user.status = PlayerStatus.ONLINE;
					await this.userService.updateUser(user);
					this.updateFrontUser(user);
				}
				else {
					user.status = "offline";
					await this.userService.updateUser(user);
				}
			}
		}
	}

	addPlayerToQueue(user: User) {
		if (user.status == PlayerStatus.ONLINE) {
			let player = this.userToPlayer(user);
			this.playersInQueue.push(player);
			user.status = PlayerStatus.INQUEUE;
			this.userService.updateUser(user);
			this.updateFrontUser(user);
		}
	}

	addSpectator(user: User, gameId: number) {
		if (user.status == PlayerStatus.ONLINE) {
			let player: PlayerI = this.userToPlayer(user)
			player.specId = gameId;
			this.gameService.games[gameId].spectate.push(player);
			this.playersSpectate.push(player);
			user.status = PlayerStatus.SPECTATE;
			this.userService.updateUser(user);
			this.updateFrontUser(user);
		}
	}

	removeSpecator(user: User) {
		let player = this.getPlayerByUser(this.playersSpectate, user);
		let game = this.gameService.games[player.specId];

		for (let index = 0; index < game.spectate.length; index++) {
			const element = game.spectate[index];
			if (element.user.username == user.username)
				game.spectate.splice(index, 1);
		}
		this.removeFromTab(user, this.playersSpectate);
	}

	removeAllSpec(game: GameI) {
		let element: PlayerI;
		while ((element = game.spectate.pop()) != undefined)
			this.removeFromTab(element.user, this.playersSpectate);
	}

	checkQueue(customData: any) {
		if (this.playersInQueue.length < 2)
			return;

		this.playersPlaying.push(this.playersInQueue[0]);
		this.playersPlaying.push(this.playersInQueue[1]);
		this.removeFromTab(this.playersInQueue[0].user, this.playersInQueue);
		this.removeFromTab(this.playersInQueue[0].user, this.playersInQueue);
		let player1 = this.playersPlaying[this.playersPlaying.length - 2]
		let player2 = this.playersPlaying[this.playersPlaying.length - 1]
		player1.user.status = PlayerStatus.PLAYING;
		player2.user.status = PlayerStatus.PLAYING;
		if (!customData) {
			this.gameService.createGame(player1, player2);
			return;
		}
		if (customData[player1.user.username] != undefined) {
			this.gameService.createCustomGame(player1, player2, customData[player1.user.username]);
			customData[player1.user.username] = undefined;
			customData[player2.user.username] = undefined;
		}
		else if (customData[player2.user.username] != undefined) {
			this.gameService.createCustomGame(player1, player2, customData[player2.user.username]);
			customData[player2.user.username] = undefined;
			customData[player1.user.username] = undefined;
		}
		else {
			this.gameService.createGame(player1, player2);
		}
	}

	isUserInTab(user: User, players: PlayerI[]): boolean {
		for (let index = 0; index < players.length; index++) {
			const element = players[index];
			if (element.user.username == user.username)
				return true;
		}
		return false;
	}

	removeFromTab(user: User, players: PlayerI[]) {
		for (let index = 0; index < players.length; index++) {
			const element = players[index];
			if (element.user.username == user.username)
				players.splice(index, 1);
		};
		this.userStatusCheck(user);
	}

	showPlayersInQueue() {
		for (let index = 0; index < this.playersInQueue.length; index++) {
			const element = this.playersInQueue[index];
			console.log(element.user.username);
		}
	}

	showPlayersInGame() {
		for (let index = 0; index < this.playersPlaying.length; index++) {
			const element = this.playersPlaying[index];
			console.log(element.user.username);
		}
	}
	showPlayersInSpectate() {
		for (let index = 0; index < this.playersSpectate.length; index++) {
			const element = this.playersSpectate[index];
			console.log(element.user.username);
		}
	}

	getGameId(user: User): number | undefined {
		for (let index = 0; index < this.playersPlaying.length; index++) {
			const element = this.playersPlaying[index];
			if (element.user.username == user.username)
				return element.gameId;
		}
		return undefined;
	}
}
