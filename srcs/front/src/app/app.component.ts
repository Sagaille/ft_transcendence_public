import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent
{

	title = 'transcendence-front';

	constructor(private router: Router)
	{}

	go_to_menu() {
		this.router.navigate(['/home']);
	}
}
