import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { AuthPaylaod } from '../types';

const SALT_ROUNDS = 12;

const generateToken = (payload: AuthPaylaod): string => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: '7d',
    });
};

export const register = async (data: RegisterInput) => {
    const existing = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existing) {
        throw new Error('EMAIL_TAKEN');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    const token = generateToken({ userId: user.id, email: user.email });

    return { user, token };
};

export const login = async (data: LoginInput) => {
    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (!user) {
        throw new Error('INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
        throw new Error('INVALID_CREDENTIALS');
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        },
        token,
    };
};