import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { ChatGateway } from './gateaway/chat.gateway';
import { RoomService } from './service/room-service/room.service';
import { ConnectedUserService } from './service/connected-user/connected-user.service';
import { AuthModule } from 'src/auth/auth.module';
import { JoinedRoomService } from './service/joined-room/joined-room.service';
import { ChatController } from './controller/chat.controller';
import { MuteUserService } from './service/mute-user/mute-user.service';
import { MessageService } from './service/message/message.service';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    AuthModule,
  ],
  providers: [
    RoomService,
    MessageService,
    ChatGateway,
    ConnectedUserService,
    JoinedRoomService,
    MuteUserService,
  ],
  controllers: [ChatController]
})
export class ChatModule {}
