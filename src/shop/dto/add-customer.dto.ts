import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, IsDateString } from "class-validator";

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
    last_purchase?: string;
}