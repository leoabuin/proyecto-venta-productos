import { Router } from "express";
import { sanitizeCategoryInput, findAll, findOne, add, update,remove } from "./category.controler.js";


export const categoryRouter = Router()

categoryRouter.get('/', findAll)
categoryRouter.get('/:id', findOne)
categoryRouter.post('/', sanitizeCategoryInput, add)
categoryRouter.put('/:id', sanitizeCategoryInput, update)
categoryRouter.patch('/:id', sanitizeCategoryInput, update)
categoryRouter.delete('/:id', remove)