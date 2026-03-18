import { Router } from "express";
import { sanitizeGenderInput, findAll, findOne, add, update, remove } from "./gender.controller.js";
import { authMiddleware, adminOnly } from "../shared/auth.middleware.js";

export const genderRouter = Router()

genderRouter.get('/', findAll)
genderRouter.get('/:id', findOne)
genderRouter.post('/', authMiddleware, adminOnly, sanitizeGenderInput, add)
genderRouter.put('/:id', authMiddleware, adminOnly, sanitizeGenderInput, update)
genderRouter.delete('/:id', authMiddleware, adminOnly, remove)