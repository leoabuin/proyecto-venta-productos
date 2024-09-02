import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { Order } from './order.entity.js'



const em = orm.em

function sanitizeOrderInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    fecha_pedido: req.body.fecha_pedido,
    total: req.body.total,
    estado: req.body.estado,
    metodo_pago: req.body.metodo_pago,
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
    return res.status(401).send({ message: 'metod not omplemented' })
}

function findOne(req: Request, res: Response) {
  return res.status(401).send({ message: 'metod not omplemented' })
}

function add(req: Request, res: Response) {
  return res.status(401).send({ message: 'metod not omplemented' })
}

function update(req: Request, res: Response) {
  return res.status(401).send({ message: 'metod not omplemented' })
}

function remove(req: Request, res: Response) {
  return res.status(401).send({ message: 'metod not omplemented' })
}

export { sanitizeOrderInput, findAll, findOne, add, update, remove }