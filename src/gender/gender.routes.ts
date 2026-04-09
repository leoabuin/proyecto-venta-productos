import { Router } from "express";
import { sanitizeGenderInput, findAll, findOne, add, update, remove } from "./gender.controller.js";
import { authMiddleware, staffOnly } from "../shared/auth.middleware.js";

export const genderRouter = Router()

genderRouter.get('/', findAll)
genderRouter.get('/:id', findOne)
genderRouter.post('/', authMiddleware, staffOnly, sanitizeGenderInput, add)
genderRouter.put('/:id', authMiddleware, staffOnly, sanitizeGenderInput, update)
genderRouter.delete('/:id', authMiddleware, staffOnly, remove)