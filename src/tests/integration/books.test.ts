import request from 'supertest';
import app from '../../app';
import { prisma } from '../../lib/prisma';
import { createUserAndLogin, authHeader } from '../helpers';

let token: string;

beforeEach(async () => {
    await prisma.review.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
    token = await createUserAndLogin();
});

afterAll(async () => {
    await prisma.$disconnect();
});

const validBook = {
    title: 'Clean Code',
    author: 'Robert Martin',
    year: 2008,
    genre: 'Programming',
};

describe('POST /books', () => {
    it('should create a book', async () => {
        const res = await request(app)
            .post('/books')
            .set(authHeader(token))
            .send(validBook);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe(validBook.title);
    });

    it('should return 401 without token', async () => {
        const res = await request(app).post('/books').send(validBook);
        expect(res.status).toBe(401);
    });

    it('should return 400 with invalid year', async () => {
        const res = await request(app)
            .post('/books')
            .set(authHeader(token))
            .send({ ...validBook, year: 9999 });

        expect(res.status).toBe(400);
    });
});

describe('GET /books', () => {
    beforeEach(async () => {
        await request(app).post('/books').set(authHeader(token)).send(validBook);
        await request(app)
            .post('/books')
            .set(authHeader(token))
            .send({ title: 'The Pragmatic Programmer', author: 'Dave Thomas', year: 1999, genre: 'Programming' });
    });

    it('should return paginated books', async () => {
        const res = await request(app)
            .get('/books')
            .set(authHeader(token));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.meta).toMatchObject({
            total: 2,
            page: 1,
            totalPages: 1,
        });
    });

    it('should filter by genre', async () => {
        const res = await request(app)
            .get('/books?genre=Programming')
            .set(authHeader(token));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
    });

    it('should search by title', async () => {
        const res = await request(app)
            .get('/books?search=clean')
            .set(authHeader(token));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].title).toBe('Clean Code');
    });

    it('should paginate correctly', async () => {
        const res = await request(app)
            .get('/books?page=1&limit=1')
            .set(authHeader(token));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.meta.hasNextPage).toBe(true);
    });
});

describe('GET /books/:id', () => {
    it('should return a book with its reviews', async () => {
        const created = await request(app)
            .post('/books')
            .set(authHeader(token))
            .send(validBook);

        const res = await request(app)
            .get(`/books/${created.body.id}`)
            .set(authHeader(token));

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('reviews');
    });

    it('should return 404 for unknown id', async () => {
        const res = await request(app)
            .get('/books/nonexistent-id')
            .set(authHeader(token));

        expect(res.status).toBe(404);
    });
});

describe('PUT /books/:id', () => {
    it('should update a book', async () => {
        const created = await request(app)
            .post('/books')
            .set(authHeader(token))
            .send(validBook);

        const res = await request(app)
            .put(`/books/${created.body.id}`)
            .set(authHeader(token))
            .send({ title: 'Clean Code (Updated)' });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Clean Code (Updated)');
    });
});

describe('DELETE /books/:id', () => {
    it('should delete a book and return 204', async () => {
        const created = await request(app)
            .post('/books')
            .set(authHeader(token))
            .send(validBook);

        const res = await request(app)
            .delete(`/books/${created.body.id}`)
            .set(authHeader(token));

        expect(res.status).toBe(204);
    });

    it('should not allow deleting another user book', async () => {
        const created = await request(app)
            .post('/books')
            .set(authHeader(token))
            .send(validBook);

        const otherToken = await createUserAndLogin('other@example.com');

        const res = await request(app)
            .delete(`/books/${created.body.id}`)
            .set(authHeader(otherToken));

        expect(res.status).toBe(404);
    });
});