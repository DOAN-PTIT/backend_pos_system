import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SocialService } from './social.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('/facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {
    return this.socialService.loginFacebook();
  }

  @Get('/facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(@Req() req: Request): Promise<any> {
    return this.socialService.facebookLoginRedirect(req);
  }
}
