import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
  
@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private authService: AuthService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const accessToken = this.extractTokenFromHeader(request);

        if (!accessToken) throw new UnauthorizedException();
        
        try {
            const payload = await this.jwtService.verifyAsync(accessToken, {
                secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
            });

            // Assigning the payload to the request object here
            // so that we can access it in our route handlers
            request['user'] = payload;
        } catch {
            try {
                await this.authService.genAccessTokenByRefreshToken(request)
            } catch (err) {
                throw new UnauthorizedException('Something in auth went wrongs, pls login again');
            }
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}