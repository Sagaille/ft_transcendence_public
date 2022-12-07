import { ContentObserver } from '@angular/cdk/observers';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, delay, observable, Observable, of, tap } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { ChatService } from '../chat/services/chat-service/chat.service';
import { GameService } from '../game/game.service';
import { UserI } from '../user/user.interface';
import { UserService } from '../user/user.service';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	//delete
	/*player1: boolean = false;
	player2: boolean = false;
	player3: boolean = false;
	player4: boolean = false;*/
	//till here
	public user$: BehaviorSubject<UserI> = new BehaviorSubject<UserI>({ username: "null", avatar: "null", ingame_name: "null", wins: 0, losses: 0, ladder_lvl: 0, match_history: [0], two_factor: false, friends: [], status: "null", email: "null", blockedByUsers: [], blockingUsers:[] });
	error_login: boolean = false;
	private socket: any;
	public isLoggedIn: boolean;  // mb do some getters
	constructor(
		private http: HttpClient,
		private router: Router,
		private userService: UserService,
		private chatService: ChatService,
	) {
		this.isLoggedIn = false;
	}

	code: string;
	redirectUrl: string;

	login() /*Observable<boolean>*/ {
		//let code: string;  //delete
		//code = "sdasdasdasdas"  //delete

		return this.http.get<{ page: string }>('http://localhost:3000/auth/oauth_page')  //uncomment

		//delete
		//this.router.navigate(['confirmation']);
	}

	async logout()  // build it + set expiration timer!
	{
		this.isLoggedIn = false;
		this.user$.value.status = "offline";
		await this.userService.updateUser(this.user$).subscribe();
		await localStorage.removeItem(`id_token${this.user$.value.id}`);
		console.log("logout");
		this.router.navigate(['/login']);
	}

	async logout_soft()
	{
		this.isLoggedIn = false;
		this.user$.value.status = "offline";
		await this.userService.updateUser(this.user$).subscribe();
		await localStorage.removeItem(`id_token${this.user$.value.id}`);
		console.log("logout");
	}

	async already_logged()  // in case of client already active
	{
		this.isLoggedIn = false;
		/*localStorage.removeItem("id_token");*/
		/*this.user$.value.username = "";*/
		console.log("already logged");
		await this.router.navigate(['/login']);
	}

	async storeUser(token: any) {
		/*console.log("storeuser")*/
		await localStorage.setItem(`id_token`, token.access_token);
		// delete
		/*let query_param = "";
		if (this.player1 == true)
			query_param = "player1";
		if (this.player2 == true)
			query_param = "player2";
		if (this.player3 == true)
			query_param = "player3";
		if (this.player4 == true)
			query_param = "player4";
		this.http.get<UserI>(`http://localhost:3000/user/me`, {
			params: {
				player: query_param
			}
		}).subscribe({*/
			//till here
			this.http.get<UserI>(`http://localhost:3000/user/me`).subscribe({  //uncomment
			next: async value => {
				if (value.status != 'offline')
				{
					await this.already_logged();
					return ;
				}
				else
				{
					value.status = "online";
				}
				this.user$.next({
					id: value.id,
					username: value.username,
					avatar: value.avatar,
					ingame_name: value.ingame_name,
					wins: value.wins,
					losses: value.losses,
					ladder_lvl: value.ladder_lvl,
					match_history: value.match_history,
					two_factor: value.two_factor,
					friends: value.friends,
					status: value.status,
					email: value.email,
					blockedByUsers: value.blockedByUsers,
					blockingUsers: value.blockingUsers,
				})
				await localStorage.setItem(`id_token${this.user$.value.id}`, token.access_token);
				await localStorage.removeItem(token.access_token);
				this.isLoggedIn = true;
				await (await this.userService.updateUser(this.user$)).subscribe();
				this.router.navigate(['/home']);
				if (value.status == "null")
				{
					this.isLoggedIn = false;
					this.router.navigate(['/login']);
				}
			},
			error: err => {
				this.router.navigate(['login']);
			}
		});
		/*console.log("constructor auth = ");
		console.log(value.username);
		console.log(value.avatar);*/
	}

	getLoggedInUser(): UserI {
		return this.user$.value;
	}
}
