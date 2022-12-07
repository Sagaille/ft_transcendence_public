import { User } from "@prisma/client";
import { paddleI } from "./paddle.interface";

export interface PlayerI {
	user: User;
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