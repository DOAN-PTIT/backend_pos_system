import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateShopDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}