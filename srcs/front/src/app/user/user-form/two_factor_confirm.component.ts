import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from '../user.interface';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-form',
  template: ``,
})
export class TwoFactorConfirmation {

	email: string;
	jwt: string;
	user: BehaviorSubject<UserI>;

	constructor(private authService: AuthService, private route: ActivatedRoute, private http:HttpClient, private router: Router) {
		this.user = this.authService.user$;
	}

	ngOnInit()
	{
		this.route.queryParams
		.subscribe(params => {
			this.email = this.route.snapshot.queryParams['email'],
			this.jwt = this.route.snapshot.queryParams['jwtoken']
		})

		console.log("two_factor check")
		let observable = this.http.post<any>(`http://localhost:3000/auth/verification?email=${this.email}&jwt=${this.jwt}`, {'Authorization': `${this.jwt}`} );

		observable.subscribe({
		next: async (value) => {
				await this.authService.storeUser(value);  // value is the access_token
				//this.authService.isLoggedIn = true;  // user is cleared for the angular guards
				//this.authService.user$.value.status = "online";
				},
		error: (err) => (this.router.navigate(['home']), console.log("jwt denied"), console.log(err)),	// catches the BadRequestException of the back;
	});
	}
}
