import { IsEmail, IsNotEmpty, IsOptional, IsEnum, IsDateString } from "class-validator";

enum Language {
    EN = "en",
    VI = "vi",
}

export class UpdateUserDto {
    @IsOptional()
    name?: string;

    @IsOptional()
    phone_number?: string;

    @IsEnum(Language)
    @IsOptional()
    language?: Language;

    @IsDateString()
    @IsOptional()
    date_of_birth?: string;
}