import { IsDate, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";
import { RoomI } from "../room.interface";

export class chatRoomDto {
    @IsNumber()
    @IsNotEmpty()
    id:            number;

    @IsString()
    @Length(1, 30)
    name:           string;

    @IsOptional()
    @IsString()
    @Length(0, 240)
    description?:   string;

    @IsOptional()
    @IsString()
    @IsIn(['public', 'protected', 'private', 'directMessage'])
    type:           string;
}

export class joinChatRoomDto {
    @IsNotEmpty()
    room:   RoomI
    
    @IsNumber()
    userId: number;

    @IsString()
    passwordTyped?: string
}

export class leaveChatRoomDto {
    @IsNotEmpty()
    room:   RoomI;
    
    @IsNumber()
    userId: number;
}

export class updateChatRoomDto {
    @IsNotEmpty()
    room:   RoomI;
    
    @IsNumber()
    userId: number;
}

export class checkAdminRightDto {
    @IsNumber()
    roomId: number;
    @IsNumber()
    byUserId: number;
    @IsNumber()
    targetUserId: number;
}

export class muteUserDto {
    @IsNumber()
    roomId: number;
    @IsNumber()
    byUserId: number;
    @IsNumber()
    targetUserId: number;
    @IsDateString()
    endMuteAt: Date;
}

export class unmuteUserDto {
    @IsNumber()
    roomId: number;
    @IsNumber()
    byUserId: number;
    @IsNumber()
    targetUserId: number;
}