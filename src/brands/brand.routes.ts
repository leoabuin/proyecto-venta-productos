import { Router } from "express";
import { sanitizeBrandInput,findAll, findOne, add, update,remove } from "./brand.controler.js";
import { productControler } from "../products/product.controler.js";


export const brandRouter = Router()

brandRouter.post('/:idBrand/products',productControler.addProductToBrand )
brandRouter.get('/', findAll)
brandRouter.get('/:id', findOne)
brandRouter.post('/',sanitizeBrandInput, add)
brandRouter.put('/:id', update)
brandRouter.patch('/:id', update)
brandRouter.delete('/:id', remove)