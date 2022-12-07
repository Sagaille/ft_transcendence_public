import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { ChatService } from 'src/app/chat/services/chat-service/chat.service';
import { GameService } from 'src/app/game/game.service';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from '../../user.interface';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-email',
  template: `
	<form *ngIf="user" (ngSubmit)="onSubmit()" #userForm="ngForm">
		<div class="row">
		<div class="col s4 offset-m4">
			<div class="card-panel"><h2>Setup your email and a confirmation link will be sent to your mailbox</h2>
			<a>Only outlook and hotmail can be forwarded by the 42 network. If you use gmail or other, please use your actual mailbox and not your 42 student mailbox.</a>
			<p></p>

			<!-- Email to connect to -->
			<div class="form-group">
			<label for="name">Email</label>
			<input type="text" class="form-control"
					required
					pattern="^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
				   [(ngModel)]="this.email" name="name"
				   #name="ngModel">

			<div [hidden]="name.valid || name.pristine"
				  class="card-panel red accent-1">
				  Email is required.
			</div>
			</div>
					{{message}}
			<!-- Submit button -->
			<div class="divider"></div>
			<div class="section center">
				<button type="submit"
				class="waves-effect waves-light btn"
				[disabled]="!userForm.form.valid">
				Submit</button>
			</div>
			</div>
		</div>
  `,
  styles: [
  ]
})
export class EmailComponent
{
	all_users: Array<UserI>;
	error_msg: string;
	user: BehaviorSubject<UserI>;
	email: string;
	constructor(private authService: AuthService, private router: Router, private userService: UserService, private http: HttpClient, private gamerService: GameService, private chatService: ChatService) {
		this.user = this.authService.user$;
		this.email = this.user.value.email;
	}

	ngOnInit()
	{
		this.get_all_users();
	}

	async get_all_users()
	{
		await this.http.get<UserI[]>(`http://localhost:3000/user/all_users`).subscribe(data => {
		this.all_users = data;
		})
		return this.all_users;
	}

	onSubmit()
	{
		console.log("submit!");
		console.log(this.user.value.email)
		console.log(this.email)
		console.log(this.error_msg)

		let i = 0;

		while (i < this.all_users.length)
		{
			if (this.email == this.all_users[i].email && this.email != this.user.value.email)
			{
				console.log("email already taken");
				this.error_msg = "email already taken"
				return ;
			}
			i++;
		}
		this.user.value.email = this.email;
		this.userService.updateUser(this.user).subscribe();
		let observable = this.http.post<any>('http://localhost:3000/auth/two_factor', {});

		observable.subscribe({
			next: async (value) => {
					await this.authService.logout_soft();
					this.gamerService.socket.disconnect();
					this.chatService.disconnectSocket();
					this.router.navigate(['/demand_pending'])
					},
			/*error: (err) => (this.authService.error_login = true, console.log("error on mail submit"))*/	// catches the BadRequestException of the back;
		});
	}

	get message() { return (this.error_msg) ? this.error_msg : null }
}
