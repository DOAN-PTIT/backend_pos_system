import { IsNumber, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Transform } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description: string;
    
    @IsString()
    @IsOptional()
    note: string;

    @IsString()
    @IsNotEmpty()
    product_code: string;

    @IsNumber()
    @IsOptional()
    categories_id: number
}