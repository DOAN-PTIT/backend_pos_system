import { IsEmail, IsNotEmpty, IsOptional, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    name: string;

    @IsOptional()
    phone_number?: string | null;

    @IsOptional()
    fb_id?: string | null;

    @IsOptional()
    access_token?: string | null;

    @IsOptional()
    role?: string | 'shop';
}