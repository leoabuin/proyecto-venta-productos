
import { Router } from "express";
import { sanitizeUserInput, findAll, findOne, add, update,remove, logIn, logOut} from "./user.controler.js";
import { authenticateToken } from "./verifyToken.js";

export const userRouter = Router()

userRouter.get('/', findAll)
userRouter.get('/:id', findOne)
userRouter.post('/', sanitizeUserInput, add)
userRouter.put('/:dni',authenticateToken, update)
userRouter.patch('/:id', update)
userRouter.delete('/:id', remove)
userRouter.post('/logIn',logIn)
userRouter.post('/logOut',logOut)