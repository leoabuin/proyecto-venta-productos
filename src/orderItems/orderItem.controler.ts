import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { OrderItem } from './orderItem.entity.js'



const em = orm.em

function sanitizeOrderItemInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    order: req.body.order,
    product: req.body.product,
    quantity: req.body.quantity,
    item_price: req.body.item_price,
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response) {
    return res.status(401).send({ message: 'function not omplemented' })
}

function findOne(req: Request, res: Response) {
  return res.status(401).send({ message: 'function not omplemented' })
}

function add(req: Request, res: Response) {
  return res.status(401).send({ message: 'function not omplemented' })
}

function update(req: Request, res: Response) {
  return res.status(401).send({ message: 'function not omplemented' })
}

function remove(req: Request, res: Response) {
  return res.status(401).send({ message: 'function not omplemented' })
}


/*

nota: hace falta hacer un findOne, update de linea de pedido?
*/

async function addProductToCart(req: Request, res:Response) {
    return res.status(401).send({message: 'function not implemented'})
}


export { sanitizeOrderItemInput, findAll, findOne, add, update, remove,addProductToCart }