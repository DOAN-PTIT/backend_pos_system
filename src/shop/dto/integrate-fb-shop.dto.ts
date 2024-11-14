import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class IntegrateFbShopDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    avatar: string;

    @IsString()
    @IsNotEmpty()
    fb_shop_id: string;
}