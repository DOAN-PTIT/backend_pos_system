import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

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
}