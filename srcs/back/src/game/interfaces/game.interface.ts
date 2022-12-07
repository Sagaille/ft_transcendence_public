import { User } from "@prisma/client";
import { constants } from "buffer";
import { BallI } from "./ball.interface";
import { PlayerI } from "./player.interface";

export interface GameI {
	id: number;
	status: GameStatus;
	player1: PlayerI;
	player2: PlayerI;
	ball: BallI;
	spectate: PlayerI[];
	winningScore: number;

}

export enum GameStatus {
	PLAYING = 1,
	DONE = 2,
}

export enum GameConst {
	padHeight = 60,
	padWidth = 15,
	speedUp = -10,
	speedDown = 10,
	canvasW = 650,
	canvasH = 480,
	ballRadius = 10,
	ballSpeed = 5,
	winningScore = 10,
}