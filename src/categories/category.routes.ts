import { Router } from "express";
import { sanitizeCategoryInput, findAll, findOne, add, update, remove } from "./category.controler.js";
import { authMiddleware, staffOnly } from "../shared/auth.middleware.js";

export const categoryRouter = Router()

categoryRouter.get('/', findAll)
categoryRouter.get('/:id', findOne)
categoryRouter.post('/', authMiddleware, staffOnly, sanitizeCategoryInput, add)
categoryRouter.put('/:id', authMiddleware, staffOnly, sanitizeCategoryInput, update)
categoryRouter.delete('/:id', authMiddleware, staffOnly, remove)
