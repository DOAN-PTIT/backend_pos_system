import { IsNotEmpty, IsNumber, IsEnum, IsString, IsOptional } from "class-validator";
import { SortBy } from "src/utils/enum/sort-option.enum";
import { Transform } from 'class-transformer';

export class GetCustomersDto {
    @IsNumber()
    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    page: number;

    @IsEnum(SortBy)
    sortBy: SortBy

    @IsOptional()
    search: string = "";
}