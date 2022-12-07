import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { TwoFactorService } from './two_factor/two_factor.service';
import { TwoFactorModule } from './two_factor/two_factor.module';

@Module({
  imports: [
	PrismaModule,
	ConfigModule,
	/*ConfigService,*/
	JwtModule.register({}),
	UserModule,
	TwoFactorModule,
	],
  controllers: [AuthController],
  exports: [AuthService],
  providers: [AuthService, JwtStrategy, TwoFactorService]
})
export class AuthModule {}
