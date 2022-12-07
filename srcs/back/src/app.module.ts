import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';

@Module({
	imports: [
		ServeStaticModule.forRoot({  // test with build
			rootPath: join(__dirname, '..', 'client'),
		}),
		ConfigModule.forRoot({ isGlobal: true }),  // for the .env
		PrismaModule,
		UserModule,
		AuthModule,
		GameModule,
		ChatModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {};
