import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { UserService } from 'src/user/user.service';
import { PlayerService } from './player/player.service';

@Module({
	providers: [GameGateway, GameService, UserService, PlayerService]
})
export class GameModule { }
