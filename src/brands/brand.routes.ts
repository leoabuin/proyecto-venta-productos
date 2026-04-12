import { Router } from "express";
import { sanitizeBrandInput, findAll, findOne, add, update, remove } from "./brand.controler.js";
import { productControler } from "../products/product.controler.js";
import { authMiddleware, staffOnly } from "../shared/auth.middleware.js";

export const brandRouter = Router()

brandRouter.post('/:idBrand/products', authMiddleware, staffOnly, productControler.addProductToBrand)
brandRouter.get('/', findAll)
brandRouter.get('/:id', findOne)
brandRouter.post('/', authMiddleware, staffOnly, sanitizeBrandInput, add)
brandRouter.put('/:id', authMiddleware, staffOnly, update)
brandRouter.patch('/:id', authMiddleware, staffOnly, update)
brandRouter.delete('/:id', authMiddleware, staffOnly, remove)
