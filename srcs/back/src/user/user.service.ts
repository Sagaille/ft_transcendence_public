import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { copyFileSync } from 'fs';
import { use } from 'passport';
import { AuthService } from 'src/auth/auth.service';
import { validatorDto } from 'src/auth/validator';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UserDTO } from './user.dto';

@Injectable()
export class UserService
{
	constructor(
		private prisma: PrismaService,
	)
	{}

	async create(dto: CreateUserDto)
	{
		if (dto.username != null && dto.username != "")
		{
		try {
		await this.prisma.user.create({
			data:
			{
				username: dto.username,
				avatar: dto.avatar,
				ingame_name: dto.username,
				wins: 0,
				losses: 0,
				ladder_lvl: 0,
				match_history: "",
				two_factor: false,
				friends: "",
				status: "offline",
				rooms: {},
				admin_of_room: {},
				created_room: {},
				messages: {},
				joined_rooms: {},
				connections: {},
				email: dto.email,
			}
		})} catch (e) {  // value duplicate and generating random values
				console.log(
				  'There is a unique constraint violation, a new user cannot be created with this email'
				)
				while (e != null)
				{
					e = null;
			  console.log(e);
			  try {
				console.log("catched a value duplicate, generating random values")
			  let r = (Math.random() + 1).toString(36).substring(2);
				await this.prisma.user.create({
					data:
					{
						username: dto.username,
						avatar: dto.avatar,
						ingame_name: r,
						wins: 0,
						losses: 0,
						ladder_lvl: 0,  
						match_history: "",
						two_factor: false,
						friends: "",
						status: "offline",
						rooms: {},
						admin_of_room: {},
						created_room: {},
						messages: {},
						joined_rooms: {},
						connections: {},
						email: r + "@hotmail.com",
					}})} catch (e){}}
				}}
	}

	public getOne(id: number): Promise<User> {
		if (id != null)
		{
		try {
		const user = this.prisma.user.findUnique({
			where: {
				id: id,
			},
			include: {
				rooms: true,
				admin_of_room: true,
				ownerRoom: true,
				blockingUsers: true,
			}
		})
		return user;}
		catch
		{ console.log(
			'cannot find user by id'
		  )
		  throw new UnauthorizedException('Cannot get user by id'); ;}}
	}

	public getOneById(id: number): Promise<User> {
		if (id != null)
		{
		try {
		const user = this.prisma.user.findUnique({
			where: {
				id: id,
			}
		})
		return user;}
		catch
		{ console.log(
			'cannot find user by id'
		  )
		  throw new UnauthorizedException('Cannot get user by id'); ;}}
	}

	async findByUserName(username: string)
	{
		if (username != null && username != "")
		{
		try {
			return await this.prisma.user.findUnique({
				where: {
					username: username,
				},
				include: {
					blockedByUsers:	true,
					blockingUsers:	true,
				}})
		} catch { 
			console.log( 'cannot find user' )
		}
		}
	}

	async findbyEmail(email: string)
	{
		if (email != null && email != "")
		{
		try {
		return await this.prisma.user.findUnique({where: {
			email: email,
		}})} catch
		{ console.log(
			'cannot find user by email'
		  )
		return null
		}
		}
	}

	async updateUser(user: any)
	{
		try {
		if (user.username != null && user.username != "")
		{
			try {
				await validatorDto(UserDTO, user, 'Cannot update user');
				} catch (errors) {
				console.log(errors);
				throw new UnauthorizedException('validator error on post /update');
			}
			/* Proceed to delete relational fields if  only User already exists */
			// let count = await this.prisma.user.count({where: { username: user.username }});
			// console.log("---------count------------");
			// console.log(count);
			// if (count > 0)
			// {
			// }
			
			await this.prisma.user.upsert({
			where: {
				username: user.username,
			},
			update:
			{
				avatar: user.avatar,
				ingame_name: user.ingame_name,
				wins: user.wins,
				losses: user.losses,
				ladder_lvl: user.ladder_lvl,
				match_history: user.match_history,
				two_factor: user.two_factor,
				friends: user.friends,
				status: user.status,
				rooms: user.rooms,
				admin_of_room: user.admin_of_room,
				created_room: user.created_room,
				messages: user.messages,
				joined_rooms: user.joined_rooms,
				connections: user.connections,
				email: user.email,
				blockingUsers: {
					connect: user.blockingUsers?.map((u: any) => ({
						id: u.id
					}))
                },
				blockedByUsers: {
                    connect: user.blockedByUsers?.map((u: any) => ({
                        id: u.id
                    }))
                },

			},
			create:
			{
				username: user.username,
				avatar: user.avatar,
				ingame_name: user.ingame_name,
				wins: user.wins,
				losses: user.losses,
				ladder_lvl: user.ladder_lvl,
				match_history: user.match_history,
				two_factor: user.two_factor,
				friends: user.friends,
				status: user.status,
				rooms: {},
				admin_of_room: {},
				created_room: {},
				messages: {},
				joined_rooms: {},
				connections: {},
				email: user.email,
			}
		})
		/*if (user.status == "offline" && user.username != "" && user.username != null)
			this.*/
		}} catch { console.log(
			'cannot update user'
		  )
		return null
		}
	}

	async	findAllByUsername(username: string): Promise<User[]> {
		if (username != null && username != "")
		{
		try {
		const user = await this.prisma.user.findMany({
			where: {
				username: { contains: `${username.toLowerCase()}` },
			},
		})
		return user;}
		catch
		{ console.log(
			'cannot find user by name'
		  )}
	}}

	async	blockUser(byUserId: number, targetUserId: number) {
		await this.prisma.user.update({
			data: {
				blockingUsers: {
					connect: {
						id: targetUserId
					}
				}
			},
			where: {
				id: byUserId
			}
		})
	}

	async	unBlockUser(byUserId: number, targetUserId: number) {
		await this.prisma.user.update({
			data: {
				blockingUsers: {
					disconnect: {
						id: targetUserId
					}
				}
			},
			where: {
				id: byUserId
			}
		})
	}
}
