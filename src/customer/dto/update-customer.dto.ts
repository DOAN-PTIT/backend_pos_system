import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, IsDateString, IsNumber } from "class-validator";
import { Transform } from 'class-transformer';
import { Gender } from "src/shop/dto/add-customer.dto";

export class UpdateCustomerDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    phone_number?: string;

    @IsDateString()
    @IsOptional()
    date_of_birth?: string;

    @IsDateString()
    @IsOptional()
    @Transform(({ value }) => value ?? null)
    last_purchase?: string;

    @IsNumber()
    @IsOptional()
    number_of_referrals?: number;

    @IsString()
    @IsOptional()
    referral_code?: string;
}