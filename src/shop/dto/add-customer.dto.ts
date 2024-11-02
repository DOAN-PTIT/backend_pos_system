import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, IsDateString } from "class-validator";
import { Transform } from 'class-transformer';

enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
}

export class AddCustomerDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsNotEmpty()
    phone_number: string;

    @IsDateString()
    @IsOptional()
    date_of_birth?: string;

    @IsDateString()
    @IsOptional()
    @Transform(({ value }) => value ?? null)
    last_purchase?: string;
}