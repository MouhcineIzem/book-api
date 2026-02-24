import { prisma } from '../lib/prisma';
import { CreateBookInput, UpdateBookInput, BookQuery } from '../schemas/book.schema';

export const getBooks = async (query: BookQuery, userId: string) => {
    const { page, limit, author, genre, search, sortBy, order } = query;
    const skip = (page - 1) * limit;

    const where = {
        userId,
        ...(author && { author: { contains: author, mode: 'insensitive' as const } }),
        ...(genre && { genre: { contains: genre, mode: 'insensitive' as const } }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { author: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
            ],
        }),
    };

    const [books, total] = await prisma.$transaction([
        prisma.book.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: order },
            include: {
                _count: { select: { reviews: true } },
            },
        }),
        prisma.book.count({ where }),
    ]);

    return {
        data: books,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
        },
    };
};

export const getBookById = async (id: string, userId: string) => {
    const book = await prisma.book.findFirst({
        where: { id, userId },
        include: {
            reviews: {
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true } },
                },
            },
            _count: { select: { reviews: true } },
        },
    });

    if (!book) throw new Error('BOOK_NOT_FOUND');
    return book;
};

export const createBook = async (data: CreateBookInput, userId: string) => {
    return prisma.book.create({
        data: { ...data, userId },
        include: {
            _count: { select: { reviews: true } },
        },
    });
};

export const updateBook = async (
    id: string,
    data: UpdateBookInput,
    userId: string
) => {
    const book = await prisma.book.findFirst({ where: { id, userId } });
    if (!book) throw new Error('BOOK_NOT_FOUND');

    return prisma.book.update({
        where: { id },
        data,
        include: {
            _count: { select: { reviews: true } },
        },
    });
};

export const deleteBook = async (id: string, userId: string) => {
    const book = await prisma.book.findFirst({ where: { id, userId } });
    if (!book) throw new Error('BOOK_NOT_FOUND');

    await prisma.book.delete({ where: { id } });
};