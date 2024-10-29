import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

enum DateFormat {
    DD_MM_YYYY = 'DD/MM/YYYY',
    MM_DD_YYYY = 'MM/DD/YYYY',
    YYYY_MM_DD = 'YYYY/MM/DD',
}

enum Language {
    EN = "en",
    VI = "vi",
}

enum SourceOrder {
    FACEBOOK = "facebook",
    TIKTOK = "tiktok",
}

export class UpdateShopSettingDto {
    @IsEnum(DateFormat)
    date_format?: DateFormat;

    @IsString()
    location?: string;

    @IsEnum(Language)
    language?: Language;

    @IsBoolean()
    auto_product_code?: boolean;

    @IsEnum(SourceOrder)
    source_order?: SourceOrder

    @IsString()
    time_zone?: string;
}