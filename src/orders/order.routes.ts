import { Router } from "express";
import { sanitizeOrderInput, add, findAll, findOne, remove, placeOrder, findOrderbyUser, cancelOrder, markOrderAsPaid, checkPayment } from "./order.controler.js";
import { authMiddleware, adminOnly } from "../shared/auth.middleware.js";

export const orderRouter = Router()

orderRouter.get('/', authMiddleware, adminOnly, findAll)
//orderRouter.get('/:id', findOne)
//orderRouter.post('/', sanitizeOrderInput, add)
orderRouter.delete('/:id', authMiddleware, adminOnly, remove)
orderRouter.post('/', authMiddleware, sanitizeOrderInput, placeOrder)
orderRouter.get('/:idUser', authMiddleware, findOrderbyUser)
// Verificar pago contra Mercado Pago (PÚBLICO - sin autenticación)
orderRouter.get('/:id/check-payment', checkPayment)
// Marcar orden como pagada (sin autenticación requerida)
orderRouter.put('/:id/mark-paid', markOrderAsPaid)
orderRouter.post('/:idOrder', authMiddleware, cancelOrder)