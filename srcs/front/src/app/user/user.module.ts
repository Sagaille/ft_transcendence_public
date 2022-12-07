import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FriendComponent } from './friends/user.friends.component';
import { UserFormComponent } from './user-form/user-form.component';
import { UploadAvatarComponent } from './upload_avatar/upload-avatar.component';
import { FriendsFormComponent } from './friends/friends-form/friends-form.component';
import { ProfileComponent } from './profile/profile.component';
import { MatchHistoryComponent } from './match-history/match-history.component';
import { EmailComponent } from './user-form/email/email.component';



@NgModule({
  declarations: [
	FriendComponent,
 FriendsFormComponent,
 ProfileComponent,
 MatchHistoryComponent,
 EmailComponent,
	// UploadAvatarComponent,
  ],
  imports: [
    CommonModule,
	FormsModule
  ]
})
export class UserModule { }
