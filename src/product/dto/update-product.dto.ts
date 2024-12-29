import { IsNumber, IsNotEmpty, IsOptional, IsString, IsArray, IsEnum } from "class-validator";
import { Transform } from 'class-transformer';

export class UpdateVariationDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    retail_price?: number;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    amount?: number;
    
    @IsString()
    @IsOptional()
    barcode?: string;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    price_at_counter?: number;

    @IsString()
    @IsOptional()
    variation_code?: string;

    @IsString()
    @IsOptional()
    image_url_fb?: string;

    @IsOptional()
    last_imported_price?: any

    @IsOptional()
    @IsString()
    image?: string

    @IsString()
    @IsOptional()
    createdAt?: string;

    @IsString()
    @IsOptional()
    updatedAt?: string;
}

export class UpdateProductDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsNumber()
    @IsOptional()
    shop_id?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;
    
    @IsString()
    @IsOptional()
    note?: string;

    @IsString()
    @IsOptional()
    product_code?: string;

    @IsNumber()
    @IsOptional()
    categories_id?: number;

    @IsArray()
    @IsOptional()
    variations?: UpdateVariationDto[];

    @IsString()
    @IsOptional()
    createdAt?: string;

    @IsString()
    @IsOptional()
    updatedAt?: string;

    @IsArray()
    @IsOptional()
    delete_variation_ids?: number[]
}