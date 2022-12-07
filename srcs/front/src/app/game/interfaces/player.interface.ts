import { UserI } from "src/app/user/user.interface";
import { paddleI } from "./paddle.interface";

export interface PlayerI {
	user: UserI;
	score: number;
	paddle: paddleI;
	gameId?: number;
	specId?: number;
	playerId?: number;
}

export enum PlayerStatus {
	ONLINE = 'online',
	PLAYING = 'playing',
	SPECTATE = 'spectate',
	INQUEUE = 'queuing',
}