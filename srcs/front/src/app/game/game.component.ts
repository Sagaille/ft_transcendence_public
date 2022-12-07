import { Component, OnInit, OnDestroy, EnvironmentInjector } from '@angular/core';
import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { HostListener } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, Subscription } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import Swal from 'sweetalert2';
import { AuthService } from '../login/auth.service';
import { UserI } from '../user/user.interface';
import { UserService } from '../user/user.service';
import { DrawingService } from './drawing.service';
import { GameService } from './game.service';
import { GameI } from './interfaces/game.interface';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
})
export class GameComponent implements OnInit, OnDestroy, AfterViewInit {

	user: BehaviorSubject<UserI>;
	private socket: Socket;
	constructor(
		public authService: AuthService,
		private userService: UserService,
		private drawingService: DrawingService,
		private gameService: GameService,) {
		this.user = this.authService.user$;
		this.socket = this.gameService.socket;
	}

	@ViewChild('board', { static: false }) canvas: ElementRef<HTMLCanvasElement>;
	private ctx: CanvasRenderingContext2D | any;
	key: string;
	game: GameI | undefined = undefined;

	@HostListener('document:keydown', ['$event'])
	handleKeyboardEvent(event: KeyboardEvent) {
		this.key = event.key;
		switch (this.key) {
			case 'w':
				this.updateSpeed(-1);
				break;
			case 's':
				this.updateSpeed(1);
				break;
		}
	}
	@HostListener('document:keyup', ['$event'])
	handleKeyboard(event: KeyboardEvent) {
		this.key = event.key;
		switch (this.key) {
			case 'w':
				this.updateSpeed(0);
				break;
			case 's':
				this.updateSpeed(0);
				break;
		}
	}

	resizeObservable$: Observable<Event>;
	resizeSubscription$: Subscription;

	ngOnInit(): void {
		this.socket.emit('userConnectToPlayPong');
		this.resizeObservable$ = fromEvent(window, 'resize')
		this.resizeSubscription$ = this.resizeObservable$.subscribe(evt => {
			this.canvas.nativeElement.width = window.innerWidth / 2;
			this.canvas.nativeElement.height = 3 * window.innerWidth / 8;
		})
	}

	ngAfterViewInit(): void {

		this.canvas.nativeElement.width = window.innerWidth / 2;
		this.canvas.nativeElement.height = 3 * window.innerWidth / 8;
		this.ctx = this.canvas.nativeElement.getContext('2d');

		this.socket.on('updateGameInfo', (response: GameI) => {
			this.game = response;
			this.drawingService.drawGame(this.ctx, response);
		});

		this.socket.on('playerLeftTheQueue', () => {
			this.drawingService.drawGameHomePage(this.ctx);
		});
	}

	ngOnDestroy(): void {
		this.socket.emit('userDisconnectFromGame', { user: this.user.value });
		this.resizeSubscription$.unsubscribe();
	}

	updateSpeed(x: number) {
		this.socket.emit('speed', { speed: x, user: this.user.value });
	}

	joinQueue() {
		this.socket.emit('joinQueue', { user: this.user.value });
	}

	quitQueue() {
		this.socket.emit('quitQueue', { user: this.user.value });
	}

	@ViewChild('Player1PaddleHeight') Player1PaddleHeight: ElementRef<HTMLInputElement>;
	@ViewChild('Player2PaddleHeight') Player2PaddleHeight: ElementRef<HTMLInputElement>;
	@ViewChild('BallRadius') BallRadius: ElementRef<HTMLInputElement>;
	@ViewChild('WinningScore') WinningScore: ElementRef<HTMLInputElement>;
	startCustom() {
		let customInfo: any = {};
		customInfo['P1PH'] = +this.Player1PaddleHeight.nativeElement.value;
		if (isNaN(customInfo['P1PH']) || customInfo['P1PH'] < 5 || customInfo['P1PH'] > 200) {
			Swal.fire({
				title: `Player 1 wrong paddle size!`,
				text: 'Try to provide a Player 1 paddle size between 5 and 200 to start a custom Pong game!',
				icon: 'info'
			});
			return;
		}
		customInfo['P2PH'] = +this.Player2PaddleHeight.nativeElement.value;
		if (isNaN(customInfo['P2PH']) || customInfo['P2PH'] < 5 || customInfo['P2PH'] > 200) {
			Swal.fire({
				title: `Player 2 wrong paddle size!`,
				text: 'Try to provide a Player 2 paddle size between 5 and 200 to start a custom Pong game!',
				icon: 'info'
			});
			return;
		}
		customInfo['BR'] = +this.BallRadius.nativeElement.value;
		if (isNaN(customInfo['BR']) || customInfo['BR'] < 5 || customInfo['BR'] > 100) {
			Swal.fire({
				title: `Ball radius wrong size!`,
				text: 'Try to provide a Ball radius between 5 and 100 to start a custom Pong game!',
				icon: 'info'
			});
			return;
		}
		customInfo['WS'] = +this.WinningScore.nativeElement.value;
		if (isNaN(customInfo['WS']) || customInfo['WS'] < 1 || customInfo['WS'] > 20) {
			Swal.fire({
				title: `Winning Score entered is not a number!`,
				text: 'Try to provide a Winning Score between 1 and 20 to start a custom Pong game!',
				icon: 'info',
			});
			return;
		}
		// console.log(`Data received: P1P: ${customInfo['P1PH']} | P2P: ${customInfo['P2PH']} 
		// | BR: ${customInfo['BR']} | WS: ${customInfo['WS']}`);
		this.socket.emit('startCustom', { user: this.user.value, customInfo: customInfo });
	}
}
