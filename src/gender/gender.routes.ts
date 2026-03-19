import { Router } from "express";
import { sanitizeGenderInput, findAll, findOne, add, update,remove } from "./gender.controller.js";    
import { authenticateToken } from "../users/verifyToken.js";
import { authorizeRole } from "../users/authzoritation.js";

export const genderRouter = Router()

genderRouter.get('/', findAll)
genderRouter.get('/:id', findOne)
genderRouter.post('/', authenticateToken, authorizeRole('Empleado'), sanitizeGenderInput, add)
genderRouter.put('/:id', authenticateToken, authorizeRole('Empleado'), sanitizeGenderInput, update)
genderRouter.delete('/:id', authenticateToken, authorizeRole('Empleado'), remove)