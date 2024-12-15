import { IsNumber, IsNotEmpty, IsOptional, IsString, ValidateNested, IsDateString, IsArray, IsBoolean } from "class-validator";
import { Transform, Type } from 'class-transformer';
import { AddCustomerDto } from "./add-customer.dto";

class ProductOrderDto {
    @IsNumber()
    product_id: number;
  
    @IsNumber()
    quantity: number;

    @IsNumber()
    variation_id: number;
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
    @IsOptional()
    delivery_company: string = "JNT";       // đơn vị giao hàng

    @IsNumber()
    @IsOptional()
    delivery_cost: number = 0;          // chi phí giao hàng

    @IsNumber()
    @IsOptional()
    delivery_cost_shop: number = 0;     // tiền giao hàng do shop quyết định

    @IsDateString()
    @IsOptional()
    // @Type(() => Date)
    estimated_delivery: string;     // ngày giao hàng dự kiến

    @IsString()
    @IsOptional()
    tracking_number: string = "";        // mã vận đơn

    @IsNumber()
    @IsOptional()
    paid: number = 0;                   // đã thanh toán

    @IsNumber()
    @IsNotEmpty()
    total_cost: number;             // tổng phải thanh toán

    @IsNumber()
    @IsOptional()
    surcharge: number = 0;              // phụ thu

    @IsString()
    @IsNotEmpty()
    recipient_name: string;         // người nhận

    @IsString()
    @IsNotEmpty()
    recipient_phone_number: string; // số điện thoại người nhận

	@IsBoolean()
    @IsNotEmpty()
    at_counter: boolean; // số điện thoại người nhận

    @IsDateString()
    createdAt: string;               // ngày tạo

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductOrderDto)
    @IsNotEmpty()
    products_order: ProductOrderDto[] // danh sách sản phẩm

    @IsNumber()
    @IsNotEmpty()
    shopuser_id: number             // id nhân viên 

    @IsOptional()
    promotion: any

    @IsNumber()
    total_discount: number = 0
}