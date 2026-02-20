import { Response, NextFunction} from "express";
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthPaylaod } from "../types";


export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
)=> {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const token = authHeader?.split(' ')[1];

    try {
        const paylaod = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as AuthPaylaod

        req.user = paylaod;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token expired or invalid' });
    }
};