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
    orderItems: req.body.orderItems,
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
  try {
    const orders = await em.find(Order,{},{populate:['orderItems']})
    res.status(200).json({message:'found all Orders',data:orders})
  } catch (error: any) {
    return res.status(500).json({message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const order = await em.findOneOrFail(Order,{id},{populate:['orderItems']})
    res.status(200).json({message:'found order',data:order})
  } catch (error: any) {
    return res.status(500).json({message: error.message})
  }
}

async function add(req: Request, res: Response) {
  try {
    const order = em.create(Order,req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message:'Order created', data:order})
  } catch (error:any) {
      res.status(500).json({message: error.message})
  }
}

function update(req: Request, res: Response) {
  return res.status(401).send({ message: 'funtion not implemented' })
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const order = em.getReference(Order, id)
    await em.removeAndFlush(order)
    res.status(200).json({message: 'order deleted'})
  } catch (error: any) {
    res.status(500).json({message: error.message})
  }
}



async function placeOrder(req:Request, res: Response) {
  const {usuarioId, lineasPeido} = req.body;
  try {
    
 
  } catch (error: any) {
    res.status(500).json({message: error.message})
  }

  
} 
/*
  1) cliente puede agregar producto a su carrito con su cantidad (lineas de pedido)
  2) cuando el cliente decide finalizar su pedido, presiona finalizar pedido
  nota: en que momento se crea el pedido. 
  nota: en que momento se crea la linea de pedido


*/




export { sanitizeOrderInput, findAll, findOne, add, update, remove, placeOrder}