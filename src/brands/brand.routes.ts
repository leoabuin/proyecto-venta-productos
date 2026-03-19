import { Router } from "express";
import { sanitizeBrandInput,findAll, findOne, add, update,remove } from "./brand.controler.js";
import { productControler } from "../products/product.controler.js";
import { authenticateToken } from "../users/verifyToken.js";
import { authorizeRole } from "../users/authzoritation.js";



export const brandRouter = Router()

brandRouter.post('/:idBrand/products',productControler.addProductToBrand )
brandRouter.get('/', findAll)
brandRouter.get('/:id', findOne)
brandRouter.post('/', authenticateToken, authorizeRole('Empleado'), sanitizeBrandInput, add)
brandRouter.put('/:id', authenticateToken, authorizeRole('Empleado'), update)
brandRouter.patch('/:id', authenticateToken, authorizeRole('Empleado'), update)
brandRouter.delete('/:id', authenticateToken, authorizeRole('Empleado'), remove)