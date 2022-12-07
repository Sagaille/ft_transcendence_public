import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExtractJwt, Strategy } from "passport-jwt";  // watch the imports dependencies for 'strategy'
import { UserService } from "src/user/user.service";
import { PayloadDTO } from "src/user/user.dto";
import { validate } from "class-validator";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy)
{
	constructor(configService: ConfigService, private prisma: PrismaService, private userService: UserService)
	{
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get('JWT_SECRET'),
		});
	}

	// required by the guards and returns at the @Req, returns the user after validation of the jwt
	// links the user in db with the jwt signed user
	async validate(payload: PayloadDTO)
	{
		validate(payload).then(errors => {
			if (errors.length > 0)
			{  console.log('validation failed');
			  return null;
			}
		  });

		/*console.log("payload = ")
		console.log(payload)*/
		try {
		const user = await this.prisma.user.findUnique( { where: { username: payload.sub } } );
		if (user.two_factor && user.ladder_lvl == 0)
			return;
		if (!user)
		{
			console.log("user not found")
			return ;
		}
		return user;
		}
		catch {
			console.log("user not found on validation")
			return ;
		}
	}
}
