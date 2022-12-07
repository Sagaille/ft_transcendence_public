import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateRoomComponent } from './components/create-room/create-room.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DirectMessageComponent } from './components/direct-message/direct-message.component';
import { FindChatroomComponent } from './components/find-chatroom/find-chatroom.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'create-room',
    component: CreateRoomComponent,
  },
  {
    path: 'find-chatroom',
    component: FindChatroomComponent,
  },
  {
    path: 'direct-message',
    component: DirectMessageComponent,
  },
  {
    path:'**',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }
