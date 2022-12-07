import { Injectable } from '@nestjs/common';
import { MutedRoomI } from 'src/chat/model/muted-room.interface';
import { RoomI } from 'src/chat/model/room.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserI } from 'src/user/user.interface';

@Injectable()
export class MuteUserService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async muteUser(roomId: number, targetUserId: number, endMuteAt: Date): Promise<MutedRoomI> {

        return this.prisma.mutedRoom.create({
            data: {
                mutedUser: {
                    connect: {
                        id: targetUserId
                    }
                },
                room: {
                    connect: {
                        id: roomId
                    }
                },
                endAt: endMuteAt,
            },
            /* Return the full object MutedRoom in the response */
            include: {
                mutedUser: true,
                room: true
            }
        })
    }

    async unmuteUser(roomId: number, targetUserId: number) {
        await this.prisma.mutedRoom.deleteMany({ 
            where: {
                room: {
                    id: roomId,
                },
                mutedUser: {
                    id: targetUserId
                }
            }
         }).catch()
    }
}
