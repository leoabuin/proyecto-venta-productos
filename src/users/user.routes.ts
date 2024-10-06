
import { Router } from "express";
import { sanitizeUserInput, findAll, findOne, add, update,remove, logIn} from "./user.controler.js";
import { authenticateToken } from "./verifyToken.js";

export const userRouter = Router()

userRouter.get('/', findAll)
userRouter.get('/:dni', findOne)
userRouter.post('/', sanitizeUserInput, add)
userRouter.put('/:dni',authenticateToken, update)
userRouter.patch('/:dni',authenticateToken, update)
userRouter.delete('/:id', remove)
userRouter.post('/logIn',logIn)