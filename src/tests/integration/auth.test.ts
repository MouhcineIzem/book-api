import request from 'supertest';
import app from '../../app'
import { prisma } from "../../lib/prisma";

beforeEach(async () => {
    await prisma.review.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
});


afterAll(async () => {
    await prisma.$disconnect();
});


describe('POST /auth/register', () => {
    const validUser = {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Password1',
    };


    it('should register a new user and return a token', async () => {
        const res = await request(app).post('/auth/register').send(validUser);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).not.toHaveProperty('password');
        expect(res.body.user.email).toBe(validUser.email);
    });

    it('should return 409 if email is already taken', async () => {
        await request(app).post('/auth/register').send(validUser);
        const res = await request(app).post('/auth/register').send(validUser);

        expect(res.status).toBe(409);
    });

    it('should return 400 if password is too weak', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ ...validUser, password: 'weak' });

        expect(res.status).toBe(400);
        expect(res.body.details).toHaveProperty('password');
    });
});

describe('POST /auth/login', () => {
    beforeEach(async () => {
        await request(app).post('/auth/register').send({
            name: 'Alice',
            email: 'alice@example.com',
            password: 'Password1',
        });
    });

    it('should login and return a token', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'alice@example.com', password: 'Password1' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should return 401 with wrong password', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'alice@example.com', password: 'WrongPass1' });

        expect(res.status).toBe(401);
    });
});