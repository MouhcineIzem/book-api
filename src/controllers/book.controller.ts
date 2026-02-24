import { Response } from 'express';
import { AuthRequest } from '../types';
import * as bookService from '../services/book.service';

const handleNotFound = (err: unknown, res: Response) => {
    if (err instanceof Error && err.message === 'BOOK_NOT_FOUND') {
        return res.status(404).json({ error: 'Book not found' });
    }
    return res.status(500).json({ error: 'Internal server error' });
};

export const getBooks = async (req: AuthRequest, res: Response) => {
    try {
        const result = await bookService.getBooks(req.query as any, req.user!.userId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getBookById = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id;
        if (Array.isArray(id)) {
            return res.status(400).json({ message: 'Invalid book id' });
        }
        const book = await bookService.getBookById(id, req.user!.userId);
        res.json(book);
    } catch (err) {
        handleNotFound(err, res);
    }
};

export const createBook = async (req: AuthRequest, res: Response) => {
    try {
        const book = await bookService.createBook(req.body, req.user!.userId);
        res.status(201).json(book);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateBook = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id;
        if (Array.isArray(id)) {
            return res.status(400).json({ message: 'Invalid book id' });
        }
        const book = await bookService.updateBook(
            id,
            req.body,
            req.user!.userId
        );
        res.json(book);
    } catch (err) {
        handleNotFound(err, res);
    }
};

export const deleteBook = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id;
        if (Array.isArray(id)) {
            return res.status(400).json({ message: 'Invalid book id' });
        }
        await bookService.deleteBook(id, req.user!.userId);
        res.status(204).send();
    } catch (err) {
        handleNotFound(err, res);
    }
};