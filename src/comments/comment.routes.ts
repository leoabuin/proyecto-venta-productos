import { Router } from 'express';
import { sanitizeCommentInput, findAll, findCommentsByProduct, add, remove } from './comment.controler.js';
import { authMiddleware, adminOnly } from '../shared/auth.middleware.js';

export const commentRouter = Router();

commentRouter.get('/', findAll);
commentRouter.get('/:idProduct', findCommentsByProduct);
commentRouter.post('/', authMiddleware, sanitizeCommentInput, add);
commentRouter.delete('/:id', authMiddleware, adminOnly, remove); // Admin only for now to moderate
