import { Router } from "express";
import { productControler } from "./product.controler.js";
import { priceControler } from "./price.controler.js";
import { authMiddleware, staffOnly } from "../shared/auth.middleware.js";

export const productRouter = Router()

productRouter.post('/:idProduct/prices', authMiddleware, staffOnly, priceControler.addPriceToProduct)
productRouter.get('/', productControler.findAll)
productRouter.get('/:id', productControler.findOne)
productRouter.post('/', authMiddleware, staffOnly, productControler.sanitizeProductInput, productControler.add)
productRouter.put('/:id', authMiddleware, staffOnly, productControler.update)
productRouter.patch('/:id', authMiddleware, staffOnly, productControler.sanitizeProductInput, productControler.update);
productRouter.delete('/:id', authMiddleware, staffOnly, productControler.remove)
productRouter.patch('/:id/toggle-offer', authMiddleware, staffOnly, productControler.toggleOffer);
