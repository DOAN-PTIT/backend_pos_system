import { IsNumber, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Transform } from 'class-transformer';

export class CreateVariationDto {
    @IsNumber()
    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    retail_price: number;

    @IsNumber()
    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    amount: number;
    
    @IsString()
    @IsOptional()
    barcode?: string;

    @IsNumber()
    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    price_at_counter: number;

    @IsString()
    @IsOptional()
    variation_code: string;

    @IsString()
    @IsOptional()
    image_url_fb: string;

    @IsOptional()
    last_imported_price?: any

    @IsOptional()
    @IsString()
    image?: string
}