import { Router } from "express";
import { sanitizedOrderInput,add,findAll,findOne,remove,placeOrder } from "./order.controler.js";


export const orderRouter = Router()

orderRouter.get('/', findAll)
orderRouter.get('/:id', findOne)
orderRouter.post('/', sanitizedOrderInput, add)
orderRouter.delete('/:id', remove)
orderRouter.post('/:id',sanitizedOrderInput,placeOrder )