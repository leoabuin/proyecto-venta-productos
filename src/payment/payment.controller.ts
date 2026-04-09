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
        // auto_return requiere HTTPS — se activa solo en producción con FRONTEND_URL definido
        ...(process.env.FRONTEND_URL ? { auto_return: 'approved' as const } : {}),
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
 * Body: { order_id, payment_id?, mp_status? }
 * Estrategias de verificación (en orden):
 * 1. Si viene payment_id + mp_status='approved' → confiar en el redirect de MP
 * 2. Si viene payment_id solo → verificar con MP API
 * 3. Si no viene payment_id → buscar en MP por external_reference (para sandbox/sin redirect)
 */
export async function verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { order_id, payment_id, mp_status } = req.body
    const em = orm.em.fork()
    const order = await em.findOne(Order, { id: Number(order_id) }, { populate: ['orderItems', 'orderItems.product'] as any })

    if (!order) {
      res.status(404).json({ message: 'Orden no encontrada' })
      return
    }

    if (order.estado === 'Pagado') {
      res.status(200).json({ paymentStatus: 'approved', orderStatus: 'Pagado', orderId: order.id })
      return
    }

    let mpPaymentStatus: string | null = null

    // === Estrategia 1: payment_id + mp_status desde redirect de MP ===
    if (payment_id && mp_status === 'approved') {
      mpPaymentStatus = 'approved'
    }

    // === Estrategia 2: verificar por payment_id con la API de MP ===
    if (payment_id && !mpPaymentStatus) {
      try {
        const paymentApi = new Payment(getClient())
        const paymentInfo = await paymentApi.get({ id: String(payment_id) })
        mpPaymentStatus = paymentInfo.status ?? null
        console.log(`[verify-payment] MP API (by id) status: ${mpPaymentStatus}`)
      } catch (e: any) {
        console.warn('[verify-payment] Error al verificar por payment_id:', e?.message)
      }
    }

    // === Estrategia 3: buscar por external_reference (sandbox / sin redirect) ===
    if (!mpPaymentStatus) {
      try {
        const { default: axios } = await import('axios')
        const searchRes = await axios.get('https://api.mercadopago.com/v1/payments/search', {
          params: { external_reference: String(order_id), sort: 'date_created', criteria: 'desc', limit: 5 },
          headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
        })
        const payments: any[] = searchRes.data?.results ?? []
        const approved = payments.find((p: any) => p.status === 'approved')
        if (approved) {
          mpPaymentStatus = 'approved'
          console.log(`[verify-payment] Pago aprobado encontrado por external_reference: ${approved.id}`)
        } else if (payments.length > 0) {
          mpPaymentStatus = payments[0].status
          console.log(`[verify-payment] Último pago por external_reference: ${mpPaymentStatus}`)
        }
      } catch (e: any) {
        console.warn('[verify-payment] Error al buscar por external_reference:', e?.message)
      }
    }

    // === Actualizar la orden si el pago fue aprobado ===
    if (mpPaymentStatus === 'approved') {
      order.estado = 'Pagado'
      for (const oi of (order.orderItems as any).getItems()) {
        if (oi.product && oi.quantity) {
          oi.product.stock = Math.max(0, oi.product.stock - oi.quantity)
        }
      }
      await em.flush()
      console.log(`[verify-payment] ✅ Orden #${order_id} actualizada a PAGADO`)
    }

    res.status(200).json({
      paymentStatus: mpPaymentStatus ?? 'pending',
      orderStatus: order.estado,
      orderId: order.id,
    })
  } catch (error: any) {
    next(error)
  }
}


