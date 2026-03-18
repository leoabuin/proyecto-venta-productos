import { Router } from "express";
import { productControler } from "./product.controler.js";
import { priceControler } from "./price.controler.js";
import { authMiddleware, adminOnly } from "../shared/auth.middleware.js";

export const productRouter = Router()

productRouter.post('/:idProduct/prices', authMiddleware, adminOnly, priceControler.addPriceToProduct)
productRouter.get('/', productControler.findAll)
productRouter.get('/:id', productControler.findOne)
productRouter.post('/', authMiddleware, adminOnly, productControler.sanitizeProductInput, productControler.add)
productRouter.put('/:id', authMiddleware, adminOnly, productControler.update)
productRouter.patch('/:id', authMiddleware, adminOnly, productControler.sanitizeProductInput, productControler.update);
productRouter.delete('/:id', authMiddleware, adminOnly, productControler.remove)
productRouter.patch('/:id/toggle-offer', authMiddleware, adminOnly, productControler.toggleOffer);