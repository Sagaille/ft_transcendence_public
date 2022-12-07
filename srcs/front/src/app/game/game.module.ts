import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';

import { RouterModule, Routes } from '@angular/router';
import { SpectateComponent } from './spectate/spectate.component';

// const gameRoutes: Routes = [
// 	{ path: 'game', component: GameComponent}
// ]

@NgModule({
	declarations: [
		GameComponent,
		SpectateComponent
	],
	imports: [
		CommonModule,
		// RouterModule.forChild(gameRoutes),
	]
})
export class GameModule { }
