import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, fromEvent } from 'rxjs';
import { Socket } from 'socket.io-client';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from 'src/app/user/user.interface';
import Swal from 'sweetalert2';
import { DrawingService } from '../drawing.service';
import { GameService } from '../game.service';
import { GameI } from '../interfaces/game.interface';
import { PlayerStatus } from '../interfaces/player.interface';

@Component({
	selector: 'app-spectate',
	templateUrl: './spectate.component.html',
})
export class SpectateComponent implements OnInit, OnDestroy, AfterViewInit {

	user: BehaviorSubject<UserI>;
	private socket: Socket;
	constructor(
		public authService: AuthService,
		private drawingService: DrawingService,
		private gameService: GameService,) {
		this.user = this.authService.user$;
		this.socket = this.gameService.socket;
	}

	@ViewChild('board', { static: false }) canvas: ElementRef<HTMLCanvasElement>;
	private ctx: CanvasRenderingContext2D | any;
	game: GameI | undefined = undefined;
	resizeObservable$: Observable<Event>;
	resizeSubscription$: Subscription;

	ngOnInit(): void {
		this.socket.emit('userConnectToSpectate');
		this.resizeObservable$ = fromEvent(window, 'resize')
		this.resizeSubscription$ = this.resizeObservable$.subscribe(evt => {
			this.canvas.nativeElement.width = window.innerWidth / 2;
			this.canvas.nativeElement.height = 3 * window.innerWidth / 8;
		})
	}

	gameList: GameI[] = [];

	ngAfterViewInit(): void {
		this.canvas.nativeElement.width = window.innerWidth / 2;
		this.canvas.nativeElement.height = 3 * window.innerWidth / 8;

		this.ctx = this.canvas.nativeElement.getContext('2d');

		this.socket.on('getOnGoingGameList', (response: GameI[]) => {
			this.gameList = response;
		});

		this.socket.on('updateGameInfo', (response: GameI) => {
			if (this.user.value.status == PlayerStatus.SPECTATE) {
				this.drawingService.drawGame(this.ctx, response);
				this.game = response;
			}
		});
		this.socket.emit('getOnGoingGameList', { user: this.user.value });

		if (this.user.value.status == PlayerStatus.PLAYING) {
			Swal.fire({
				title: `You're currently playing!`,
				text: 'Finish your game before spectating other players!',
				icon: 'info',
			});
			return;
		}
	}

	ngOnDestroy(): void {
		this.socket.emit('userDisconnectFromSpectate', { user: this.user.value });
		this.resizeSubscription$.unsubscribe();
	}

	getList() {
		this.socket.emit('getOnGoingGameList', { user: this.user.value });
	}

	quitSpec() {
		this.socket.emit('quitSpecGame', { user: this.user.value });
		this.socket.emit('getOnGoingGameList', { user: this.user.value });
	}

	specGame(gameId: number) {
		this.socket.emit('SpectateRequest', { user: this.user.value, gameId: gameId });
	}
}
