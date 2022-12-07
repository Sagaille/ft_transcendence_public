import { IsString, Length } from "class-validator";

export class paginationQueryDTO
{
  @IsString()
  @Length(1, 150)
  code: string;
}


export class UserNameDTO
{
  @IsString()
  @Length(1, 50)
  code: string;
}
