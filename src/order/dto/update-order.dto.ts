import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export enum OrderStatus {
    PENDING = 1,    // đang xử lý
    APPROVED = 2,   // chấp nhận
    SHIPPED = 3,    // đang giao
    DELIVERED = 4,  // đã giao
    CANCELED = -1,  // hủy
}

export class UpdateOrderDto {
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;
}