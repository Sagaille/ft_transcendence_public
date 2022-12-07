import { Component } from '@angular/core';

@Component({
    selector: 'page-404',
    template: `
    <div class='center'>
      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5b/Hubble_Resolves_a_Blaze_of_Stars_in_a_Galaxy%27s_Core.jpg"/>
      <h1>This page doesn't exist!</h1>
      <a routerLink="/login" class="waves-effect waves-teal btn-flat">
        Back to the main page
      </a>
    </div>
  `
})
// routerLink allows us to directly use a redirect in the template

export class PageNotFoundComponent { }
