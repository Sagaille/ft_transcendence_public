import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from '../user.interface';

@Component({
  selector: 'app-match-history',
  templateUrl: 'match-history.component.html',
  styles: [
  ]
})
export class MatchHistoryComponent
{
	params: any;
	public_user: UserI;
	user: BehaviorSubject<UserI>;
	all_users: Array<UserI>;
	rank: number;
	playermax: number = 0;

	constructor(private http: HttpClient, private route: ActivatedRoute, private authService: AuthService)
	{
		this.user = this.authService.user$;
		this.route.params.subscribe(params => {
			this.params = params;
		/*console.log("this.params");
		console.log(this.params);*/
		/*if (params['term']) { (1)
			this.doSearch(params['term'])
		}*/
		});
	}

	ngOnInit(): void {
		this.get_public_user();
		this.get_all_users();
	}

	async get_public_user()
	{
		await this.http.get<UserI>(`http://localhost:3000/user/public_profile`, {
				params: {
				player: this.params.user
				}}).subscribe(data => {
			this.public_user = data;
			})
		return this.public_user;
	}

	async get_all_users() : Promise<UserI[]>
	{
		await this.http.get<UserI[]>(`http://localhost:3000/user/all_users`).subscribe(data => {
		this.all_users = data;
		})
		return this.all_users;
	}

	get ingame_name()
	{
		if (this.public_user)
			return (this.public_user && this.public_user.ingame_name) ? this.public_user.ingame_name : null
		else
			return (this.user.value.ingame_name)
		}
	get match_history()
	{
		if (this.public_user)
			return (this.public_user && this.public_user.match_history) ? this.public_user.match_history : null
		else
			return (this.user.value.match_history)
	}

	get wins()
	{
		if (this.public_user)
			return (this.public_user && this.public_user.wins) ? this.public_user.wins : 0
		else
			return (this.user.value.wins)
	}

	ranks()  // used to display only when variable is populated (no more "undefined" in the browser console)
	{
		if (this.all_users !== undefined)
			return (this.getrank())
		else
			return null
	}

	getrank()
	{
		let i = 0;
		let wins = 0;
		let rank = 1;
		this.playermax = this.all_users.length;
		if (this.public_user)
			wins = this.public_user.wins;
		else
			wins = this.user.value.wins;
		while (i < this.all_users.length)
		{
			if (wins < this.all_users[i].wins)
				rank++;
			i++;
		}
		return rank;
	}
}
