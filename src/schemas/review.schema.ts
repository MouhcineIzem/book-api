import { z } from 'zod';

export const createReviewSchema = z.object({
    content: z.string().min(10, 'Review must be at least 10 characters').max(2000),
    rating: z
        .number()
        .int()
        .min(1, 'Rating must be between 1 and 5')
        .max(5, 'Rating must be between 1 and 5'),
});



export const updateReviewSchema = createReviewSchema.partial();


export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
