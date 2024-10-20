import { HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SocialService {
  async loginFacebook(): Promise<any> {
    return HttpStatus.OK;
  }

  async facebookLoginRedirect(req: Request): Promise<any> {
    const res = {
      statusCode: HttpStatus.OK,
      data: req.user,
    };
    console.log(res);
    return res;
  }
}
