import { Router } from "express";
import { sanitizeDistributorInput, findAll, findOne, add, update, remove } from "./distributor.controler.js";
import { authMiddleware, staffOnly } from "../shared/auth.middleware.js";

export const distributorRouter = Router()

distributorRouter.get('/', findAll)
distributorRouter.get('/:CUIL', findOne)
distributorRouter.post('/', authMiddleware, staffOnly, sanitizeDistributorInput, add)
distributorRouter.put('/:CUIL', authMiddleware, staffOnly, sanitizeDistributorInput, update)
distributorRouter.patch('/:CUIL', authMiddleware, staffOnly, update)
distributorRouter.delete('/:CUIL', authMiddleware, staffOnly, remove)

