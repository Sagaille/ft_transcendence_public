import { IsIn, IsOptional, IsString, Length } from "class-validator";

export class CreateChatRoomDto {
    
    @IsString()
    @Length(1, 30)
    name:           string;

    @IsOptional()
    @IsString()
    @Length(0, 240)
    description?:   string;

    @IsString()
    @IsIn(['public', 'protected', 'private', 'directMessage'])
    type:           string;

    @IsOptional()
    @IsString()
    password?:      string;
}
