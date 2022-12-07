import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { io } from 'socket.io-client';
import { ChatService } from '../chat/services/chat-service/chat.service';
import { GameService } from '../game/game.service';
import { AuthService } from '../login/auth.service';
import { UserI } from '../user/user.interface';
import { UserService } from '../user/user.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, AfterViewInit {
	user: BehaviorSubject<UserI>;
	constructor(private router: Router, private authService: AuthService,
		private gameService: GameService, private chatService: ChatService) {
		this.user = this.authService.user$;
	}

	async ngOnInit() {
	}

	ngAfterViewInit(): void {
		this.gameService.socket.connect();
		this.gameService.socket.emit('saveClient', { user: this.user.value });
		this.chatService.connectSocket();
	}

	profile_route() {
		this.router.navigate(['/user']);
	}

	game_route() {
		this.router.navigate(['/game']);
	}

	spectate_route() {
		this.router.navigate(['/spectate'])
	}

	chat_route() {
		this.router.navigate(['/chat']);
	}

	async disconnect() {
		await this.authService.logout();
		this.gameService.socket.disconnect();
		this.chatService.disconnectSocket();
	}

	get status() { return (this.user.value.status && this.user) ? this.user.value.status : null }

}
