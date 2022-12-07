import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MatListModule } from '@angular/material/list';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CreateRoomComponent } from './components/create-room/create-room.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { SelectUsersComponent } from './components/select-users/select-users.component';
import { MatIconModule } from '@angular/material/icon';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FindChatroomComponent, JoinChatroomDialog } from './components/find-chatroom/find-chatroom.component';
import {MatDialogModule} from '@angular/material/dialog';
import { MatMenuModule} from '@angular/material/menu';
import { DirectMessageComponent } from './components/direct-message/direct-message.component';
import { DisplayUserListComponent, MuteUserDialog } from './components/display-user-list/display-user-list.component';
import { UpdateChatroomDialog } from './components/update-room/update-chatroom.dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';



@NgModule({
  declarations: [
    DashboardComponent,
    CreateRoomComponent,
    SelectUsersComponent,
    ChatRoomComponent,
    ChatMessageComponent,
    SidebarComponent,
    ChatRoomComponent,
    FindChatroomComponent,
    JoinChatroomDialog,
    DirectMessageComponent,
    DisplayUserListComponent,
    MuteUserDialog,
    UpdateChatroomDialog,
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    MatListModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatIconModule,
    FormsModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
    ScrollingModule

  ],
  providers: [
    DatePipe,
  ],
})
export class ChatModule { }

