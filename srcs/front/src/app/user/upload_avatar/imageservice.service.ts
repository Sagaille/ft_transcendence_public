import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, RouterPreloader } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from '../user.interface';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

	user: BehaviorSubject<UserI>;
    constructor(private http: HttpClient, public authService: AuthService, private router: Router, private userService: UserService)
	{
		this.user = this.authService.user$;
	}

// if enough time, optimize cache with http header options (should be backend)
// we append date + time to refresh the image (if the image has the same name, it uses the cache and the image isn't the new one)
public async uploadImage(image: File)
{
    const formData = new FormData();

    await formData.append('image', image, this.user.value.username + '.' + image.name.split('.').pop());
	this.user.value.avatar = await "http://localhost:3000/user/" + this.user.value.username + '.' + image.name.split('.').pop() + '?' + new Date().getTime();
	await this.http.post('http://localhost:3000/user/upload_img', formData).subscribe();
	await this.userService.updateUser(this.user).subscribe;
	this.router.navigate(['/user/edit']);
}
}

