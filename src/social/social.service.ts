import { HttpStatus, Injectable, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/database/prisma.service'
import { PassThrough } from 'stream';

@Injectable()
export class SocialService {

  constructor (
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService
  ) {}

  async loginFacebook(): Promise<any> {
    return HttpStatus.OK;
  }

  async facebookLoginRedirect(@Req() req: Request): Promise<any> {
    const res = {
      statusCode: HttpStatus.OK,
      data: req.user
    };

    const foundUser = await this.prisma.user.findUnique({ 
      where: { email: res.data.email, }
    })

    if (!foundUser) {
      const newUserWithFbLogin = {
        email: req.user.email,
        password: '',
        name: `${req.user.firstName} ${req.user.lastName}`,
        phone_number: null,
        role: 'admin',
      }
  
      await this.usersService.create(newUserWithFbLogin)
    }

    return res;
  }
}
