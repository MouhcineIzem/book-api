import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate, validateQuery } from '../middlewares/validate';
import {
    createBookSchema,
    updateBookSchema,
    bookQuerySchema,
} from '../schemas/book.schema';
import * as bookController from '../controllers/book.controller';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(bookQuerySchema), bookController.getBooks);
router.post('/', validate(createBookSchema), bookController.createBook);
router.get('/:id', bookController.getBookById);
router.put('/:id', validate(updateBookSchema), bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

export default router;