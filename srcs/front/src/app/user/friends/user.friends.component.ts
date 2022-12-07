import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { AuthService } from "src/app/login/auth.service";
import { UserI } from "../user.interface";
import { UserModule } from "../user.module";

@Component({
  selector: 'app-user-form',
  templateUrl: './user.friends.component.html',
  styles: ['.pull-right {line-height:50px;}']
})
export class FriendComponent implements OnInit {

	all_users: Array<UserI>
	user: BehaviorSubject<UserI>;

	constructor(private http: HttpClient, private authService: AuthService, private router: Router)
	{
		this.user = this.authService.user$;
	}

	ngOnInit(): void {
		this.get_all_users();
	}

	async get_all_users()
	{
		await this.http.get<UserI[]>(`http://localhost:3000/user/all_users`).subscribe(data => {
		this.all_users = data;
		})
		return this.all_users;
	}

	add_friend()
	{
		this.router.navigate(['/user/friends/friends_form'])
	}

	go_to_userprofile(username: string)
	{
		this.router.navigate(['/profile/', username])
	}

	is_friend(user: string)  // check if friend is added
	{
		if (this.user.value.friends.indexOf(user) < 0)
			return false;
		return true
	}
}
