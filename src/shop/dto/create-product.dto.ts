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
    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    retail_price: number;

    @IsNumber()
    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    price_at_counter: number;

    @IsNumber()
    @IsOptional()
    categories_id: number
}