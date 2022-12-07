import { IsNegative, isNotEmpty, IsNotEmpty, isNotEmptyObject, IsNumber, IsString } from "class-validator";

export class paginationDto {
    @IsNumber()
    page: number;

    @IsNumber()
    limit: number;
}