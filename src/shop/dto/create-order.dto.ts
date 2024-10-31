import { IsNumber, IsNotEmpty, IsOptional, IsString, MinLength, IsDateString } from "class-validator";
import { Transform } from 'class-transformer';
import { AddCustomerDto } from "./add-customer.dto";

export class CreateOrderDto {
    @IsString()
    @IsOptional()
    note?: string;

    @IsNotEmpty()
    add_customer: AddCustomerDto

    @IsDateString()
    createAt: string;

    @IsNumber()
    @IsNotEmpty()
    product_id: number[]
}