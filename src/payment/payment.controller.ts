import { Request, Response, NextFunction } from 'express'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { orm } from '../shared/orm.js'
import { Order } from '../orders/order.entity.js'

function getClient(): MercadoPagoConfig {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) throw new Error('MP_ACCESS_TOKEN no está configurado en el .env')
  return new MercadoPagoConfig({ accessToken: token })
}

/**
 * POST /api/payment/create-preference
 * Crea una preferencia de pago en Mercado Pago y devuelve el init_point.
 */
export async function createPreference(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderId, items } = req.body

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'orderId e items son requeridos' })
      return
    }

    // Construir items con unit_price siempre numérico y > 0
    const mpItems = items.map((item: any) => ({
      id: String(item.id || item.productId || '1'),
      title: String(item.title || item.name || 'Producto'),
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unit_price) || 1,
      currency_id: 'ARS',
    }))

    const frontUrl = process.env.FRONTEND_URL || 'http://localhost:4200'

    const preference = new Preference(getClient())
    const response = await preference.create({
      body: {
        items: mpItems,
        external_reference: String(orderId),
        back_urls: {
          success: `${frontUrl}/payment/success`,
          failure: `${frontUrl}/payment/failure`,
          pending: `${frontUrl}/payment/pending`,
        },
        // auto_return solo funciona con HTTPS; en prod agregar: auto_return: 'approved'
      },
    })

    console.log('Preferencia MP creada, id:', response.id)

    res.status(200).json({
      preference_id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    })
  } catch (error: any) {
    // Loguear el error completo de MP para facilitar el debug
    console.error('Error Mercado Pago createPreference (causa):', JSON.stringify(error?.cause || error?.message || error))
    const safeError = new Error(error?.message || 'Error al conectar con Mercado Pago')
    ;(safeError as any).status = 502
    next(safeError)
  }
}

/**
 * POST /api/payment/webhook
 * Webhook que Mercado Pago llama cuando cambia el estado de un pago.
 */
export async function handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, data } = req.body

    if (type === 'payment' && data?.id) {
      const paymentApi = new Payment(getClient())
      const paymentInfo = await paymentApi.get({ id: data.id })

      const orderId = Number(paymentInfo.external_reference)
      const status = paymentInfo.status

      const em = orm.em.fork()
      const order = await em.findOne(Order, { id: orderId }, { populate: ['orderItems', 'orderItems.product'] as any })

      if (order) {
        if (status === 'approved') {
          order.estado = 'Pagado'
          // Descontar stock ahora que el pago está confirmado
          for (const oi of (order.orderItems as any).getItems()) {
            if (oi.product && oi.quantity) {
              oi.product.stock = Math.max(0, oi.product.stock - oi.quantity)
            }
          }
        } else if (status === 'rejected') {
          order.estado = 'Rechazado'
          // No tocar stock: nunca fue descontado
        } else {
          order.estado = 'Pago Pendiente'
        }
        await em.flush()
      }
    }

    res.sendStatus(200)
  } catch (error: any) {
    next(error)
  }
}

/**
 * POST /api/payment/verify-payment
 * Recibe { order_id, payment_id? }
 * Si recibe payment_id, verifica el estado real en MP y actualiza la BD.
 * Si no, devuelve el estado actual en la BD.
 */
export async function verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { order_id, payment_id } = req.body
    const em = orm.em.fork()
    const order = await em.findOne(Order, { id: Number(order_id) }, { populate: ['orderItems', 'orderItems.product'] as any })

    if (!order) {
      res.status(404).json({ message: 'Orden no encontrada' })
      return
    }

    // Si recibimos un payment_id, consultamos MP y actualizamos la BD
    if (payment_id) {
      try {
        const paymentApi = new Payment(getClient())
        const paymentInfo = await paymentApi.get({ id: String(payment_id) })
        const status = paymentInfo.status  // 'approved' | 'rejected' | 'pending' | 'in_process'

        console.log(`[verify-payment] MP status para payment ${payment_id}: ${status}`)

        if (status === 'approved' && order.estado !== 'Pagado') {
          order.estado = 'Pagado'
          // Descontar stock ahora que el pago está confirmado
          for (const oi of (order.orderItems as any).getItems()) {
            if (oi.product && oi.quantity) {
              oi.product.stock = Math.max(0, oi.product.stock - oi.quantity)
            }
          }
          await em.flush()
        } else if (status === 'rejected' && order.estado === 'pending') {
          order.estado = 'Rechazado'
          await em.flush()
        }

        res.status(200).json({
          paymentStatus: status,
          orderStatus: order.estado,
          orderId: order.id,
          paymentId: String(payment_id),
        })
        return
      } catch (mpError: any) {
        console.error('[verify-payment] Error al consultar MP:', mpError?.message)
        // Si falla la consulta a MP, devolvemos el estado actual de la BD igual
      }
    }

    // Sin payment_id: devolver estado actual de la BD
    res.status(200).json({
      paymentStatus: order.estado === 'Pagado' ? 'approved' : 'pending',
      orderStatus: order.estado,
      orderId: order.id,
    })
  } catch (error: any) {
    next(error)
  }
}
