import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { AuthService } from '../login/auth.service';
import { UserI } from './user.interface';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html'
	// in the template we used ngIf for the avatar image, if the string is 'null', we don't load a non existing one and wait till the value is given. (protection against 404 error)
	// https://www.angularfix.com/2021/10/get-httplocalhost4200null-404-not-found.html
})
export class UserComponent implements OnInit {

  all_users: Array<UserI>;
  user: BehaviorSubject<UserI>;  // BehaviorSubject is used to simulate a singleton, it's directly changed in the front and don't need to call the back to read from (quicker for the display). Put to the back is still needed for the db.

  constructor(private http: HttpClient, public authService: AuthService, private router: Router)
	{
		this.user = this.authService.user$;
	}
  ngOnInit(): void {
	/*console.log("ngOnInit() this.user.compo");
	console.log(this.user.value.username);*/
	this.get_all_users();
	}

	async get_all_users() : Promise<UserI[]>
	{
		await this.http.get<UserI[]>(`http://localhost:3000/user/all_users`).subscribe(data => {
		this.all_users = data;
		})
		return this.all_users;
	}

	update_user()
	{
		console.log("updated");
		this.router.navigate(['/user/edit']);
	}

	match_history_route()
	{
		console.log("match_history");
		this.router.navigate(['/user/match_history']);
	}

	friends_route()
	{
		console.log("friends");
		this.router.navigate(['/user/friends']);
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

		while (i < this.all_users.length)
		{
			if (this.user.value.wins < this.all_users[i].wins)
				rank++;
			i++;
		}
		return rank;
	}
}
