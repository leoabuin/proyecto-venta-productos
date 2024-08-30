import { Router } from "express";
import { productControler } from "./product.controler.js";
import { priceControler } from "./price.controler.js";


export const productRouter = Router()

productRouter.post('/:idProduct/prices', priceControler.addPriceToProduct)
productRouter.get('/', productControler.findAll)
productRouter.get('/:id', productControler.findOne)
productRouter.post('/',productControler.sanitizeProductInput, productControler.add)
productRouter.put('/:id', productControler.update)
productRouter.patch('/:id', productControler.update)
productRouter.delete('/:id', productControler.remove)