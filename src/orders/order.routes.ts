import { Router } from "express";
import { sanitizeOrderInput,add,findAll,findOne,remove,placeOrder,findOrderbyUser, cancelOrder } from "./order.controler.js";


export const orderRouter = Router()

orderRouter.get('/', findAll)
//orderRouter.get('/:id', findOne)
//orderRouter.post('/', sanitizedOrderInput, add)
orderRouter.delete('/:id', remove)
orderRouter.post('/',sanitizeOrderInput,placeOrder )
orderRouter.get('/:idUser',findOrderbyUser)
orderRouter.post('/:idOrder', cancelOrder)