import { Router } from "express";
import { sanitizeProductInput,findAll, findOne, add, update,remove } from "./product.controler.js";


export const productRouter = Router()

productRouter.get('/', findAll)
productRouter.get('/:id', findOne)
productRouter.post('/',sanitizeProductInput, add)
productRouter.put('/:id', update)
productRouter.patch('/:id', update)
productRouter.delete('/:id', remove)