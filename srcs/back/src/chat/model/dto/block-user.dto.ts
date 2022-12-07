import { IsNumber } from "class-validator";

export class blockUserDto {
    @IsNumber()
    byUserId: number;

    @IsNumber()
    targetUserId: number;
}