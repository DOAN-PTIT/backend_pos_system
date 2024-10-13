import {
    Res,
    Req,
    Controller,
    Body,
    Post,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthEmailRegisterDto } from './dto/auth-email-register.dto'
import { LoginResponseDto } from './dto/login-response.dto';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {

    constructor(private readonly service: AuthService) {}

    @Post('email/register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: AuthEmailRegisterDto): Promise<void> {
        return this.service.emailRegister(registerDto)
    }

    @Post('email/login')
    @HttpCode(HttpStatus.OK)
    public login(@Body() loginDto: AuthEmailLoginDto, @Res({ passthrough: true }) res: Response): Promise<LoginResponseDto> {
        return this.service.emailLogin(loginDto, res)
    }
}
