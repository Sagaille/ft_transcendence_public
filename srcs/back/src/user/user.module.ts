import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController]
})
export class UserModule {}
