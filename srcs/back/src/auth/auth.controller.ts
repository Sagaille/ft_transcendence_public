import { BadRequestException, Body, ConsoleLogger, Controller, Get, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from 'src/user/user.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two_factor/two_factor.service';
import * as jwtoken from 'jsonwebtoken';
import { paginationQueryDTO } from './dto/auth.dto';


@Controller('auth')
export class AuthController {

	constructor(
		private authService: AuthService,
		private readonly configService: ConfigService,
		private userService: UserService,
		private two_factorService: TwoFactorService,
		)
	{}

	@Get('/oauth_page')
	getOauthPage()
	{
		//console.log("redirect_link = ")
		//console.log(this.configService.get('API_LINK'))
		return {
			page: this.configService.get('API_LINK')
		};
	}

	@Post('/access_token')
  	async authenticate(@Body() paginationQuery: paginationQueryDTO) {
    let code = paginationQuery;
	let codeString = code.code;
    let userExist;

		//delete
		/*console.log("fakecode")*/
		/*console.log(code);
		console.log(paginationQuery);*/
		/*let newUser: CreateUserDto;  // delete
		if (codeString == "player1")
			newUser = { username: "player1", avatar: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg", email: "davidslaurent@hotmail.com"};	  // delete
		if (codeString == "player2")
			newUser = { username: "player2", avatar: "https://upload.wikimedia.org/wikipedia/commons/c/c3/James_E._Webb%2C_official_NASA_photo%2C_1966.jpg", email: "ererw@hotmail.com"};	  // delete
		if (codeString == "player3")
			newUser = { username: "player3", avatar: "https://upload.wikimedia.org/wikipedia/commons/1/15/Studio_portrait_photograph_of_Edwin_Powell_Hubble_%28cropped%29.JPG", email: "ere@hotmail.com"};	  // delete
		if (codeString == "player4")
			newUser = { username: "player4", avatar: "https://upload.wikimedia.org/wikipedia/commons/5/56/Wernher_von_Braun_1960.jpg", email: "davidslqqqaurent@hotmail.com"};*/	  // delete
		// till here
		//else if (codeString != "player4" && codeString != "player3" && codeString != "player2" && codeString != "player1")
			let newUser = await this.authService.getUserData(codeString);  // uncomment

		if (newUser === undefined)		//  no validation by 42 api
			throw new BadRequestException('Invalid User or token');

		// check if user already in db  || could be optimized directly by creating new user and handling the error with this :
		// https://youtu.be/GHTA143_b-s?t=4245
		userExist = await this.userService.findByUserName(newUser.username);
		if (userExist)
		{
			//console.log("user already exists");
		}
		if (!userExist)
		{
			console.log("new user");
			userExist = await this.userService.create(newUser);
			return await this.authService.signedJwtToken(newUser.username, newUser.avatar);
		}
		if (userExist && userExist.two_factor == true)
		{
				console.log("2fa requested at login");
				let JWT = await this.authService.signedJwtToken(newUser.username, newUser.avatar);
				//console.log("JWT[1]");
				//console.log(JWT.access_token);
				await this.two_factorService.sendEmail(userExist.email, JWT.access_token);
		}
		else
			return await this.authService.signedJwtToken(newUser.username, newUser.avatar);
	}

	@Post('/two_factor')
	@UseGuards(AuthGuard('jwt'))
  	async register(@Req() req) {
		

		try
		{
			const user = await this.userService.findByUserName(req.user.username);
			await this.userService.updateUser(user);
			if (!user)
			{
				console.log("user not found")
				return;
			}
			//console.log("2fa register request");
			const tokenArray: string[] = req.headers['authorization'].split(' ');
			//console.log(tokenArray[1]);
			await this.two_factorService.sendEmail(user.email, tokenArray[1]);
		} catch (e) {
			throw new UnauthorizedException('Cannot update user');
		}		
	}

	@Post('/verification')
  	async verification(@Req() req) {
		try {
			const { email, jwt } = req.query;
			/*console.log("email")
			console.log(email)
			console.log("jwt")
			console.log(jwt)*/
			const user = await this.userService.findbyEmail(email);
			const user2 = await this.userService.findbyEmail(email);
			/*console.log("user.username");
			console.log(user);
			console.log("jwtoken check");*/
			if (user.username == user2.username && user != null)
			{
				user.ladder_lvl = 1;
				this.userService.updateUser(user);
				console.log("email is verified");
				user.two_factor = true;
				await this.userService.updateUser(user);
                return { access_token: jwt }
            }
		} catch (err) {
            throw new BadRequestException('Invalid User or token');
        }
	}
}
