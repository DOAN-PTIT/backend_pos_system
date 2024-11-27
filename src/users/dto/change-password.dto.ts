import { IsEmail, IsNotEmpty, IsOptional, IsEnum } from "class-validator";

export class ChangePasswordDto {
    @IsNotEmpty()
    old_password: string;

    @IsNotEmpty()
    new_password: string;
}