import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { GameI, GameStatus } from './interfaces/game.interface';
import { PlayerI, PlayerStatus } from './interfaces/player.interface';
import { User } from '@prisma/client';
import { paddleI } from './interfaces/paddle.interface';
import { UserService } from 'src/user/user.service';
import { PlayerService } from './player/player.service';

@Injectable()
export class GameService {

	constructor(
		@Inject(forwardRef(() => PlayerService))
		private readonly playerService: PlayerService,
		private readonly userService: UserService,
	) { };

	padHeight = 60;
	padWidth = 15;
	speedUp = -10;
	speedDown = 10;
	canvasW = 650;
	canvasH = 480;
	ballRadius = 10;
	ballSpeed = 5;
	winningScore = 10;

	games: GameI[] = [];
	gameId: number = 0;

	createGame(player1: PlayerI, player2: PlayerI) {
		let game: GameI = {
			id: this.gameId,
			status: GameStatus.PLAYING,
			player1: player1,
			player2: player2,
			ball:
			{
				x: this.canvasW / 2,
				y: this.canvasH / 2,
				xSpeed: 0,
				ySpeed: 0,
				radius: this.ballRadius,
				speed: this.ballSpeed,
				speedRatio: 1,
			},
			spectate: [],
			winningScore: this.winningScore,
		}
		game.player1.playerId = 1;
		game.player2.playerId = 2;
		game.player2.paddle.x = this.canvasW - this.padWidth;
		game.player1.gameId = this.gameId;
		game.player2.gameId = this.gameId;
		this.gameId += 1;

		this.games.push(game);
		this.gameStart(game);
		this.GamelaunchBall(game);
		// this.displayGame();
	}

	speedPaddle(game: GameI, playerId: number, direction: number): void {
		let playerPad: paddleI;
		if (playerId == 1)
			playerPad = game.player1.paddle;
		else
			playerPad = game.player2.paddle;

		switch (direction) {
			case -1:
				playerPad.speed = playerPad.speedUp;
				break;
			case 0:
				playerPad.speed = 0;
				break;
			case 1:
				playerPad.speed = playerPad.speedDown;
				break;
			default:
				playerPad.speed = 0;
		}
	}

	padInBound(game: GameI, playerId: number): boolean {
		let playerPad: paddleI;
		if (playerId == 1)
			playerPad = game.player1.paddle;
		else
			playerPad = game.player2.paddle;

		if ((playerPad.y + playerPad.speed < 0) || (playerPad.y + playerPad.height + playerPad.speed > this.canvasH)) {
			if (playerPad.y + playerPad.speed < 0)
				playerPad.y = 0;
			else if (playerPad.y + playerPad.height + playerPad.speed > this.canvasH)
				playerPad.y = this.canvasH - playerPad.height;
			return false;
		}
		return true;
	}

	ballLeftCheck(game: GameI) {
		if (game.ball.x < game.player1.paddle.x + game.player1.paddle.width) {
			if (game.ball.y >= game.player1.paddle.y && game.ball.y <= game.player1.paddle.y + game.player1.paddle.height) {
				game.ball.xSpeed = -game.ball.xSpeed;
				if (game.ball.speedRatio < 1.8) {
					game.ball.speedRatio = game.ball.speedRatio + 0.1;
					game.ball.xSpeed = game.ball.xSpeed + game.ball.speedRatio;
				}
			}
			else if (game.player1.paddle.y >= game.ball.y && game.player1.paddle.y <= game.ball.y + game.ball.radius) {
				game.ball.xSpeed = -game.ball.xSpeed;
				if (game.ball.speedRatio < 1.8) {
					game.ball.speedRatio = game.ball.speedRatio + 0.1;
					game.ball.xSpeed = game.ball.xSpeed + game.ball.speedRatio;
				}
			}

		}
	}

	ballRightCheck(game: GameI) {
		if (game.ball.x + game.ball.radius > game.player2.paddle.x) {
			if (game.ball.y >= game.player2.paddle.y && game.ball.y <= game.player2.paddle.y + game.player2.paddle.height) {
				game.ball.xSpeed = -game.ball.xSpeed;
				if (game.ball.speedRatio < 1.8) {
					game.ball.speedRatio = game.ball.speedRatio + 0.1;
					game.ball.xSpeed = game.ball.xSpeed - game.ball.speedRatio;
				}
			}
			else if (game.player2.paddle.y >= game.ball.y && game.player2.paddle.y <= game.ball.y + game.ball.radius) {
				game.ball.xSpeed = -game.ball.xSpeed;
				if (game.ball.speedRatio < 1.8) {
					game.ball.speedRatio = game.ball.speedRatio + 0.1;
					game.ball.xSpeed = game.ball.xSpeed - game.ball.speedRatio;
				}
			}
		}
	}

	ballDirection(game: GameI) {
		let tmp = Math.random() * 1;
		if (tmp > 0.5)
			game.ball.xSpeed = -game.ball.speed;
		else
			game.ball.xSpeed = game.ball.speed;
		let tmp2 = Math.random() * 5 + 1;
		game.ball.ySpeed = tmp2;
		game.ball.x = this.canvasW / 2;
		game.ball.y = this.canvasH / 2;
		game.ball.speedRatio = 1;
	}

	GamelaunchBall(game: GameI) {
		this.ballDirection(game);
	}

	gameStart(game: GameI) {
		let moveInterval: NodeJS.Timer;
		moveInterval = setInterval(async () => {
			if (this.padInBound(game, 1))
				game.player1.paddle.y += game.player1.paddle.speed;
			if (this.padInBound(game, 2))
				game.player2.paddle.y += game.player2.paddle.speed;

			if (game.ball.y < 0 || game.ball.y > this.canvasH - game.ball.radius)
				game.ball.ySpeed = -game.ball.ySpeed;

			if (game.ball.x < 0) {
				game.player2.score += 1;
				this.GamelaunchBall(game);
			}
			else if (game.ball.x > this.canvasW - game.ball.radius) {
				game.player1.score += 1;
				this.GamelaunchBall(game);
			}

			game.ball.y += game.ball.ySpeed;
			game.ball.x += game.ball.xSpeed;

			if (game.ball.x < this.canvasW / 2)
				this.ballLeftCheck(game);
			else
				this.ballRightCheck(game);
			this.broadcastGameInfo(game);

			if (game.player1.score >= game.winningScore || game.player2.score >= game.winningScore) {
				this.terminateGame(game);
				clearInterval(moveInterval);
			}
		}, 50);
	}

	broadcastGameInfo(game: GameI) {
		let client: Socket = this.playerService.getClientByUser(game.player1.user);
		if (client)
			client.emit("updateGameInfo", game);
		client = this.playerService.getClientByUser(game.player2.user);
		if (client)
			client.emit("updateGameInfo", game);

		for (let index = 0; index < game.spectate.length; index++) {
			const element = game.spectate[index];
			if (element != undefined) {
				client  = this.playerService.getClientByUser(element.user);
				if (client)
					client.emit("updateGameInfo", game);
			}
		}
	}

	async terminateGame(game: GameI) {
		let currentUser = await this.userService.getOneById(game.player1.user.id);
		game.player1.user = currentUser;
		currentUser = await this.userService.getOneById(game.player2.user.id);
		game.player2.user = currentUser;
		console.log(`Terminating game: ${game.id} between : ${game.player1.user.ingame_name} & ${game.player2.user.ingame_name} | Score: ${game.player1.score} : ${game.player2.score}`);

		if (game.player1.score == game.winningScore) {
			game.player1.user.match_history.unshift(`${game.player1.user.ingame_name} W - L ${game.player2.user.ingame_name}`);
			game.player1.user.wins += 1;
			game.player2.user.match_history.unshift(`${game.player2.user.ingame_name} L - W ${game.player1.user.ingame_name}`);
			game.player2.user.losses += 1;
		}
		else if (game.player2.score == game.winningScore) {
			game.player2.user.match_history.unshift(`${game.player2.user.ingame_name} W - L ${game.player1.user.ingame_name}`);
			game.player2.user.wins += 1;
			game.player1.user.match_history.unshift(`${game.player1.user.ingame_name} L - W ${game.player2.user.ingame_name}`);
			game.player1.user.losses += 1;
		}

		await this.userService.updateUser(game.player1.user);
		await this.userService.updateUser(game.player2.user);
		this.playerService.removeFromTab(game.player1.user, this.playerService.playersPlaying);
		this.playerService.removeFromTab(game.player2.user, this.playerService.playersPlaying);
		this.playerService.removeAllSpec(game);
		game.player1.user.status = PlayerStatus.ONLINE;
		game.player2.user.status = PlayerStatus.ONLINE;
		game.status = GameStatus.DONE;
		this.broadcastGameInfo(game);
	}

	getPlayerNumber(game: GameI, user: User): number {
		if (game.player1.user.username == user.username)
			return 1;
		else if (game.player2.user.username == user.username)
			return 2;
		return undefined;
	}

	displayGame() {
		for (let index = 0; index < this.games.length; index++) {
			const element = this.games[index];
			console.log(`_______________Game: ${element.id}_______________`);
			console.log(`player1: ${element.player1.user.username}`);
			console.log(`player2: ${element.player2.user.username}`);
			console.log(`status: ${element.status}`);
			console.log(`_____________________________________`);
		}
	}

	//======================= Spec Part =======================//

	shareGameList(): GameI[] {
		let onGoingGame: GameI[] = [];
		for (let index = 0; index < this.games.length; index++) {
			const element = this.games[index];
			if (element.status == GameStatus.PLAYING)
				onGoingGame.push(element);
		}
		return onGoingGame;
	}

	//======================= Custom Game =======================//

	createCustomGame(player1: PlayerI, player2: PlayerI, customData: any) {
		let game: GameI = {
			id: this.gameId,
			status: GameStatus.PLAYING,
			player1: player1,
			player2: player2,
			ball:
			{
				x: this.canvasW / 2,
				y: this.canvasH / 2,
				xSpeed: 0,
				ySpeed: 0,
				radius: this.ballRadius,
				speed: this.ballSpeed,
				speedRatio: 1,
			},
			spectate: [],
			winningScore: this.winningScore,
		}
		game.player1.playerId = 1;
		game.player2.playerId = 2;
		game.player2.paddle.x = this.canvasW - this.padWidth;
		game.player1.gameId = this.gameId;
		game.player2.gameId = this.gameId;
		this.gameId += 1;

		player1.paddle.height = +customData['P1PH'];
		game.player2.paddle.height = +customData['P2PH'];
		game.ball.radius = +customData['BR'];
		game.winningScore = +customData['WS'];

		this.games.push(game);
		this.gameStart(game);
		this.GamelaunchBall(game);
		this.displayGame();
	}

}
