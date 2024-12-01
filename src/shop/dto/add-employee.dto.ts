import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";

export class AddEmployeeDto {
    @IsNumber()
    @IsNotEmpty()
    user_id: number;
}