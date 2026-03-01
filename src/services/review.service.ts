import { prisma } from '../lib/prisma';
import { CreateReviewInput, UpdateReviewInput } from "../schemas/review.schema";



export const getReviews = async (bookId: string) => {
    const book = await prisma.book.findUnique({ where: { id: bookId }});
    if (!book) throw new Error('BOOK_NOT_FOUND');


    const reviews = await prisma.review.findMany({
        where: { bookId },
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true }},
        },
    });

    const avgRating =
        reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : null;

    return {
        data: reviews,
        meta: {
            total: reviews.length,
            averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        },
    };
};

export const createReview = async (
    bookId: string,
    data: CreateReviewInput,
    userId: string
) => {
    const book = await prisma.book.findUnique({ where: { id: bookId }});
    if (!book) throw  new Error('BOOK_NOT_FOUND');

    const existing = await prisma.review.findFirst({
        where: { bookId, userId },
    });
    if (existing) throw new Error('ALREADY_REVIEWED');


    return prisma.review.create({
        data: { ...data, bookId, userId },
        include: {
            user: { select: { id: true, name: true }},
        },
    });
};


export const updateReview = async (
    id: string,
    data: UpdateReviewInput,
    userId: string
)=> {
    const review = await prisma.review.findFirst({ where: { id, userId }});
    if (!review) throw new Error('REVIEW NOT FOUND');


    return prisma.review.update({
        where: { id },
        data,
        include: {
            user: { select: { id: true, name: true }},
        },
    });
};


export const deleteReview = async (id: string, userId: string) => {
    const review = await prisma.review.findFirst({ where: { id, userId }});
    if (!review) throw new Error('REVIEW_NOT_FOUND');

    await prisma.review.delete({ where: { id }});
}