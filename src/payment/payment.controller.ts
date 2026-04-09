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

    console.log('MP items a enviar:', JSON.stringify(mpItems))

    const preference = new Preference(getClient())
    const response = await preference.create({
      body: {
        items: mpItems,
        external_reference: String(orderId),
        // back_urls y auto_return sólo si hay FRONTEND_URL en prod (HTTPS)
        ...(process.env.FRONTEND_URL
          ? {
              back_urls: {
                success: `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}`,
                failure: `${process.env.FRONTEND_URL}/payment/failure?orderId=${orderId}`,
                pending: `${process.env.FRONTEND_URL}/payment/pending?orderId=${orderId}`,
              },
              auto_return: 'approved' as const,
            }
          : {}),
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
 */
export async function verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { order_id } = req.body
    const em = orm.em.fork()
    const order = await em.findOne(Order, { id: Number(order_id) })

    if (!order) {
      res.status(404).json({ message: 'Orden no encontrada' })
      return
    }

    res.status(200).json({ orderStatus: order.estado, orderId: order.id })
  } catch (error: any) {
    next(error)
  }
}
