import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { Order } from './order.entity.js'
import { User } from '../users/user.entity.js'
import { Product } from '../products/product.entity.js'
import { OrderItem } from '../orderItems/orderItem.entity.js'



const em = orm.em

function sanitizeOrderInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedOrderInput = {
    fecha_pedido: req.body.fecha_pedido,
    total: req.body.total,
    estado: req.body.estado,
    metodo_pago: req.body.metodo_pago,
    orderItems: Array.isArray(req.body.orderItems) ? req.body.orderItems.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      item_price: item.item_price
    })) : [] 
  };

  console.log('sanitize input')
  console.dir(req.body.sanitizedOrderInput.orderItems, { depth: 5 });
  
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

async function findOrderbyUser(req: Request, res: Response) {
  const userId = Number.parseInt(req.params.idUser)

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'El ID del usuario no es válido' })
  }
  try {
    const orders = await em.find(Order, {
      user: { id: userId }
    }, {
      populate: ['orderItems'] 
    })
    res.json(orders)
  } catch (error) {
    console.error('Error al buscar las órdenes del usuario:', error)
    res.status(500).json({ error: 'Error al buscar las órdenes del usuario' })
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
    const userId = Number(req.body.userId)
    const { orderItems} = req.body.sanitizedOrderInput
    const user = await em.findOne(User, { id: userId })
    if (!user) {
      res.status(404).json({ message: 'El usuario no existe' })
    }
 
    const order = em.create(Order, {
      ...req.body.sanitizedOrderInput,
      user 
    })
    console.log('order item')
    console.dir(orderItems,{depth:5})
    

      const orderItemPromise = orderItems.map(async (item: any) => {
        const product = await em.findOne(Product, { id: item.productId });
        if (!product) {
          throw new Error(`Producto con id ${item.productId} no encontrado`);
        }
  
        console.log('probando: ' + product.name);
  

        if (product.stock < item.quantity) {
          throw new Error(`El producto ${product.name} no tiene suficiente stock`);
        }
  
        product.stock -= item.quantity;
  
        const orderItem = new OrderItem();
        orderItem.order = order; 
        orderItem.product = product; 
        orderItem.quantity = item.quantity;
        orderItem.item_price = item.item_price

  
        console.dir(orderItem, { depth: 5 })
  
        return orderItem
      })
  
      const processedOrderItems = await Promise.all(orderItemPromise);
      console.log(processedOrderItems)
  
      processedOrderItems.forEach(item => {
        if (item) { 
          order.orderItems.add(item)
        }
      })

      console.log("PROBANDOOOO:",order)
  

      const orderItemsToRemove = order.orderItems.filter(item => !item.product)
      orderItemsToRemove.forEach(item => {
        order.orderItems.remove(item)
      })
     // order.orderItems=processedOrderItems;

      console.log(order)
  

      await em.flush()
    res.status(201).json(order)
  } catch (error: any) {
    res.status(500).json({message: error.message})
  }
  
} 



async function cancelOrder(req:Request, res:Response){
  try {
    const idOrder = Number.parseInt(req.params.idOrder)
    const order = await em.findOne(Order, idOrder,{ populate: ['orderItems'] }) 

    if (!order) {
      return res.status(404).json({ message: `La orden con ID ${idOrder} no existe.` });
    }

    if (order.estado !== 'pending') {
      return res.status(400).json({ message: `El pedido nro ${order.id} no se puede cancelar porque no está en estado Pending.` });
    }

    order.estado = 'Cancelado'


for (const orderItem of order.orderItems.getItems()) {
  const productId = orderItem.product?.id

  if (productId) { 
    const product = await em.findOne(Product, productId);
    
    if (product) {
      product.stock += orderItem.quantity
      await em.persistAndFlush(product)
      return res.status(200).json({ message: `El pedido nro ${order.id} ha sido cancelado exitosamente.` })
    }
  } else {
    console.error(`El producto del orderItem no tiene un id válido.`);
  }
}
    
  } catch (error:any) {
    return res.status(500).json({ message: `Error al cancelar la orden: ${error.message}` });
  }

}





/*
  1) cliente puede agregar producto a su carrito con su cantidad (lineas de pedido)
  2) cuando el cliente decide finalizar su pedido, presiona finalizar pedido
  nota: en que momento se crea el pedido. 
  nota: en que momento se crea la linea de pedido


*/




export { sanitizeOrderInput , findAll, findOne, add, remove, placeOrder, findOrderbyUser, cancelOrder}