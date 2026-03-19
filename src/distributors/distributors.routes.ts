
import { Router } from "express";
import { sanitizeDistributorInput, findAll, findOne, add, update,remove } from "./distributor.controler.js";
import { authenticateToken } from "../users/verifyToken.js";
import { authorizeRole } from "../users/authzoritation.js";


export const distributorRouter = Router()

distributorRouter.get('/', findAll)
distributorRouter.get('/:CUIL', findOne)
distributorRouter.post('/', authenticateToken, authorizeRole('Empleado'), sanitizeDistributorInput, add)
distributorRouter.put('/:CUIL', authenticateToken, authorizeRole('Empleado'), sanitizeDistributorInput, update)
distributorRouter.patch('/:CUIL', authenticateToken, authorizeRole('Empleado'), update)
distributorRouter.delete('/:CUIL', authenticateToken, authorizeRole('Empleado'), remove)
