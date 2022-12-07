import { Injectable } from '@nestjs/common';
import { JoinedRoomI } from 'src/chat/model/joined-room.interface';
import { RoomI } from 'src/chat/model/room.interface';
import { PrismaService } from 'src/prisma/prisma.service';


/* JoinedRoom keeps track of the current active connection in each chatRooms */
@Injectable()
export class JoinedRoomService {

    constructor(
        private prisma: PrismaService
    ) {}

    async create(joinedRoomUser: JoinedRoomI): Promise<JoinedRoomI> {
        return this.prisma.joinedRoom.create({
            data: {
                socketId: joinedRoomUser.socketId,
                user: {
                    connect: {
                        id: joinedRoomUser.user.id
                    }
                },
                room: {
                    connect: {
                        id: joinedRoomUser.room.id
                    }
                }
            },
            include: {
                user: true,
                room: true,
            }
        })
    }

    async deleteAll() {
        await this.prisma.joinedRoom.deleteMany({}).catch()
    }

    async deleteBySocketId(socketId: string) {
        return this.prisma.joinedRoom.deleteMany({ where: {socketId: socketId }})
    }

    /* A user joins and write in a chatroom -> find all user of that room to send notif */
    async findByRoom(room: RoomI): Promise<JoinedRoomI[]> {
        return this.prisma.joinedRoom.findMany({
            where: {
                room: {
                    id: room.id
                }
            },
            include: {
                room: true,
                user: true
            }
        })
    }

}
