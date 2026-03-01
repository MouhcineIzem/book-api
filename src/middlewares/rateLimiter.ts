import rateLimit from 'express-rate-limit';

const createLimiter = (windowMs: number, max: number, message: string) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: message },
    });

// Routes d'auth : 10 tentatives par 15 minutes
export const authLimiter = createLimiter(
    15 * 60 * 1000,
    10,
    'Too many attempts, please try again in 15 minutes'
);

// Routes de lecture : 100 requêtes par 15 minutes
export const readLimiter = createLimiter(
    15 * 60 * 1000,
    100,
    'Too many requests, please try again later'
);

// Routes d'écriture : 30 requêtes par 15 minutes
export const writeLimiter = createLimiter(
    15 * 60 * 1000,
    30,
    'Too many write requests, please slow down'
);