import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator";
import { UserI } from "src/user/user.interface";
import { RoomI } from "../room.interface";

export class messageDto {
    @IsString()
    @Length(1, 240)
    text: string;

    @IsNotEmpty()
    user: UserI;

    @IsNotEmpty()
    room: RoomI;
}