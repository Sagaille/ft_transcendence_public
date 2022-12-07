import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ChatHelperService } from 'src/app/chat/services/chat-service/chat-helper.service';
import { ChatService } from 'src/app/chat/services/chat-service/chat.service';
import { GameService } from 'src/app/game/game.service';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from '../user.interface';
import { UserService } from '../user.service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {

	params: any;
	public_user: UserI;
	all_users: Array<UserI>;

	user: BehaviorSubject<UserI>;
	constructor(private http: HttpClient, private route: ActivatedRoute,
		private authService: AuthService, private userService: UserService, private router: Router,
		private gameService: GameService,
		private chatService: ChatService, private chatHelperService: ChatHelperService) {
		this.user = this.authService.user$;
		this.route.params.subscribe(params => {
			this.params = params;
		});
	}

	ngOnInit(): void {
		this.get_public_user();
		this.get_all_users();
	}

	async get_public_user() {
		await this.http.get<UserI>(`http://localhost:3000/user/public_profile`, {
			params: {
				player: this.params.user
			}
		}).subscribe(data => {
			this.public_user = data;
		})
		return this.public_user;
	}

	async get_all_users(): Promise<UserI[]> {
		await this.http.get<UserI[]>(`http://localhost:3000/user/all_users`).subscribe(data => {
			this.all_users = data;
		})
		return this.all_users;
	}

	is_friend(user: string)  // check if friend is added
	{
		if (this.user.value.friends.indexOf(user) < 0)
			return false;
		return true
	}

	add_friend(user: string) {
		if (this.user.value.friends.indexOf(user) < 0)  // check if friend isnt already added
		{
			this.user.value.friends.push(user);  // update behaviorsubject
			this.userService.updateUser(this.user).subscribe();  // update db
		}
	}

	remove_friend(user: string) {
		if (this.user.value.friends.indexOf(user) > -1)  // check if friend exists
		{
			let index = this.user.value.friends.indexOf(user);  // get index
			this.user.value.friends.splice(index, 1);  // remove string in behaviorsubject
			this.userService.updateUser(this.user).subscribe();  // update db
		}
	}

	match_history_route(username: string) {
		console.log("match_history");
		this.router.navigate(['/profile/match_history/', username]);
	}

	spectatePlayer(username: string) {
		this.gameService.spectatePlayer(username);
	}

	ranks()  // used to display only when variable is populated (no more "undefined" in the browser console)
	{
		if (this.all_users !== undefined)
			return (this.getrank())
		else
			return null
	}

	getrank() {
		let i = 0;
		let rank = 1;

		while (i < this.all_users.length) {
			if (this.user.value.wins < this.all_users[i].wins)
				rank++;
			i++;
		}
		return rank;
	}

	/* Display either Unblock or Block depending on the current status */
	getBlockActionStatus(targetUser: UserI): string {
		if (this.chatHelperService.isUserBlock(this.user.value, targetUser) == true) {
			return 'Unblock';
		} else {
			return 'Block';
		}
	}

 /* Call function to block or unblock the user depending on current condition */
 toggleBlockUser(targetUser: UserI) {
	if (this.user && this.user.value && this.user.value.id && targetUser && targetUser.id) {
		if (this.chatHelperService.isUserBlock(this.user.value, targetUser) == true) {
			// Unblock
			this.chatService.unBlockUser(this.user.value.id, targetUser.id);
			// remove the targetUser from array and update behaviour object 
			this.user.value.blockingUsers = this.user.value.blockingUsers.filter((u) => u.id != targetUser.id)
		} else {
			// Block User
			this.chatService.blockUser(this.user.value.id, targetUser.id);
			// update behaviour object
			this.user.value.blockingUsers.push(targetUser);
		}
	}
}

	get username() { return (this.public_user && this.public_user.username) ? this.public_user.username : null }
	get avatar() { return (this.public_user && this.public_user.avatar) ? this.public_user.avatar : null }
	get ingame_name() { return (this.public_user && this.public_user.ingame_name) ? this.public_user.ingame_name : null }
	get wins() { return (this.public_user && this.public_user.wins) }
	get losses() { return (this.public_user && this.public_user.losses) }
	get ladder_lvl() { return (this.public_user && this.public_user.ladder_lvl) }
	get status() { return (this.public_user && this.public_user.status) }
	get username_non_null() { return (this.public_user && this.public_user.username) }
	get get_user() { return (this.public_user) }
}
