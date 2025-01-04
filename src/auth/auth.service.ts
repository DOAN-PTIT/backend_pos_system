import { ShopRepository } from 'src/shop/repositories/shop.repository';
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
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private usersRepository: UserRepository,
        private jwtService: JwtService,
        private configService: ConfigService,
        private shopRepository: ShopRepository,
        private prismaService: PrismaService
    ) {}

    async genTokensPair (user: any) {
        const payload = { email: user.email, id: user.id, role: user.role };

        const accessToken = await this.jwtService.signAsync(
            { ...payload },
            {
                secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                expiresIn: '1d',
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

    async genAccessTokenByRefreshToken (refreshToken: string): Promise<{accessToken: string}> {
        // const refreshToken = req.cookies['refresh_token'];

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found, pls login again');
        }

        let payload: any;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Login session has expired. Please login again');
            }
            throw new UnauthorizedException('Invalid refresh token. Please login again.');
        }

        const userExists = await this.usersRepository.findUserById(payload.id);

        if (!userExists) {
            throw new BadRequestException('User no longer exists');
        }

        const accessToken = await this.jwtService.signAsync(
            { 
                email: userExists.email, 
                id: userExists.id,
                role: userExists.role
            }, {
                secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                expiresIn: '1d',
            },
        );

        return { accessToken }; 
    }

    async emailRegister (registerDto: AuthEmailRegisterDto): Promise<void> {
        const user = await this.usersService.create({
            ...registerDto,
            role: "user"
        })
    }
    
    async emailLogin (loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
        const foundUser = await this.usersRepository.findUserByEmail(loginDto.email)
        if (!foundUser) throw new NotFoundException('Email not registered')
            
        const isValidPassword = await bcrypt.compare(loginDto.password, foundUser.password)
        if (!isValidPassword) throw new UnauthorizedException('Invalid credentials')

        const tokenPair = await this.genTokensPair(foundUser) //???

        // Set refresh_token in HTTP-only cookie
        // res.cookie('refresh_token', tokenPair.refreshToken, {
        //     httpOnly: true,
        //     sameSite: 'strict',
        //     secure: false,
        //     maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days,
        // });

        return {
            user: {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                phone_number: foundUser.phone_number,
                role: foundUser.role
            },
            accessToken: tokenPair.accessToken,
            refreshToken: tokenPair.refreshToken,
        }
    }

    async logout (@Res({ passthrough: true }) res: Response): Promise<any> {
        try {
            // res.clearCookie('refresh_token', {
            //     httpOnly: true,
            //     // secure: process.env.NODE_ENV === 'production',
            //     sameSite: 'strict',
            //     secure: false,
            //     path: '/',
            // });

            return { message: 'Logout successfull'}
        } catch (err) {
            console.error(err);
            throw new BadRequestException('Logout failed');
        }
    }

    async systemUser(fb_shop_id: string): Promise<any> {
        const findShop = await this.prismaService.shop.findFirst({
            where: {
                fb_shop_id: fb_shop_id
            }
        })
        const email = `hethong${fb_shop_id}@shop.admin.com`
        const password = "12345678"
        const foundSystemUser = await this.prismaService.shopUser.findFirst({
            where: {
                shop_id: findShop.id,
                user: {
                    email
                }
            }
        })
        if (foundSystemUser) {
            const login = await this.emailLogin({
                email,
                password
            })

            return {
                shop_id: findShop.id,
                shopuser_id: foundSystemUser.id,
                ...login
            }
        } else {
            const systemUserAccount: AuthEmailRegisterDto = {
                email,
                password,
                name: "Hệ thống",
            }

            const sign_up = await this.emailRegister(systemUserAccount).then(() => {
                return this.emailLogin(systemUserAccount)
            })

            await this.prismaService.shopUser.create({
                data: {
                    user_id: sign_up.user.id,
                    shop_id: findShop.id
                }
            })
            return {
                shop_id: findShop.id,
                ...sign_up,
            }

        }
    }

}
