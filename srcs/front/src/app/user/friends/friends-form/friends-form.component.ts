import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserI } from '../../user.interface';
import { AuthService } from 'src/app/login/auth.service';
import { BehaviorSubject } from "rxjs";
import { Router } from '@angular/router';

@Component({
  selector: 'app-friends-form',
  templateUrl: './friends_form.component.html',
})
export class FriendsFormComponent implements OnInit {

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

	is_friend(user: string)  // check if friend is added
	{
		if (this.user.value.friends.indexOf(user) < 0)
			return false;
		return true
	}

  go_to_userprofile(user: UserI)
  {
    this.router.navigate(['/profile/', user.username])
  }
}
