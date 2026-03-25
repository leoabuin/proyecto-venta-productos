import { Request, Response, NextFunction } from 'express'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { orm } from '../shared/orm.js'
import { Order } from '../orders/order.entity.js'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
})

// POST /api/payment/create-preference
async function createPreference(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderId, items } = req.body

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'orderId e items son requeridos' })
      return
    }

    const em = orm.em.fork()
    const order = await em.findOne(Order, { id: Number(orderId) })

    if (!order) {
      res.status(404).json({ message: `Orden con ID ${orderId} no encontrada` })
      return
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200'
    const backendUrl = process.env.BACKEND_URL || ''
    const isLocalhost = backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1')

    const preference = new Preference(client)
    const body: any = {
      items: items.map((item: any) => ({
        id: String(item.productId || item.id || orderId),
        title: String(item.title),
        quantity: Number(item.quantity),
        unit_price: Math.round(Number(item.unit_price) * 100) / 100,
        currency_id: 'ARS',
      })),
      back_urls: {
        success: `${frontendUrl}/payment/success`,
        failure: `${frontendUrl}/payment/failure`,
        pending: `${frontendUrl}/payment/pending`,
      },
      external_reference: String(orderId),
    }

    if (!isLocalhost && backendUrl) {
      body.notification_url = `${backendUrl}/api/payment/webhook`
    }

    console.log('=== MP PREFERENCE BODY ===', JSON.stringify(body, null, 2))

    const result = await preference.create({ body })

    order.mp_preference_id = result.id ?? undefined
    await em.flush()

    res.status(201).json({
      message: 'Preferencia de pago creada',
      preference_id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    })
  } catch (error: any) {
    console.error('=== MP ERROR ===', error?.message)
    next(error)
  }
}

// POST /api/payment/webhook
async function handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, data } = req.body

    console.log('[Webhook] Recibido evento type:', type, 'data:', data)

    if (type !== 'payment' || !data?.id) {
      console.log('[Webhook] Evento ignorado: no es de pago o sin ID')
      res.sendStatus(200)
      return
    }

    const paymentApi = new Payment(client)
    const paymentInfo = await paymentApi.get({ id: String(data.id) })

    const externalRef = paymentInfo.external_reference
    const paymentStatus = paymentInfo.status

    console.log('[Webhook] Payment ID:', data.id, 'External Ref:', externalRef, 'Status:', paymentStatus)

    if (!externalRef) {
      console.log('[Webhook] Sin external_reference, ignorando')
      res.sendStatus(200)
      return
    }

    const em = orm.em.fork()
    const order = await em.findOne(Order, { id: Number(externalRef) })

    if (!order) {
      console.log('[Webhook] Orden no encontrada para ID:', externalRef)
      res.sendStatus(200)
      return
    }

    console.log('[Webhook] Orden encontrada ID:', order.id, 'Estado actual:', order.estado)

    order.mp_payment_id = String(data.id)

    const previousStatus = order.estado
    if (paymentStatus === 'approved') {
      order.estado = 'Pagado'
    } else if (paymentStatus === 'rejected') {
      order.estado = 'Rechazado'
    } else if (paymentStatus === 'pending' || paymentStatus === 'in_process') {
      order.estado = 'Pago Pendiente'
    }

    if (previousStatus !== order.estado) {
      console.log('[Webhook] Estado actualizado:', previousStatus, '→', order.estado)
    }

    await em.flush()
    console.log('[Webhook] Orden guardada exitosamente')
    res.sendStatus(200)
  } catch (error: any) {
    console.error('[Webhook] Error:', error?.message, error?.stack)
    // Siempre responder 200 para que MP no reintente
    res.sendStatus(200)
  }
}

// POST /api/payment/verify-payment
// Acepta order_id (busca por external_reference en MP) o payment_id directo
async function verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { order_id, payment_id } = req.body

    if (!order_id && !payment_id) {
      res.status(400).json({ message: 'Se requiere order_id o payment_id' })
      return
    }

    const paymentApi = new Payment(client)
    let paymentStatus: string | null | undefined = null
    let resolvedPaymentId: string | null = null
    let resolvedOrderId: string = String(order_id || '')

    if (payment_id) {
      // Caso 1: Tenemos el payment_id directamente
      console.log(`[verifyPayment] Usando payment_id: ${payment_id}`)
      try {
        const paymentInfo = await paymentApi.get({ id: String(payment_id) })
        paymentStatus = paymentInfo.status
        resolvedPaymentId = String(payment_id)
        if (paymentInfo.external_reference) {
          resolvedOrderId = paymentInfo.external_reference
        }
      } catch (err) {
        console.error('[verifyPayment] Error al obtener payment_id:', err)
      }
    }

    // Si aún no tenemos el estado, buscar por external_reference
    if (!paymentStatus) {
      // Caso 2: Solo tenemos el orderId — buscar en MP por external_reference
      console.log(`[verifyPayment] Buscando por external_reference: ${order_id}`)
      try {
        const searchResult = await paymentApi.search({
          options: {
            external_reference: String(order_id),
            sort: 'date_created',
            criteria: 'desc',
            limit: 10, // Aumentado a 10 para mayor cobertura
          }
        })

        const payments = (searchResult as any)?.results || []
        console.log(`[verifyPayment] Pagos encontrados para orden ${order_id}:`, payments.length)

        if (payments.length > 0) {
          // Buscar el pago más reciente con estado aprobado o el más reciente
          const approvedPayment = payments.find((p: any) => p.status === 'approved')
          const latestPayment = approvedPayment || payments[0]
          
          paymentStatus = latestPayment.status
          resolvedPaymentId = String(latestPayment.id)
          console.log(`[verifyPayment] Pago encontrado - ID: ${resolvedPaymentId}, Estado: ${paymentStatus}`)
        } else {
          console.warn(`[verifyPayment] No se encontraron pagos para la orden ${order_id}`)
        }
      } catch (err) {
        console.error('[verifyPayment] Error al buscar pagos:', err)
      }
    }

    console.log(`[verifyPayment] Final - Estado: ${paymentStatus} | orderId: ${resolvedOrderId}`)

    const em = orm.em.fork()
    const order = await em.findOne(Order, { id: Number(resolvedOrderId) })

    if (!order) {
      res.status(404).json({ message: `Orden ${resolvedOrderId} no encontrada` })
      return
    }

    // Guardar el payment ID si lo tenemos
    if (resolvedPaymentId) {
      order.mp_payment_id = resolvedPaymentId
    }

    // Actualizar estado según el estado del pago
    const previousStatus = order.estado
    if (paymentStatus === 'approved') {
      order.estado = 'Pagado'
    } else if (paymentStatus === 'rejected') {
      order.estado = 'Rechazado'
    } else if (paymentStatus === 'pending' || paymentStatus === 'in_process') {
      order.estado = 'Pago Pendiente'
    } else if (!paymentStatus) {
      // Si no encontramos el pago pero tenemos un payment_id, asumir que está pendiente
      if (resolvedPaymentId) {
        order.estado = 'Pago Pendiente'
      }
    }

    if (previousStatus !== order.estado) {
      console.log(`[verifyPayment] Estado actualizado: ${previousStatus} → ${order.estado}`)
    }

    await em.flush()

    res.status(200).json({
      message: 'Estado de orden verificado y actualizado',
      orderId: order.id,
      paymentId: resolvedPaymentId,
      paymentStatus,
      orderStatus: order.estado,
      previousStatus
    })
  } catch (error: any) {
    console.error('=== VERIFY PAYMENT ERROR ===', error?.message, error?.stack)
    next(error)
  }
}

// POST /api/payment/mark-as-paid/:orderId
// Endpoint simple para marcar una orden como pagada cuando el usuario llega a success
async function markOrderAsPaid(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const orderId = Number(req.params.orderId)

    if (!orderId || isNaN(orderId)) {
      res.status(400).json({ message: 'orderId inválido' })
      return
    }

    console.log(`[markOrderAsPaid] Marcando orden ${orderId} como pagada`)

    const em = orm.em.fork()
    const order = await em.findOne(Order, { id: orderId })

    if (!order) {
      console.log(`[markOrderAsPaid] Orden ${orderId} no encontrada`)
      res.status(404).json({ message: `Orden ${orderId} no encontrada` })
      return
    }

    const previousStatus = order.estado
    order.estado = 'Pagado'

    await em.flush()

    console.log(`[markOrderAsPaid] Estado actualizado: ${previousStatus} → Pagado`)

    res.status(200).json({
      message: 'Orden marcada como pagada',
      orderId: order.id,
      status: order.estado,
      previousStatus
    })
  } catch (error: any) {
    console.error('[markOrderAsPaid] Error:', error?.message)
    next(error)
  }
}

export { createPreference, handleWebhook, verifyPayment, markOrderAsPaid }
