import {
    Res,
    Req,
    Controller,
    Body,
    Post,
    HttpCode,
    HttpStatus,
    UseGuards,
    Param
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthEmailRegisterDto } from './dto/auth-email-register.dto'
import { LoginResponseDto } from './dto/login-response.dto';
import { Response, Request } from 'express';
import { AuthGuard } from './guards/auth.guard';

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
    public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
        return this.service.emailLogin(loginDto)
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() data: any): Promise<{ accessToken: string }> {
        const { refreshToken } = data;
        return await this.service.genAccessTokenByRefreshToken(refreshToken)
    }

    // @UseGuards(AuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout (@Res({passthrough: true}) res: Response) {
        return await this.service.logout(res)
    }

    @Post('system-user/:fb_shop_id')
    async createSystemUser(@Param('fb_shop_id') fb_shop_id: string): Promise<void> {
        return this.service.systemUser(fb_shop_id)
    }
}
