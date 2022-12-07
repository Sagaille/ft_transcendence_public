import { isNotEmpty, IsNotEmpty, isNotEmptyObject, IsString } from "class-validator";

export class JoinedRoomDto {
    @IsString()
    @IsNotEmpty()
    socketId: string;
}