import { Router } from "express";
import { sanitizeDistributorInput, findAll, findOne, add, update, remove } from "./distributor.controler.js";
import { authMiddleware, adminOnly } from "../shared/auth.middleware.js";

export const distributorRouter = Router()

distributorRouter.get('/', findAll)
distributorRouter.get('/:CUIL', findOne)
distributorRouter.post('/', authMiddleware, adminOnly, sanitizeDistributorInput, add)
distributorRouter.put('/:CUIL', authMiddleware, adminOnly, sanitizeDistributorInput, update)
distributorRouter.patch('/:CUIL', authMiddleware, adminOnly, update)
distributorRouter.delete('/:CUIL', authMiddleware, adminOnly, remove)
