import { Injectable } from '@angular/core';
import { UserI } from '../user/user.interface';
import { GameI } from './interfaces/game.interface';

@Injectable({
	providedIn: 'root'
})
export class DrawingService {

	constructor() { }

	drawGameHomePage(ctx: CanvasRenderingContext2D | any) {
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	drawGame(ctx: CanvasRenderingContext2D | any, response: GameI) {
		let game: GameI = response;

		let ratioX = 1 / (650 / ctx.canvas.width);
		let ratioY = 1 / (480 / ctx.canvas.height);

		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.fillStyle = "white";
		ctx.fillRect(game.player1.paddle.x * ratioX, game.player1.paddle.y * ratioY, game.player1.paddle.width * ratioX, game.player1.paddle.height * ratioY);
		ctx.fillRect(game.player2.paddle.x * ratioX, game.player2.paddle.y * ratioY, game.player2.paddle.width * ratioX, game.player2.paddle.height * ratioY);

		ctx.fillRect(game.ball.x * ratioX, game.ball.y * ratioY, game.ball.radius * ratioX, game.ball.radius * ratioY);

		ctx.fillRect(ctx.canvas.width / 2, 0, 2, ctx.canvas.height);

		ctx.font = `${30 * ratioX}px Comic Sans MS`;
		ctx.textAlign = "center";
		ctx.fillText(`Score: ${game.player1.score}`, 70 * ratioX, 30 * ratioY);
		ctx.fillText(`Score: ${game.player2.score}`, ctx.canvas.width - 70 * ratioX, 30 * ratioY);
	}
}
