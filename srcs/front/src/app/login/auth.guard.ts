import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
    )
  {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;
    return this.checkLogin(url);
}

  checkLogin(url: string): boolean {
    if (this.authService.isLoggedIn)
	{
		/*console.log("true at guard")*/
		return true;
	}
	/*console.log("false at guard")
	console.log(url);*/
    this.router.navigate(['/login']);
    return false;
  }
}

