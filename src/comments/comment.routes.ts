import { Router } from 'express';
import { sanitizeCommentInput, findAll, findCommentsByProduct, add, remove } from './comment.controler.js';

export const commentRouter = Router();

commentRouter.get('/', findAll);
commentRouter.get('/:idProduct', findCommentsByProduct);
commentRouter.post('/', sanitizeCommentInput, add);
commentRouter.delete('/:id', remove);



