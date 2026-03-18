import { Router } from "express";
import { sanitizeCategoryInput, findAll, findOne, add, update, remove } from "./category.controler.js";
import { authMiddleware, adminOnly } from "../shared/auth.middleware.js";

export const categoryRouter = Router()

categoryRouter.get('/', findAll)
categoryRouter.get('/:id', findOne)
categoryRouter.post('/', authMiddleware, adminOnly, sanitizeCategoryInput, add)
categoryRouter.put('/:id', authMiddleware, adminOnly, sanitizeCategoryInput, update)
categoryRouter.delete('/:id', authMiddleware, adminOnly, remove)
