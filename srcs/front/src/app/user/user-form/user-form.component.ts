import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from '../user.interface';
import { UserService } from '../user.service';

@Component({
	selector: 'app-user-form',
	templateUrl: './user-form.component.html',
	styles: ['.pull-right {line-height:50px;}']
})
export class UserFormComponent implements OnInit {

	error_msg: string;
	all_users: Array<UserI>
	temp_user: string
	user: BehaviorSubject<UserI>;
	constructor(private authService: AuthService, private router: Router, private userService: UserService, private http: HttpClient) {
		this.user = this.authService.user$;
		this.temp_user = this.user.value.ingame_name
	}

	ngOnInit() {
		this.get_all_users();
	}

	async get_all_users() {
		await this.http.get<UserI[]>(`http://localhost:3000/user/all_users`).subscribe(data => {
			this.all_users = data;
		})
		return this.all_users;
	}

	switch2FA() {
		this.router.navigate(['/user/edit/email'])
	}

	unswitch2FA() {
		this.user.value.two_factor = false;
		this.userService.updateUser(this.user).subscribe();
	}

	upload() {
		this.router.navigate(['/user/upload'])
	}

	async onSubmit() {
		console.log("submit!");
		let i = 0;

		while (i < this.all_users.length) {
			if (this.temp_user == this.all_users[i].ingame_name && this.temp_user != this.user.value.ingame_name) {
				console.log("ingame_name already taken");
				this.error_msg = "in game name already taken"
				return;
			}
			i++;
		}
		this.user.value.ingame_name = this.temp_user;
		try { await this.userService.updateUser(this.user).subscribe() }
		catch { console.log("error catched!"); }
		this.router.navigate(['user']);

		/*error: (err) => (console.log("cannot update user!"), this.router.navigate(['user/edit'])),	// catches the BadRequestException of the back;});
	})*/}

	get error() { return (this.error_msg) ? this.error_msg : null }
}
