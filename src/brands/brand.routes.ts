import { Router } from "express";
import { sanitizeBrandInput, findAll, findOne, add, update, remove } from "./brand.controler.js";
import { productControler } from "../products/product.controler.js";
import { authMiddleware, adminOnly } from "../shared/auth.middleware.js";

export const brandRouter = Router()

brandRouter.post('/:idBrand/products', authMiddleware, adminOnly, productControler.addProductToBrand)
brandRouter.get('/', findAll)
brandRouter.get('/:id', findOne)
brandRouter.post('/', authMiddleware, adminOnly, sanitizeBrandInput, add)
brandRouter.put('/:id', authMiddleware, adminOnly, update)
brandRouter.patch('/:id', authMiddleware, adminOnly, update)
brandRouter.delete('/:id', authMiddleware, adminOnly, remove)