import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { Order } from './order.entity.js'
import { User } from '../users/user.entity.js'
import { Product } from '../products/product.entity.js'
import { OrderItem } from '../orderItems/orderItem.entity.js'
import { Coupon } from '../coupons/coupon.entity.js'

const em = orm.em

function sanitizeOrderInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedOrderInput = {
    fecha_pedido: req.body.fecha_pedido,
    total: req.body.total,
    estado: req.body.estado,
    metodo_pago: req.body.metodo_pago,
    couponCode: req.body.couponCode,
    orderItems: Array.isArray(req.body.orderItems) ? req.body.orderItems.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      item_price: item.item_price
    })) : []
  };

  Object.keys(req.body.sanitizedOrderInput).forEach((key) => {
    if (req.body.sanitizedOrderInput[key] === undefined) {
      delete req.body.sanitizedOrderInput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await em.find(Order, {}, {
      populate: ['orderItems', 'orderItems.product']
    });
    res.status(200).json({ message: 'found all Orders', data: orders })
  } catch (error: any) {
    next(error)
  }
}

async function findOne(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number.parseInt(req.params.id)
    const order = await em.findOneOrFail(Order, { id }, { populate: ['orderItems'] })
    res.status(200).json({ message: 'found order', data: order })
  } catch (error: any) {
    next(error)
  }
}

async function findOrderbyUser(req: Request, res: Response, next: NextFunction) {
  const userId = Number.parseInt(req.params.idUser)

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'El ID del usuario no es válido' })
  }
  try {
    const orders = await em.find(Order, {
      user: { id: userId }
    }, {
      populate: ['orderItems', 'orderItems.product']
    })
    res.json(orders)
  } catch (error: any) {
    next(error)
  }
}

async function add(req: Request, res: Response, next: NextFunction) {
  try {
    const order = em.create(Order, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'Order created', data: order })
  } catch (error: any) {
    next(error)
  }
}

async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number.parseInt(req.params.id)
    const order = em.getReference(Order, id)
    await em.removeAndFlush(order)
    res.status(200).json({ message: 'order deleted' })
  } catch (error: any) {
    next(error)
  }
}

async function placeOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = Number(req.body.userId)
    const { orderItems, couponCode } = req.body.sanitizedOrderInput
    const user = await em.findOne(User, { id: userId })
    if (!user) {
      res.status(404).json({ message: 'El usuario no existe' })
      return
    }

    if (user.rol === 'Empleado') {
      res.status(403).json({ message: 'Acceso denegado: Los empleados no pueden realizar compras.' })
      return
    }

    const order = em.create(Order, {
      ...req.body.sanitizedOrderInput,
      user
    })

    let total = 0
    const orderItemPromise = orderItems.map(async (item: any) => {
      const product = await em.findOne(Product, { id: item.productId });
      if (!product) {
        throw new Error(`Producto con id ${item.productId} no encontrado`);
      }

      if (!product.isContinued) {
        throw new Error(`El producto ${product.name} ha sido discontinuado y no puede comprarse.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`El producto ${product.name} no tiene suficiente stock`);
      }

      product.stock -= item.quantity;

      const orderItem = new OrderItem();
      orderItem.order = order;
      orderItem.product = product;
      orderItem.quantity = item.quantity;
      orderItem.item_price = item.item_price

      total += item.item_price * item.quantity

      return orderItem
    })

    const processedOrderItems = await Promise.all(orderItemPromise);

    processedOrderItems.forEach(item => {
      if (item) {
        order.orderItems.add(item)
      }
    })

    // Aplicar cupón si existe
    if (couponCode) {
      const coupon = await em.findOne(Coupon, { code: couponCode }) as Coupon | null
      if (!coupon) {
        res.status(404).json({ message: 'Cupón no válido' })
        return
      }

      if (coupon.expirationDate < new Date()) {
        res.status(400).json({ message: 'El cupón ha expirado' })
        return
      }

      order.coupon = coupon
      total = total * (1 - coupon.discountPercentage / 100)
    }

    order.total = total

    const orderItemsToRemove = order.orderItems.filter(item => !item.product)
    orderItemsToRemove.forEach(item => {
      order.orderItems.remove(item)
    })

    await em.flush()
    res.status(201).json(order)
  } catch (error: any) {
    next(error)
  }
}

async function cancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const idOrder = Number.parseInt(req.params.idOrder)
    const order = await em.findOne(Order, idOrder, { populate: ['orderItems'] })

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
      }
    }
  } catch (error: any) {
    next(error)
  }
}

export { sanitizeOrderInput, findAll, findOne, add, remove, placeOrder, findOrderbyUser, cancelOrder }