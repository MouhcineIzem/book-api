import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createReviewSchema, updateReviewSchema } from '../schemas/review.schema';
import { readLimiter, writeLimiter } from '../middlewares/rateLimiter';
import * as reviewController from '../controllers/review.controller';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', readLimiter, reviewController.getReviews);
router.post('/', writeLimiter, validate(createReviewSchema), reviewController.createReview);
router.put('/:id', writeLimiter, validate(updateReviewSchema), reviewController.updateReview);
router.delete('/:id', writeLimiter, reviewController.deleteReview);

export default router;