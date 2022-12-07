import { HttpClient, HttpParams } from '@angular/common/http';
import { ConstantPool } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { GameService } from 'src/app/game/game.service';
import { UserI } from 'src/app/user/user.interface';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-logging',
  template: `
	<div id="test">
			<p></p>
			<p></p>
	<h1>Intra 42 may be slow, wait a bit</h1>
    <h1>If 2FA is active, check your mailbox and use the link to be redirected</h1>
</div>
  `,
styles: [`#test h1 {
    margin-top: 25px;
    font-size: 21px;
    text-align: center;

    -webkit-animation: fadein 5s; /* Safari, Chrome and Opera > 12.1 */
       -moz-animation: fadein 5s; /* Firefox < 16 */
        -ms-animation: fadein 5s; /* Internet Explorer */
         -o-animation: fadein 5s; /* Opera < 12.1 */
            animation: fadein 5s;
}

@keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Firefox < 16 */
@-moz-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Safari, Chrome and Opera > 12.1 */
@-webkit-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Internet Explorer */
@-ms-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Opera < 12.1 */
@-o-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}`]
})

export class ConfirmationComponent implements OnInit
{
	user: BehaviorSubject<UserI>;
	code: string;
	constructor(
		private route: ActivatedRoute,
		private http: HttpClient,
		private router: Router,
		public authService: AuthService,
		private gameService: GameService
		) {this.user = this.authService.user$;}

	ngOnInit() {
		if (this.authService.isLoggedIn == true)
		{
			this.router.navigate(['home']);
			return
		}
    	this.route.queryParams
      .subscribe(params => {
        /*console.log(params);*/  // should contain the code in the url
		this.code = this.route.snapshot.queryParams['code'];  // get the code in the url form the 42 api
			//delete
			/*if (this.authService.player1 == true)
				this.code = "player1";
			if (this.authService.player2 == true)
				this.code = "player2";
			if (this.authService.player3 == true)
				this.code = "player3";
			if (this.authService.player4 == true)
				this.code = "player4";*/
			//till here
		let code: string;
		code = this.code;
		this.authService.code = code;
      }
    );
	let observable = this.http.post<any>('http://localhost:3000/auth/access_token', {
		code:this.code
	});

	observable.subscribe({
		next: async (value) => {
				this.authService.isLoggedIn = true;  // user is cleared for the angular guards
				/*console.log("value");
				console.log(value);*/
				if (value == null)
				{
						this.authService.isLoggedIn = false;
						await this.router.navigate(['demand_pending']);
						this.gameService.socket.disconnect();
						return ;
				}
				await this.authService.storeUser(value);  // value is the access_token
				/*this.router.navigate(['home']);*/
				},
		error: (err) => (this.authService.error_login = true, this.router.navigate(['login'])),	// catches the BadRequestException of the back;
	});
  }
}
