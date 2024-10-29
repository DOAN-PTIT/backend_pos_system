import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateShopDto {
    @IsString()
    @IsOptional()
    name: string;
}