import { User } from "@prisma/client";

export class LoginResponseDto {
    user: User;

    accessToken: string;

    refreshToken: string;
}