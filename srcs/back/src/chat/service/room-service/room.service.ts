import { Injectable } from '@nestjs/common';
import { Room, User } from '@prisma/client';
import { PageI } from 'src/chat/model/page.interface';
import { RoomI, RoomPaginatedI } from 'src/chat/model/room.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserI } from 'src/user/user.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RoomService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async createRoom(room: RoomI, creator: UserI): Promise<RoomI> {
        const newRoom = this.addCreatorToRoom(room, creator);
        return this.prisma.room.create({
            data: {
                name: newRoom.name,
                description: newRoom.description,
                type: newRoom.type,
                password: (newRoom.password) ? newRoom.password : '',
                users: {
                    connect: newRoom.users?.map(user => ({
                        id: user.id
                    }))
                },
                adminUsers: {
                    connect: newRoom.adminUsers?.map(user => ({
                        id: user.id
                    }))
                },
                bannedUsers: {},
                mutedUsers: {},
                joined_users: {},
                messages: {},
                createdBy: {
                    connect: {          // One to Many connection done on the User entry, not the created_by_id
                        id: newRoom.createdBy.id,
                    },
                },
                ownedByUser: {
                    connect: {
                        id: newRoom.ownedByUser.id,
                    },
                },
            },
            /* Return the full object Users in the response */
            include: {
                users: true
            }
        })
    }

    async createDirectMessage(userTarget: UserI, creator: UserI): Promise<RoomI> {
        return this.prisma.room.create({
            data: {
                name: "DM",
                description: '',
                type: 'directMessage',
                password: '',
                users: {
                    connect: [userTarget, creator].map(user => ({
                        id: user.id
                    }))
                },
                adminUsers: {},
                bannedUsers: {},
                mutedUsers: {},
                joined_users: {},
                messages: {},
                createdBy: {
                    connect: {
                        id: creator.id
                    },
                },
                ownedByUser: {
                    connect: {
                        id: creator.id,
                    },
                },
            },
            /* Return the full object Users in the response */
            include: {
                users: true
            }
        })
    }

    async getRoom(roomId: number): Promise<RoomI> {
        return await this.prisma.room.findUnique({
            where: {
                id: roomId
            },
            include: {
                users: true,
                adminUsers: true,
                bannedUsers: true,
                ownedByUser: true,
                mutedUsers: true,
                messages: true,
            }
        })
    }

    async getMyDirectMessages(userName: string): Promise<RoomI[]> {
        return await this.prisma.room.findMany({
            where: {
                users: {
                    some: {
                        username: {
                            equals: userName,
                        }
                    }
                },
                type: 'directMessage'
            },
            include: {
                users: true
            }
        })
    }

    /* Add creator User to Room Object */
    addCreatorToRoom(room: RoomI, creator: UserI): RoomI {
        room.ownedByUser = creator;
        room.createdBy = creator;
        room.users.push(creator);
        if (!room.adminUsers)
            room.adminUsers = [];
        room.adminUsers.push(creator);
        return room;
    }

    /* Add user to the chatRoom */
    async joinChatRoom(room: RoomI, newUser: User) {
        await this.prisma.room.update({
            data: {
                users: {
                    connect: {
                        id: newUser.id
                    }
                }
            },
            where: {id: room.id}
        });
    }

    /* Remove a user from the chatRoom */
    async leaveChatRoom(room: RoomI, newUser: User) {
        await this.prisma.room.update({
            data: {
                users: {
                    disconnect: {
                        id: newUser.id
                    }
                }
            },
            where: {id: room.id}
        });
    }

    async updateChatRoom(room: RoomI) {
        await this.prisma.room.update({
            data: {
                name: room.name,
                description: room.description,
                type: room.type,
                password: room.password,
                users: {
                    connect: room.users?.map(user => ({
                        id: user.id
                    }))
                },
                adminUsers: {
                    connect: room.adminUsers?.map(user => ({
                        id: user.id
                    }))
                },
                bannedUsers: {
                    connect: room.bannedUsers?.map(user => ({
                        id: user.id
                    }))
                },
                ownedByUser: {
                    connect: {
                        id: room.ownedByUser.id
                    }
                }, 
                mutedUsers: {
                    connect: room.mutedUsers?.map(user => ({
                        id: user.id
                    }))
                },
            },
            where: {id: room.id}
        });
    }

    async giveAdminRight(selectedRoom: RoomI, userId: number) {
        await this.prisma.room.update({
            data: {
                adminUsers: {
                    connect: selectedRoom.adminUsers?.map(user => ({
                        id: userId
                    }))
                },
            },
            where: {id: selectedRoom.id}
        });
    }

    async banUserFromChat(selectedRoom: RoomI, targetUserId: number) {
        await this.prisma.room.update({
            data: {
                adminUsers: {
                    disconnect:{
                        id: targetUserId
                    },
                },
                users: {
                    disconnect:{
                        id: targetUserId
                    },
                },
                bannedUsers: {
                    connect: {
                        id: targetUserId
                    }
                }
            },
            where: {id: selectedRoom.id}
        });
    }

    /* Return number of Rooms for Users */
    async countRoomsForUser(userId: number): Promise<number> {
        return await this.prisma.room.count({
            where: {
                users: {
                    some: {
                        id: {
                            equals: userId,
                        }
                    }
                }
            }
        })
    }

    /* Return number of Rooms for Users */
    async countPublicRooms(userId: number): Promise<number> {

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                bannedRooms: true,
                rooms: true
            }
        });

        const roomsToExclude: number[] = [];
        if (user && user.bannedRooms) {
            for (let room of user.bannedRooms) {
                roomsToExclude.push(room.id);
            }
        }
        if (user && user.rooms) {
            for (let room of user.rooms) {
                roomsToExclude.push(room.id);
            }
        }

        return await this.prisma.room.count({
            where: {
                type: {
                    in: ['public', 'protected']
                },
                id: {
                    notIn: roomsToExclude
                }
            }
        })
    }

    /* Return pagination of Rooms for Users */
    async getRoomsForUser(userId: number, options: PageI): Promise<RoomI[]> {
        return await this.prisma.room.findMany({
            where: {
                users: {
                    some: {
                        id: {
                            equals: userId,
                        }
                    }
                }
            },
            // take: options.limit,
            // skip: (options.page - 1) * options.limit,

            orderBy: {
                updatedAt: 'desc'
            },
            include: {
                messages: true,
                users: true,
                adminUsers: true,
                bannedUsers: true,
                mutedUsers: true,
                createdBy: true,
                ownedByUser: true
            }
        })
    }

    /* Return pagination of Public + Protected Rooms */
    async getPublicRooms(userId: number): Promise<RoomI[]> {

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                bannedRooms: true,
                rooms: true
            }
        });

        const roomsToExclude: number[] = [];
        if (user && user.bannedRooms) {
            for (let room of user.bannedRooms) {
                roomsToExclude.push(room.id);
            }
        }
        if (user && user.rooms) {
            for (let room of user.rooms) {
                roomsToExclude.push(room.id);
            }
        }

        return await this.prisma.room.findMany({
            where: {
                type: {
                    in: ['public', 'protected']
                },
                id: {
                    notIn: roomsToExclude
                }
            },
            // take: options.limit,
            // skip: (options.page - 1) * options.limit,

            orderBy: {
                updatedAt: 'desc'
            },
            include: {
                bannedUsers: true,
            }
        })
    }

    /* Get rooms paginated with options, and also set Data for pagination */
    async getPaginatedRoomsForUser(userId: number, options: PageI): Promise<RoomPaginatedI> {
        const rooms = {} as RoomPaginatedI;
        rooms.items = await this.getRoomsForUser(userId, options);
        rooms.pagination = {
            totalItems: await this.countRoomsForUser(userId),     // length of all rooms
            itemCount: Math.ceil(rooms.items.length / options.limit),
            itemsPerPage: options.limit,
            totalPages: Math.ceil(rooms.items.length / options.limit),
            currentPage: 0,
        }
        return rooms;
    }

    /* Get public and protected rooms paginated with options, and also set Data for pagination */
    async getPaginatedPublicRooms(userId: number): Promise<RoomPaginatedI> {
        const rooms = {} as RoomPaginatedI;
        rooms.items = await this.getPublicRooms(userId);
        // rooms.pagination = {
        //     totalItems: await this.countPublicRooms(userId),     // length of all rooms
        //     itemCount: Math.ceil(rooms.items.length / options.limit),
        //     itemsPerPage: options.limit,
        //     totalPages: Math.ceil(rooms.items.length / options.limit),
        //     currentPage: 0,
        // }
        return rooms;
    }
}
