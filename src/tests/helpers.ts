import request from 'supertest';
import app from '../app';

export const createUserAndLogin = async (
    email = 'test@example.com',
    password = 'Password1'
) => {
    await request(app)
        .post('/auth/register')
        .send({ name: 'Test User', email, password });

    const res = await request(app)
        .post('/auth/login')
        .send({ email, password });

    return res.body.token as string;
};

export const authHeader = (token: string) => ({
    Authorization: `Bearer ${token}`,
});