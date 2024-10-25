import { IsNotEmpty, IsNumber } from "class-validator";

export class GetProductsDto {
    @IsNumber()
    @IsNotEmpty()
    shopId: number;
}