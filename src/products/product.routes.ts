import { Router } from "express";
import { productControler } from "./product.controler.js";
import { priceControler } from "./price.controler.js";
import { authenticateToken } from "../users/verifyToken.js";
import { authorizeRole } from "../users/authzoritation.js";


export const productRouter = Router()

productRouter.post('/:idProduct/prices', priceControler.addPriceToProduct)
productRouter.get('/', productControler.findAll)
productRouter.get('/:id', productControler.findOne)
productRouter.post('/', authenticateToken, authorizeRole('Empleado'), productControler.sanitizeProductInput, productControler.add)
productRouter.put('/:id', authenticateToken, authorizeRole('Empleado'), productControler.update)
productRouter.patch('/:id', authenticateToken, authorizeRole('Empleado'), productControler.sanitizeProductInput, productControler.update);
productRouter.delete('/:id', authenticateToken, authorizeRole('Empleado'), productControler.remove)
productRouter.patch('/:id/toggle-offer', authenticateToken, authorizeRole('Empleado'), productControler.toggleOffer);