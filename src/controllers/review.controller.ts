import { Response } from "express";
import { AuthRequest } from "../types";
import * as reviewService from '../services/review.service';



const handleError = (err: unknown, res: Response) => {
    if (err instanceof Error) {
        if (err.message === 'BOOK_NOT_FOUND')
            return res.status(404).json({ error: 'Book not found' });
        if (err.message === 'REVIEW_NOT_FOUND')
            return res.status(404).json({ error: 'Review not found' });
        if (err.message === 'ALREADY_REVIEWED')
            return res.status(409).json({ error: 'You already reviewed this book' });
    }
    return res.status(500).json({ error: 'Internal server error' });
};

export const getReviews = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.bookId;
        if (Array.isArray(id)) {
            return res.status(400).json({ message: 'Invalid book id' });
        }
        const result = await reviewService.getReviews(id);
        res.json(result);
    } catch (err) {
        handleError(err, res);
    }
};

export const createReview = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.bookId;
        if (Array.isArray(id)) {
            return res.status(400).json({ message: 'Invalid book id' });
        }
        const review = await reviewService.createReview(
            id,
            req.body,
            req.user!.userId
        );
        res.status(201).json(review);
    } catch (err) {
        handleError(err, res);
    }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id;
        if (Array.isArray(id)) {
            return res.status(400).json({ message: 'Invalid book id' });
        }
        const review = await reviewService.updateReview(
            id,
            req.body,
            req.user!.userId
        );
        res.json(review);
    } catch (err) {
        handleError(err, res);
    }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id;
        if (Array.isArray(id)) {
            return res.status(400).json({ message: 'Invalid book id' });
        }
        await reviewService.deleteReview(id, req.user!.userId);
        res.status(204).send();
    } catch (err) {
        handleError(err, res);
    }
};