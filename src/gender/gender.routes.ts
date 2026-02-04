import { Router } from "express";
import { sanitizeGenderInput, findAll, findOne, add, update,remove } from "./gender.controller.js";    

export const genderRouter = Router()

genderRouter.get('/', findAll)
genderRouter.get('/:id', findOne)
genderRouter.post('/',sanitizeGenderInput, add)
genderRouter.put('/:id',sanitizeGenderInput, update)
genderRouter.delete('/:id', remove)