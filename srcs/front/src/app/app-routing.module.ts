import { Host, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { SpectateComponent } from './game/spectate/spectate.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './login/auth.guard';
import { ConfirmationComponent } from './login/confirmation/confirmation.component';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { FriendsFormComponent } from './user/friends/friends-form/friends-form.component';
import { FriendComponent } from './user/friends/user.friends.component';
import { MatchHistoryComponent } from './user/match-history/match-history.component';
import { ProfileComponent } from './user/profile/profile.component';
import { UploadAvatarComponent } from './user/upload_avatar/upload-avatar.component';
import { DemandPending } from './user/user-form/email/demand_pending';
import { EmailComponent } from './user/user-form/email/email.component';
import { TwoFactorConfirmation } from './user/user-form/two_factor_confirm.component';
import { UserFormComponent } from './user/user-form/user-form.component';
import { UserComponent } from './user/user.component';

// route order is important!
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },  //uncomment
  { path: 'profile/:user', component: ProfileComponent, canActivate: [AuthGuard] },  //uncomment
  { path: 'profile/match_history/:user', component: MatchHistoryComponent, canActivate: [AuthGuard] },  //uncomment
  { path: 'user', component: UserComponent, canActivate: [AuthGuard] },  //uncomment
  { path: 'user/friends', component: FriendComponent, canActivate: [AuthGuard] },  //uncomment
  { path: 'user/friends/friends_form', component: FriendsFormComponent, canActivate: [AuthGuard] },  //uncomment
  { path: 'user/edit', component: UserFormComponent, canActivate: [AuthGuard] },  //uncomment
  { path: 'user/edit/email', component: EmailComponent, canActivate: [AuthGuard] },  //uncomment
  { path: 'user/upload', component: UploadAvatarComponent, canActivate: [AuthGuard] },  //uncomment
  { path: 'user/match_history', component: MatchHistoryComponent, canActivate: [AuthGuard] },  //uncomment
  { path: 'demand_pending', component: DemandPending }, // register
  { path: 'user/edit/two_factor/confirm', component: TwoFactorConfirmation }, // register
  { path: 'confirmation', component: ConfirmationComponent }, // part of the login
   /* Seperate routes related to chat to ChatModule to simplify this page */
  {
    path: 'chat', canActivate: [AuthGuard], loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule)
  },
  { path: 'game', component: GameComponent, canActivate: [AuthGuard]}, //Game component route
  { path: 'spectate', component: SpectateComponent, canActivate: [AuthGuard]}, //Spectator mode route
  { path: '**', component: PageNotFoundComponent }  // '**' means every call but since it is at the end of the list, it means every other call
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
