import { z } from 'zod';

export const createBookSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    author: z.string().min(1, 'Author is required').max(100),
    year: z
        .number()
        .int()
        .min(1000, 'Year must be valid')
        .max(new Date().getFullYear(), 'Year cannot be in the future'),
    genre: z.string().max(50).optional(),
    description: z.string().max(2000).optional(),
});


export const updateBookSchema = createBookSchema.partial();


export const bookQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    author: z.string().optional(),
    genre: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['title', 'author', 'year', 'createdAt']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
});


export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type BookQuery = z.infer<typeof bookQuerySchema>;