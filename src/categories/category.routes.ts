import { Router } from "express";
import { sanitizeCategoryInput, findAll, findOne, add, update,remove } from "./category.controler.js"
import { authenticateToken } from "../users/verifyToken.js";
import { authorizeRole } from "../users/authzoritation.js";


export const categoryRouter = Router()

categoryRouter.get('/', findAll)
categoryRouter.get('/:id', findOne)
categoryRouter.post('/', authenticateToken, authorizeRole('Empleado'), sanitizeCategoryInput, add)
categoryRouter.put('/:id', authenticateToken, authorizeRole('Empleado'), sanitizeCategoryInput, update)
//categoryRouter.patch('/:id', authenticateToken, authorizeRole('Empleado'), sanitizeCategoryInput, update)
categoryRouter.delete('/:id', authenticateToken, authorizeRole('Empleado'), remove)
