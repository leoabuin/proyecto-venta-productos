import { Router } from "express";
import { sanitizeOrderInput, add, findAll, findOne, remove, placeOrder, findOrderbyUser, cancelOrder } from "./order.controler.js";
import { authMiddleware, adminOnly } from "../shared/auth.middleware.js";

export const orderRouter = Router()

orderRouter.get('/', authMiddleware, adminOnly, findAll)
//orderRouter.get('/:id', findOne)
//orderRouter.post('/', sanitizeOrderInput, add)
orderRouter.delete('/:id', authMiddleware, adminOnly, remove)
orderRouter.post('/', authMiddleware, sanitizeOrderInput, placeOrder)
orderRouter.get('/:idUser', authMiddleware, findOrderbyUser)
orderRouter.post('/:idOrder', authMiddleware, cancelOrder)
