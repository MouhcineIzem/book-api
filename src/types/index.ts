import { Request } from 'express';


export interface AuthPaylaod {
    userId: string;
    email: string;
}


export interface AuthRequest extends Request {
    user?: AuthPaylaod;
}