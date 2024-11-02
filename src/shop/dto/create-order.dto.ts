import { IsNumber, IsNotEmpty, IsOptional, IsString, ValidateNested, IsDateString, IsArray } from "class-validator";
import { Transform, Type } from 'class-transformer';
import { AddCustomerDto } from "./add-customer.dto";

class ProductOrderDto {
    @IsNumber()
    product_id: number;
  
    @IsNumber()
    quantity: number;
  }

export class CreateOrderDto {
    @IsString()
    @IsOptional()
    note?: string;                  // ghi chú

    @IsNotEmpty()
    @Type(() => AddCustomerDto)
    add_customer: AddCustomerDto    // tạo khách hàng mới (option)

    @IsString()
    @IsNotEmpty()
    delivery_address: string;       // địa chỉ nhận hàng

    @IsString()
    @IsNotEmpty()
    delivery_company: string;       // đơn vị giao hàng

    @IsNumber()
    @IsNotEmpty()
    delivery_cost: number;          // chi phí giao hàng

    @IsNumber()
    @IsNotEmpty()
    delivery_cost_shop: number;     // tiền giao hàng do shop quyết định

    @IsNumber()
    @IsNotEmpty()
    discount_percent: number;       // phần trăm giảm giá

    @IsDateString()
    @IsOptional()
    // @Type(() => Date)
    estimated_delivery: string;     // ngày giao hàng dự kiến

    @IsString()
    @IsNotEmpty()
    tracking_number: string;        // mã vận đơn

    @IsNumber()
    @IsNotEmpty()
    paid: number;                   // đã thanh toán

    @IsNumber()
    @IsNotEmpty()
    total_cost: number;             // tổng phải thanh toán

    @IsString()
    @IsNotEmpty()
    recipient_name: string;         // người nhận

    @IsString()
    @IsNotEmpty()
    recipient_phone_number: string; // số điện thoại người nhận

    @IsDateString()
    createdAt: string;               // ngày tạo

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductOrderDto)
    @IsNotEmpty()
    products_order: ProductOrderDto[]            // danh sách sản phẩm

    @IsNumber()
    @IsNotEmpty()
    shopuser_id: number             // id nhân viên 
}