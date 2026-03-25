import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { Order } from './order.entity.js'
import { User } from '../users/user.entity.js'
import { Product } from '../products/product.entity.js'
import { OrderItem } from '../orderItems/orderItem.entity.js'
import { MercadoPagoConfig, Payment } from 'mercadopago'

const em = orm.em

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
})

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
    const { orderItems } = req.body.sanitizedOrderInput
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

      return orderItem
    })

    const processedOrderItems = await Promise.all(orderItemPromise);

    processedOrderItems.forEach(item => {
      if (item) {
        order.orderItems.add(item)
      }
    })

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
    const order = await em.findOne(Order, idOrder, { populate: ['orderItems', 'orderItems.product'] })

    if (!order) {
      return res.status(404).json({ message: `La orden con ID ${idOrder} no existe.` });
    }

    if (order.estado === 'Cancelado') {
      return res.status(400).json({ message: `El pedido nro ${order.id} ya está cancelado.` });
    }

    if (order.estado === 'Pagado' || order.estado === 'Entregado') {
      return res.status(400).json({ message: `El pedido nro ${order.id} no se puede cancelar porque ya fue ${order.estado.toLowerCase()}.` });
    }

    // Restaurar el stock de cada producto
    for (const orderItem of order.orderItems.getItems()) {
      const product = orderItem.product;
      if (product && orderItem.quantity) {
        product.stock += orderItem.quantity;
      }
    }

    order.estado = 'Cancelado';

    await em.flush();

    return res.status(200).json({ message: `El pedido nro ${order.id} ha sido cancelado exitosamente.` });
  } catch (error: any) {
    next(error)
  }
}

// PUT /api/orders/:id/mark-paid
// Marcar una orden como pagada - ENDPOINT CRÍTICO SIN FALLAS
async function markOrderAsPaid(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = Number(req.params.id)

    console.log(`\n[MARK-PAID] ========================`)
    console.log(`[MARK-PAID] Solicitud recibida para orden: ${orderId}`)
    console.log(`[MARK-PAID] Tipo: ${typeof orderId}`)

    if (!orderId || isNaN(orderId)) {
      console.error(`[MARK-PAID] ERROR: orderId inválido`)
      return res.status(400).json({ message: 'ID de orden inválido' })
    }

    console.log(`[MARK-PAID] Buscando orden en BD...`)
    const order = await em.findOne(Order, { id: orderId })

    if (!order) {
      console.error(`[MARK-PAID] ERROR: Orden ${orderId} NO ENCONTRADA`)
      return res.status(404).json({ message: `Orden ${orderId} no encontrada` })
    }

    console.log(`[MARK-PAID] ✓ Orden encontrada`)
    console.log(`[MARK-PAID] Estado actual: ${order.estado}`)

    const previousStatus = order.estado
    order.estado = 'Pagado'

    console.log(`[MARK-PAID] Guardando en BD... (${previousStatus} → Pagado)`)
    await em.flush()

    console.log(`[MARK-PAID] ✓ ÉXITO: Orden actualizada a "Pagado"`)
    console.log(`[MARK-PAID] ========================\n`)

    return res.status(200).json({
      success: true,
      message: 'Orden marcada como pagada',
      orderId: order.id,
      estado: order.estado,
      previousStatus
    })
  } catch (error: any) {
    console.error(`[MARK-PAID] ERROR CRÍTICO:`, error?.message)
    console.error(error?.stack)
    res.status(500).json({
      success: false,
      message: 'Error al marcar como pagado',
      error: error?.message
    })
  }
}

/**
 * GET /api/orders/{id}/check-payment
 * Endpoint PÚBLICO que verifica contra Mercado Pago si una orden fue pagada
 * Si fue pagada, automáticamente actualiza el estado en BD
 */
async function checkPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const orderId = Number(req.params.id)

    console.log(`\n[CHECK-PAYMENT] ═════════════════════════════════════`)
    console.log(`[CHECK-PAYMENT] Verificando orden ${orderId}`)

    if (!orderId || isNaN(orderId)) {
      console.error(`[CHECK-PAYMENT] ERROR: orderId inválido`)
      res.status(400).json({ message: 'ID de orden inválido' })
      return
    }

    const contextEm = orm.em.fork()
    const order = await contextEm.findOne(Order, { id: orderId })

    if (!order) {
      console.error(`[CHECK-PAYMENT] ERROR: Orden ${orderId} NO ENCONTRADA`)
      res.status(404).json({ message: `Orden ${orderId} no encontrada` })
      return
    }

    console.log(`[CHECK-PAYMENT] ✓ Orden encontrada`)
    console.log(`[CHECK-PAYMENT] Estado actual: ${order.estado}`)

    // Si ya está pagada, no verificar con MP
    if (order.estado === 'Pagado') {
      console.log(`[CHECK-PAYMENT] Orden ya está en estado "Pagado"`)
      res.status(200).json({
        orderId: order.id,
        estado: order.estado,
        message: 'Orden ya está pagada'
      })
      return
    }

    // Buscar pago en Mercado Pago por external_reference
    console.log(`[CHECK-PAYMENT] Buscando pago en Mercado Pago...`)
    const paymentApi = new Payment(mpClient)

    let paymentFound = false
    let paymentStatus = null

    try {
      const searchResult = await paymentApi.search({
        options: {
          external_reference: String(orderId),
          sort: 'date_created',
          criteria: 'desc',
          limit: 10
        }
      })

      const payments = (searchResult as any)?.results || []
      console.log(`[CHECK-PAYMENT] Pagos encontrados: ${payments.length}`)

      if (payments.length > 0) {
        const approvedPayment = payments.find((p: any) => p.status === 'approved')
        const latestPayment = approvedPayment || payments[0]

        paymentStatus = latestPayment.status
        console.log(`[CHECK-PAYMENT] Pago encontrado - ID: ${latestPayment.id}, Estado: ${paymentStatus}`)

        // Si está aprobado, marcar como pagado
        if (paymentStatus === 'approved') {
          console.log(`[CHECK-PAYMENT] ✓ Pago APROBADO en Mercado Pago`)
          const previousStatus = order.estado
          order.estado = 'Pagado'
          order.mp_payment_id = String(latestPayment.id)
          await contextEm.flush()
          console.log(`[CHECK-PAYMENT] ✓ BD actualizada: ${previousStatus} → Pagado`)
          console.log(`[CHECK-PAYMENT] ═════════════════════════════════════\n`)

          res.status(200).json({
            orderId: order.id,
            estado: order.estado,
            message: 'Pago verificado y orden marcada como pagada',
            mpPaymentStatus: paymentStatus
          })
          return
        } else {
          console.log(`[CHECK-PAYMENT] Pago en estado: ${paymentStatus}`)
          res.status(200).json({
            orderId: order.id,
            estado: order.estado,
            message: `Pago encontrado pero en estado: ${paymentStatus}`,
            mpPaymentStatus: paymentStatus
          })
          return
        }
      } else {
        console.warn(`[CHECK-PAYMENT] NO se encontraron pagos para orden ${orderId}`)
        res.status(404).json({
          orderId: order.id,
          estado: order.estado,
          message: 'No se encontró pago en Mercado Pago'
        })
        return
      }
    } catch (mpError: any) {
      console.error(`[CHECK-PAYMENT] Error consultando Mercado Pago:`, mpError?.message)
      res.status(500).json({
        orderId: order.id,
        estado: order.estado,
        message: 'Error verificando pago con Mercado Pago'
      })
      return
    }
  } catch (error: any) {
    console.error(`[CHECK-PAYMENT] ERROR CRÍTICO:`, error?.message)
    console.error(error?.stack)
    res.status(500).json({
      message: 'Error al verificar pago',
      error: error?.message
    })
  }
}

export { sanitizeOrderInput, findAll, findOne, add, remove, placeOrder, findOrderbyUser, cancelOrder, markOrderAsPaid, checkPayment }