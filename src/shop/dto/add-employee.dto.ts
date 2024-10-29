import { IsEmail, IsNotEmpty } from "class-validator";

export class AddEmployeeDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}