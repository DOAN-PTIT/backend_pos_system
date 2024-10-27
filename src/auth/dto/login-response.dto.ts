import { User } from "@prisma/client";

export class LoginResponseDto {
    user: {
        id: number,
        name: string,
        email: string,
        phone_number: string,
        role: string,
        accessToken?: string,
        fb_id?: string
    };

    accessToken: string;

    refreshToken: string;
}