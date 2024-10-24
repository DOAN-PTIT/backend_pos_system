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
            const payload = await this.verifyToken(accessToken)
            request['user'] = {
                id: payload.id,
                email: payload.email,
                roles: [payload.role]
            };
            // console.log(request.user);
            return true
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Access token expired');
            }
            throw new UnauthorizedException('Invalid token');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    private async verifyToken(token: string): Promise<any> {
        return await this.jwtService.verifyAsync(token, {
            secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
        });
    }


}