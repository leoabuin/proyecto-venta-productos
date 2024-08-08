import { Router } from "express";
import { findAll, findOne, add, update,remove } from "./price.controler.js";


export const priceRouter = Router()

priceRouter.get('/', findAll)
priceRouter.get('/:id', findOne)
priceRouter.post('/', add)
priceRouter.put('/:id', update)
priceRouter.patch('/:id', update)
priceRouter.delete('/:id', remove)