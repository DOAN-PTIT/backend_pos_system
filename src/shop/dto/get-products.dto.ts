import { IsNotEmpty, IsNumber, IsEnum, IsString } from "class-validator";
import { SortBy } from "src/utils/enum/sort-option.enum";
import { Transform } from 'class-transformer';

export class GetProductsDto {
    @IsNumber()
    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    page: number;

    @IsEnum(SortBy)
    sortBy: SortBy

    @IsString()
    search: string = "";
}