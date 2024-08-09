import { Router } from "express";
import { priceControler } from "./price.controler.js";


export const priceRouter = Router()

priceRouter.get('/', priceControler.findAll)
//priceRouter.get('/:id', priceControler.findOne)
priceRouter.post('/', priceControler.add)
priceRouter.put('/:id', priceControler.update)
priceRouter.patch('/:id', priceControler.update)
priceRouter.delete('/:id', priceControler.remove)
//priceRouter.put('/:idProduct',addProduct)
