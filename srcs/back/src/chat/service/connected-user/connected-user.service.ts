import { Injectable } from '@nestjs/common';
import { ConnectedUserI } from 'src/chat/model/connected-user.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserI } from 'src/user/user.interface';

@Injectable()
export class ConnectedUserService {

    constructor(
        private prisma: PrismaService,
    ) {}

    async create(socketId: string, user: UserI): Promise<ConnectedUserI> {
        return this.prisma.connectedUser.upsert({
            where: {
                socketId: socketId
            },
            update: {},
            create: {
                socketId: socketId,
                user: {
                    connect: {          // One to Many connection done on the User entry, not the created_by_id
                        id: user.id
                    }, 
                },
            }
        })
    }
    
    async findByUser(user: UserI): Promise<ConnectedUserI[]> {
        return this.prisma.connectedUser.findMany({
            where: {
                user_id: user.id
            }
        })
    }

    async findBySocket(socketId: string) {
        return this.prisma.connectedUser.findUnique({
            where: {
                socketId: socketId
            }
        })
    }
    
    async deleteBySocketId(socketId: string){
        return this.prisma.connectedUser.delete({
            where: {
                socketId: socketId
            }
        })
    }

    async deleteAll() {
        await this.prisma.connectedUser.deleteMany({}).catch()
    }

}
