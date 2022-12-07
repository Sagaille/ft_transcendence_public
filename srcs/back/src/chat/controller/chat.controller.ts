import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoomService } from '../service/room-service/room.service';

@Controller('chat')
export class ChatController {
    constructor(private roomService: RoomService) {}

    @Get('/find-my-dm')
	@UseGuards(AuthGuard('jwt'))
	async getMyDirectMessages( @Query('username') username: string ) {
		return await this.roomService.getMyDirectMessages(username);
	}
}
