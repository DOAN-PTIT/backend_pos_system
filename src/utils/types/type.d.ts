declare namespace Express {
    export interface Request {
        user?: {
            id: number,
            email: string,
            role: string,
            firstName: string,
            lastName: string
        };
    }
}