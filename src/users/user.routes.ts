import { Router } from "express";
import { sanitizeUserInput, findAll, findOne, add, update, remove, logIn, logOut, addFavorite, removeFavorite, getFavorites } from "./user.controler.js";
import { authMiddleware, adminOnly } from "../shared/auth.middleware.js";

export const userRouter = Router()

userRouter.get('/favorites', authMiddleware, getFavorites)
userRouter.post('/favorites/:productId', authMiddleware, addFavorite)
userRouter.delete('/favorites/:productId', authMiddleware, removeFavorite)

userRouter.post('/logIn', logIn)
userRouter.post('/logOut', logOut)

userRouter.get('/', authMiddleware, adminOnly, findAll)
userRouter.get('/:id', authMiddleware, findOne)
userRouter.post('/', sanitizeUserInput, add)
userRouter.put('/:id', authMiddleware, update)
userRouter.patch('/:id', authMiddleware, update)
userRouter.delete('/:id', authMiddleware, adminOnly, remove)