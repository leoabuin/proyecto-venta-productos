import { Request, Response, NextFunction } from 'express'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { orm } from '../shared/orm.js'
import { Order } from '../orders/order.entity.js'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN as string,
})

/**
 * POST /api/payment/create-preference
 * Crea una preferencia de pago en Mercado Pago y devuelve el init_point.
 */
export async function createPreference(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderId, items } = req.body

    if (!orderId || !items || items.length === 0) {
      res.status(400).json({ message: 'orderId e items son requeridos' })
      return
    }

    const frontUrl = process.env.FRONTEND_URL || 'http://localhost:4200'

    const preference = new Preference(client)
    const response = await preference.create({
      body: {
        items: items.map((item: any) => ({
          id: String(item.id || item.productId),
          title: item.title || item.name,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          currency_id: 'ARS',
        })),
        back_urls: {
          success: `${frontUrl}/payment/success?orderId=${orderId}`,
          failure: `${frontUrl}/payment/failure?orderId=${orderId}`,
          pending: `${frontUrl}/payment/pending?orderId=${orderId}`,
        },
        auto_return: 'approved',
        external_reference: String(orderId),
        notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payment/webhook`,
      }
    })

    res.status(200).json({
      preference_id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    })
  } catch (error: any) {
    next(error)
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
      const paymentApi = new Payment(client)
      const paymentInfo = await paymentApi.get({ id: data.id })

      const orderId = Number(paymentInfo.external_reference)
      const status = paymentInfo.status // 'approved', 'rejected', 'pending'

      const em = orm.em.fork()
      const order = await em.findOne(Order, { id: orderId })

      if (order) {
        if (status === 'approved') {
          order.estado = 'Pagado'
        } else if (status === 'rejected') {
          order.estado = 'Rechazado'
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
 * Consulta el estado actual de la orden en la BD.
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

    res.status(200).json({
      orderStatus: order.estado,
      orderId: order.id,
    })
  } catch (error: any) {
    next(error)
  }
}
