import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/user.dto';
import { ConfigService } from '@nestjs/config';
import axios from "axios";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwt: JwtService,
  ) { }

  async getAccessToken(code: string): Promise<string> {
    const payload = {
      grant_type: "authorization_code",
      client_id: this.configService.get<string>('APP_UID'),
      client_secret: this.configService.get<string>('APP_SECRET'),
      redirect_uri: this.configService.get<string>('APP_REDIRECT_URI'),
      code,
    };
    let ret: string;
    /*console.log("here");*/
    await axios({
      method: "post",
      url: "https://api.intra.42.fr/oauth/token",
      data: JSON.stringify(payload),
      headers: {
        "content-type": "application/json",
      },
    })
      .then(function (res) {
        ret = res.data.access_token;
        /*console.log("ret=");
        console.log(ret);*/
      })
      .catch((err) => { console.log(err) });
    return ret;
  }

  async getUserData(code: string): Promise<CreateUserDto> {
    let access_token: string;
    let userData: CreateUserDto;
    try {
      access_token = await this.getAccessToken(code);
      //console.log("getaccess");
      await axios({
        method: "GET",
        url: "https://api.intra.42.fr/v2/me",
        headers: {
          authorization: `Bearer ${access_token}`,
          "content-type": "application/json",
        },
      })
        .then(function (res) {
          const { login: username, image_url: avatar, email: email } = res.data;
          userData = { username, avatar, email };
        })
        .catch((err) => { console.log(err) });
    } catch (err: any) {
    }
	//troll
	userData.avatar = "https://cdn.intra.42.fr/users/54f7876973b880b16a2a85e879844299/ldavids.jpg";
    return userData;
  }

  async signedJwtToken(username: string, avatar: string) /*: Promise< { access_token: string } >*/  //  promise of object token (convention)
  {
    const secret = this.configService.get('JWT_SECRET');
    const payload = {
      sub: username, avatar
    }
    const token = await this.jwt.signAsync(payload,
      {
        expiresIn: '150m',
        secret: secret
      })  //  time the user can use the backend before needing to sign in again
    return { access_token: token }
  }

  async verifyJwt(token: string): Promise<any> {
    return this.jwt.verifyAsync(token);
  }
}