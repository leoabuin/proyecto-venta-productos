import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { Order } from './order.entity.js'
import { User } from '../users/user.entity.js'
import { Product } from '../products/product.entity.js'
import { OrderItem } from '../orderItems/orderItem.entity.js'



const em = orm.em

function sanitizedOrderInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedOrderInput = {
    fecha_pedido: req.body.fecha_pedido,
    total: req.body.total,
    estado: req.body.estado,
    metodo_pago: req.body.metodo_pago,
    orderItems: req.body.orderItems.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity
    }))

  }
  
  //more checks here

  Object.keys(req.body.sanitizedOrderInput).forEach((key) => {
    if (req.body.sanitizedOrderInput[key] === undefined) {
      delete req.body.sanitizedOrderInput[key]
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



async function placeOrder(req:Request, res: Response): Promise<void> {
  try {
    const userId = Number(req.params.id)
    const { orderItems} = req.body.sanitizedOrderInput
    const user = await em.findOne(User, { id: userId })
    if (!user) {
      res.status(404).json({ message: 'El usuario no existe' })
    }
 
    const order = em.create(Order, {
      ...req.body.sanitizedOrderInput,
      user 
    })

    for (const orderItem of orderItems) {
      const product = await em.findOneOrFail(Product,{ id: orderItem.productId })
      console.log('nhhhhhh'+product.name)

      if (product.stock < orderItem.quantity) {
        res.status(400).json({ message: `El producto ${product.name} no tiene suficiente stock` })
      }

      //product.stock -= orderItem.quantity
      //em.persist(product)

      const orderItemEntity = em.create(OrderItem, {
        order,
        product,
        quantity: orderItem.quantity,
        item_price: 5000
      })
      order.orderItems.add(orderItemEntity);
      em.persist(orderItemEntity)
      //em.flush()
    }
    em.flush()
    //await em.persistAndFlush(order)
    res.status(201).json(order);
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




export { sanitizedOrderInput, findAll, findOne, add, remove, placeOrder}