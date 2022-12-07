import { Injectable } from '@nestjs/common';
import { MessageI, MessagePaginatedI } from 'src/chat/model/message.interface';
import { PageI } from 'src/chat/model/page.interface';
import { Pagination } from 'src/chat/model/pagination.type';
import { RoomI } from 'src/chat/model/room.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {

    constructor(
        private prisma: PrismaService
    ) {}

    async create(message: MessageI): Promise<MessageI> {
        return this.prisma.message.create({
            data: {
                text: message.text,
                user: {
                    connect: {
                        id: message.user.id
                    }
                },
                room: {
                    connect: {
                        id: message.room.id
                    }
                }
            },
            include: {
                user: true,
                room: true
            }
        })
    }

    async countMessagesForRoom(roomId: number): Promise<number> {
        return await this.prisma.message.count({
            where: {
                room: {
                    id: roomId
                },
            }
        })
    }

    /* Return pagination of Messages for Users */
    async getMessagesForRoom(roomId: number, options: PageI): Promise<MessageI[]> {
        return await this.prisma.message.findMany({
            where: {
                room: {
                    id: roomId
                },
            },
            include: {
                room: true,
                user: true,
            },
            take: options.limit,
            skip: (options.page - 1) * options.limit,
            orderBy: {
                updatedAt: 'desc'
            },
        })
    }

    async getPaginatedMessages(room: RoomI, options: PageI): Promise<MessagePaginatedI> {
        const messages = {} as MessagePaginatedI;
        messages.items = await this.getMessagesForRoom(room.id, options);
        messages.pagination = {
            totalItems: await this.countMessagesForRoom(room.id),     // length of all rooms
            itemCount: Math.ceil(messages.items.length / options.limit), 
            itemsPerPage: options.limit,
            totalPages: Math.ceil(messages.items.length / options.limit),
            currentPage: 0,
        }
        return messages;
    }
}
