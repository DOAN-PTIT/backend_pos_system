import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class AuthEmailRegisterDto {
    @IsEmail({}, { message: 'Email is invalid'})
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsNotEmpty({ message: 'Name is required'})
    name: string;
}