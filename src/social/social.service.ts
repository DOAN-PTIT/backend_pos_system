import { HttpStatus, Injectable, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/database/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SocialService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async loginFacebook(): Promise<any> {
    return HttpStatus.OK;
  }

  async facebookLoginRedirect(
    @Req() req: Request,
    @Res() response: Response,
  ): Promise<any> {
    const res = {
      statusCode: HttpStatus.OK,
      data: req.user,
    };

    const foundUser = await this.prisma.user.findUnique({
      where: { email: res.data.email },
    });
    let tokenPair = {
      accessToken: '',
      refreshToken: '',
    };
    const access_token = req.user.accessToken;

    if (!foundUser) {
      const newUserWithFbLogin = {
        email: req.user.email,
        password: '',
        name: `${req.user.firstName} ${req.user.lastName}`,
        phone_number: null,
        role: 'user',
        fb_id: req.user.fb_id,
        access_token,
        createdAt: new Date(),
        updatedAt: null,
        date_of_birth: null,
        id: parseInt(req.user.fb_id, req.user.fb_id.length),
      };

      const newUserFb = await this.usersService.create(newUserWithFbLogin);
      
      const payloadGenTokenPair = {
        id: newUserFb.id,
        email: newUserFb.email,
        role: newUserFb.role,
      }
      tokenPair = await this.authService.genTokensPair(payloadGenTokenPair);
    } else {
      const payloadGenTokenPair = {
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
      }

      tokenPair = await this.authService.genTokensPair(payloadGenTokenPair);
      await this.prisma.user.update({
        where: {
          id: foundUser.id,
        },
        data: {
          access_token: req.user.accessToken,
        },
      });
    }
    response.redirect(
      `http://localhost:3000/shop/overview?access_token=${tokenPair.accessToken}`,
    );
  }
}
