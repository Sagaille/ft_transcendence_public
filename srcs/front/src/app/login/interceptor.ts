import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent } from "@angular/common/http";
import { BehaviorSubject, catchError, NEVER, Observable, throwError } from 'rxjs';
import {JwtHelperService} from '@auth0/angular-jwt';
import { Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { UserI } from "../user/user.interface";

//  https://stackoverflow.com/questions/64877273/angular-redirect-page-if-http-response-is-401

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

	user$: BehaviorSubject<UserI>
	constructor(private jwtHelper: JwtHelperService, private router: Router, private authService: AuthService) {
		this.user$ = this.authService.user$;
	}

    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {
		let idToken;
		if (this.user$.value.id == undefined)
		{
			idToken = localStorage.getItem(`id_token`);
		}
		else
       	{
			idToken = localStorage.getItem(`id_token${this.user$.value.id}`);
			if (idToken == null)
				idToken = localStorage.getItem(`id_token`);
		}

		if (idToken != null && this.jwtHelper.isTokenExpired(idToken))
		{
			this.authService.isLoggedIn = false;
			localStorage.removeItem(idToken);
			idToken = null;
			console.log("old jwt!!!!!!!!!");
			this.router.navigate(['/login'])
		}

			if (idToken) {  // add the jwt in the headers
				const cloned = req.clone({
					headers: req.headers.set("Authorization",
						"Bearer " + idToken)
				});
				return next.handle(cloned);
			}
			return next.handle(req).pipe(catchError(error => {
		if (!!error.status && error.status === 401) {
			window.location.href = '/login';
			return NEVER;
		}
		return throwError(error);
		}));
	}
}
