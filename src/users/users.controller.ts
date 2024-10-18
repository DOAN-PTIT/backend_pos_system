import { 
    Req,
    Res,
    Controller, 
    Get, 
    UseGuards
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/roles/role.guard';
import { Roles } from 'src/auth/roles/role.decorator';
import { Role } from 'src/auth/roles/role.enum';

@Controller('user')
export class UsersController {

    constructor(
        private readonly userService: UsersService
    ) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.User)
    @Get('profile')
    async getProfile (@Req() req: Request): Promise<any> {
        const userId = req.user.id;
        return await this.userService.getProfileByUserId(userId);
    }

}
