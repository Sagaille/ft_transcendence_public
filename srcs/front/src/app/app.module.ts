import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { UserComponent } from './user/user.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ConfirmationComponent } from './login/confirmation/confirmation.component';
import { UserFormComponent } from './user/user-form/user-form.component';
import { UploadAvatarComponent } from './user/upload_avatar/upload-avatar.component';
import { AuthInterceptor } from './login/interceptor';
import { HomeComponent } from './home/home.component';

import { GameModule } from './game/game.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { JwtModule } from "@auth0/angular-jwt";
import { DatePipe } from '@angular/common';

export function tokenGetter() {
  return localStorage.getItem("access_token");
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponent,
    UserComponent,
	  UserFormComponent,
	  // UploadAvatarComponent,
	  HomeComponent,
  ],
  imports: [
    BrowserModule,
	GameModule,
	CommonModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        /*allowedDomains: ["example.com"],*/
        disallowedRoutes: ["http://example.com/examplebadroute/"],
      },
    }),
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
