import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthEmailRegisterDto } from './dto/auth-email-register.dto';
import { UsersService } from 'src/users/users.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserRepository } from 'src/users/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import {
    Req, 
    Res,
    Injectable, 
    NotFoundException, 
    UnauthorizedException,
    BadRequestException, 
} from '@nestjs/common';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private usersRepository: UserRepository,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    private async genTokensPair (user: User) {
        const payload = { email: user.email, userId: user.id, userRole: user.role };

        const accessToken = await this.jwtService.signAsync(
            { ...payload },
            {
                secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                expiresIn: '30m',
            },
        );

        const refreshToken = await this.jwtService.signAsync(
            { ...payload }, 
            {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
                expiresIn: '3d',
            }
        );

        return { accessToken, refreshToken };
    }

    async genAccessTokenByRefreshToken (@Req() req: Request): Promise<string> {
        const refreshToken = req.cookies['refresh_token'];

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found, pls login again');
        }

        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            });
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token, pls login again');
        }

        const userExists = await this.usersRepository.findUserById(payload.userId);

        if (!userExists) {
            throw new BadRequestException('User no longer exists');
        }

        const accessToken = await this.jwtService.signAsync(
            { ...payload }, 
            {
                secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                expiresIn: '30m',
            },
        );

        return accessToken; 
    }

    async emailRegister (registerDto: AuthEmailRegisterDto): Promise<void> {
        const user = await this.usersService.create({
            ...registerDto,
            role: "shop"
        })
    }
    
    async emailLogin (loginDto: AuthEmailLoginDto, @Res() res: Response): Promise<LoginResponseDto> {
        const foundUser = await this.usersRepository.findUserByEmail(loginDto.email)
        if (!foundUser) throw new NotFoundException('Email not registered')
            
        const isValidPassword = await bcrypt.compare(loginDto.password, foundUser.password)
        if (!isValidPassword) throw new UnauthorizedException('Invalid credentials')

        const tokenPair = await this.genTokensPair(foundUser) //???

        // Set refresh_token in HTTP-only cookie
        res.cookie('refresh_token', tokenPair.refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        });

        return {
            user: foundUser,
            accessToken: tokenPair.accessToken,
            refreshToken: tokenPair.refreshToken,
        }
    }

}
