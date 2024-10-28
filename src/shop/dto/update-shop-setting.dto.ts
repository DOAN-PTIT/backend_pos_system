import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

enum DateFormat {
    DD_MM_YYYY = 'DD/MM/YYYY',
    MM_DD_YYYY = 'MM/DD/YYYY',
    YYYY_MM_DD = 'YYYY/MM/DD',
}

enum Language {
    EN = "en",
    VI = "vi",
}

export class UpdateShopSettingDto {
    @IsEnum(DateFormat)
    date_format?: string;

    @IsString()
    location: string;

    @IsEnum(Language)
    language: Language;
}