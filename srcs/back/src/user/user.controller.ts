import { Body, Controller, Get, Header, Param, Post, Query, Req, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ProfileDTO, ReqDTO, UserDTO } from './user.dto';
import { validatorDto } from 'src/auth/validator';

@Controller('user')
export class UserController {
	constructor(private prisma: PrismaService, private userService: UserService) { }

	@Get('/me')
	@UseGuards(AuthGuard('jwt'))  // 'jwt' is internally linked to the strategy  // uncomment
	async getme(@Req() req: ReqDTO)  // req is inside the access token, guards have to be up so we can access it
	{
		try {
			await validatorDto(UserDTO, req.user, 'Cannot update user');
		} catch (errors) {
			console.log(errors);
			throw new UnauthorizedException('validator error on get /me');
		}

		try {
			const user = await this.userService.findByUserName(req.user.username);
			await this.userService.updateUser(user);
			if (!user) {
				console.log("user not found")
				return;
			}
			return user;
		}
		catch (e) {
			console.log(e);
			throw new UnauthorizedException('Cannot update user');
		}
	}

	@Get('/find-by-username')
	@UseGuards(AuthGuard('jwt'))
	async findAllByUsername(@Query('username') username: string) {
		return this.userService.findAllByUsername(username);
	}

	@Post('/update')
	@UseGuards(AuthGuard('jwt'))
	async updateUserName(@Req() req: ReqDTO, @Body() UserName: any) {
		try {
			await validatorDto(UserDTO, req.user, 'Cannot update user');
		} catch (errors) {
			console.log(errors);
			throw new UnauthorizedException('validator error on post /update');
		}
		if (req.user.username == UserName.payload._value.username) {
			try {
				await this.userService.updateUser(UserName.payload._value);
			} catch (e) {
				console.log(e);
				throw new UnauthorizedException('Cannot update user');
			}
		}
	}

	@Post('upload_img')
	@UseGuards(AuthGuard('jwt'))
	@UseInterceptors(FileInterceptor('image', {
		storage: diskStorage({
			destination: './avatars'
			, filename: (req, image, cb) => {
				if (image.mimetype == "image/png" || image.mimetype == "image/jpg" || image.mimetype == "image/jpeg")
					cb(null, image.originalname)  //  callback is a function passed as an argument to another function
				else
				{
					console.log('Cannot upload file / bad file');
					return ;
				}
			}
		})
	}))
	async upload(@UploadedFile() image) {
		try {
			let filename = image.originalname;
			let parts = image.originalname.split(".");
			image.originalname = parts[0];
			let user = await this.prisma.user.findUnique({ where: { username: image.originalname } });
		} catch (e) {
			console.log(e);
			throw new UnauthorizedException('Cannot upload file');
		}
	}



	@Get('/all_users')  // should return public user data, not the restricted vars
	@UseGuards(AuthGuard('jwt'))  // 'jwt' is internally linked to the strategy  // uncomment
	async get_all_users()  // req is inside the access token, guards have to be up so we can access it
	{
		try {
			let all_user = await this.prisma.user.findMany({});
			if (!all_user) {
				console.log("no users")
				return;
			}
			let i = 0;
			while (all_user[i]) {
				// add sensitive data - variables that other users shoudnt see and mod them
				all_user[i].two_factor = true;
				all_user[i].ladder_lvl = 0;
				i++;
			}
			return all_user;
		} catch (e) {
			console.log(e);
			throw new UnauthorizedException('Cannot get all users');
		}
	}

	@Get('/public_profile')
	@UseGuards(AuthGuard('jwt'))
	async get_one_users(@Query() query: ProfileDTO) {
		try {
			await validatorDto(ProfileDTO, query, 'Cannot update user');
		} catch (errors) {
			console.log(errors);
			throw new UnauthorizedException('validator error on get public_profile');
		}
		try {
			let public_user = await this.prisma.user.findUnique({ where: { username: query.player } });
			if (!public_user) {
				console.log("user not found")
				return;
			}
			public_user.two_factor = true;  // hide public user sensitive data
			public_user.ladder_lvl = 0;
			return public_user;
		} catch (e) {
			console.log(e);
			throw new UnauthorizedException('Cannot get all users');
		}
	}

	@Get(':imgpath')
	async seeUploadedFile(@Param('imgpath') image: string, @Res() res) {
		if (image.length > 120)
			throw new UnauthorizedException('validator error on imgpath');
		try { await res.sendFile(image, { root: './avatars' }); }
		catch { "cant send file" }
	}
}
