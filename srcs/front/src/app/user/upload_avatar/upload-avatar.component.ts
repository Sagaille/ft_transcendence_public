import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from '../user.interface';
import { UserService } from '../user.service';
import { ImageService } from './imageservice.service';

class ImageSnippet {
  constructor(public src: string, public file: File) {}
}

@Component({
  selector: 'app-upload-avatar',
  templateUrl: './upload-avatar.component.html',
  styles: [`
		.img-responsive {
			max-width: 500px;
			max-height: 500px;
}`
  ]
})
export class UploadAvatarComponent
	{
	private sanitizer: DomSanitizer;
	public image : any;
	private readonly imageType : string = 'data:image/PNG;base64,';
	temp:any;
  selectedFile: ImageSnippet;
	user: BehaviorSubject<UserI>;
  constructor(private imageService: ImageService, private authService: AuthService, public userService: UserService)
	{
		this.user = this.authService.user$;
	}

  processFile(imageInput: any) {
	console.log("image size = ");
	console.log(imageInput.files[0].size);
	if (imageInput.files[0].size > 2900000)
	{
		console.log("image size too big");
		return ;
	}
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {

      this.selectedFile = new ImageSnippet(event.target.result, file);

      this.imageService.uploadImage(this.selectedFile.file)
    });

    reader.readAsDataURL(file);
  }

	/*getImage(){
  this.imageService.get_image(this.user)
    .subscribe((data :any) => {
  this.image = this.sanitizer.bypassSecurityTrustUrl(this.imageType + data.content);
})}*/

	public getLinkPicture(url: string)
	{
    // Force reloading the logo image in the template via call to server with randomized URI. URI of image is the
	// same, however it has to change for Angular to reload it.
	let temp = "dfdsfds" + new Date().getTime();
	temp = url;
	return (temp)
	}
}
