import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

enum OrderStatus {
    PENDING = 1,
    APPROVED = 2,
    SHIPPED = 3,
    DELIVERED = 4,
    CANCELED = -1,
}

export class UpdateOrderDto {
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;
}