import { IsBoolean, IsEmail, IsNumber, IsString, Length } from "class-validator";
import { UserI } from "./user.interface";

export class CreateUserDto
{
  @IsString()
  @Length(1, 30)
  username: string;

  @IsEmail()
  @Length(1, 150)
  email: string;

  @IsString()
  @Length(1, 150)
  avatar: string;
}

export class PayloadDTO
{
  @IsString()
  @Length(1, 26)
  sub: string;

  @IsString()
  @Length(1, 150)
  avatar: string;
}

export class UserDTO
{
    @IsNumber()
    id: number;

    @IsString()
    @Length(1, 26)
    username: string;

    @IsString()
    @Length(1, 150)
    avatar: string;

    @IsString()
    @Length(1, 26)
    ingame_name: string;

    @IsNumber()
    wins: number;
    
    @IsNumber()
    losses: number;
    
    @IsNumber()
    ladder_lvl: number;
    
    @IsString({each: true})
    match_history: Array<string>; 

    @IsBoolean()
    two_factor: boolean;
    
    @IsString({each: true})
    friends: Array<string>;

    @Length(1, 30)
    @IsString()
    status: string	

    @IsEmail()
    email: string
    
    blockingUsers: UserI[]
    blockedByUsers: UserI[]
}

export class ReqDTO
{
  user: UserDTO;
}

export class ProfileDTO
{
  @Length(1, 26)
  @IsString()
  player: string;
}