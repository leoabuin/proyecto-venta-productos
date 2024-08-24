import { Router } from "express";
import { findAll } from "../products/product.controler";

export const distributorRouter = Router()

//distributorRouter.post('/:idProduct/prices', distributorRControler.addPriceToProduct)
distributorRouter.get('/', findAll)
/*distributorRouter.get('/:id', findOne)
distributorRouter.post('/',sanitizeDistributorInput, add)
distributorRouter.put('/:id', update)
distributorRouter.patch('/:id', update)
distributorRouter.delete('/:id', remove)*/