import { Request, Response, NextFunction } from 'express'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { orm } from '../shared/orm.js'
import { Order } from '../orders/order.entity.js'
import { 
  validateCreatePaymentPreferenceInput, 
  validatePaymentAmounts 
} from '../shared/payment.validation.js'

// Validar que las credenciales de Mercado Pago estén configuradas
if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error(
    'MP_ACCESS_TOKEN no está configurado en las variables de entorno. ' +
    'Asegúrate de agregar MP_ACCESS_TOKEN en el archivo .env'
  )
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
})

// POST /api/payment/create-preference
// POST /api/payment/create-preference
async function createPreference(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Validar datos de entrada
    const { orderId, items } = validateCreatePaymentPreferenceInput(req.body)
    
    // Validar montos
    validatePaymentAmounts(items)

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

    if (!result.id) {
      console.error('Error: Mercado Pago no retornó un ID de preferencia')
      res.status(500).json({ 
        message: 'Error al crear la preferencia de pago en Mercado Pago',
        details: 'No se pudo obtener el ID de la preferencia'
      })
      return
    }

    order.mp_preference_id = result.id
    await em.flush()

    res.status(201).json({
      message: 'Preferencia de pago creada',
      preference_id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    })
  } catch (error: any) {
    console.error('=== MP ERROR ===', error?.message, error?.stack)
    
    // Errores de validación
    if (error?.message?.includes('Datos de pago inválidos') || 
        error?.message?.includes('Item inválido') ||
        error?.message?.includes('inválido')) {
      res.status(400).json({
        message: 'Error en los datos de pago',
        details: error.message
      })
      return
    }
    
    // Errores específicos de Mercado Pago
    if (error?.message?.includes('authentication') || error?.message?.includes('access_token')) {
      console.error('❌ Error de autenticación con Mercado Pago')
      res.status(500).json({
        message: 'Error de autenticación con Mercado Pago',
        details: 'Verifica que MP_ACCESS_TOKEN esté correctamente configurado en .env'
      })
      return
    }

    if (error?.message?.includes('Invalid credentials')) {
      console.error('❌ Credenciales inválidas de Mercado Pago')
      res.status(500).json({
        message: 'Credenciales de Mercado Pago inválidas',
        details: 'Verifica que el token de acceso sea correcto'
      })
      return
    }

    next(error)
  }
}

// POST /api/payment/webhook
// Manejador del webhook de Mercado Pago
// Se ejecuta automáticamente cuando hay cambios en pagos (requiere URL pública)
async function handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, data } = req.body

    console.log('[Webhook] ============================================')
    console.log('[Webhook] Evento recibido de Mercado Pago')
    console.log('[Webhook] Tipo:', type)
    console.log('[Webhook] Data:', data)

    // Solo procesamos eventos de pago
    if (type !== 'payment' || !data?.id) {
      console.log('[Webhook] ❌ Evento ignorado: no es de pago o sin ID')
      console.log('[Webhook] ============================================')
      res.sendStatus(200)
      return
    }

    // Obtener detalles del pago de Mercado Pago
    const paymentApi = new Payment(client)
    const paymentInfo = await paymentApi.get({ id: String(data.id) })

    const externalRef = paymentInfo.external_reference
    const paymentStatus = paymentInfo.status
    const paymentId = String(data.id)

    console.log('[Webhook] Payment ID:', paymentId)
    console.log('[Webhook] Status:', paymentStatus)
    console.log('[Webhook] External Reference (Order ID):', externalRef)

    // Si no hay referencia externa, no podemos asociarlo a una orden
    if (!externalRef) {
      console.warn('[Webhook] ⚠️  Sin external_reference, no se puede asociar a orden')
      console.log('[Webhook] ============================================')
      res.sendStatus(200)
      return
    }

    // Buscar la orden en BD
    const em = orm.em.fork()
    const order = await em.findOne(Order, { id: Number(externalRef) })

    if (!order) {
      console.warn('[Webhook] ⚠️  Orden no encontrada para ID:', externalRef)
      console.log('[Webhook] ============================================')
      res.sendStatus(200)
      return
    }

    const previousStatus = order.estado
    console.log('[Webhook] Orden encontrada - Estado actual:', previousStatus)

    // Guardar el ID de pago de Mercado Pago
    order.mp_payment_id = paymentId

    // Actualizar estado de la orden según el estado del pago
    if (paymentStatus === 'approved') {
      order.estado = 'Pagado'
      console.log('[Webhook] ✅ Pago APROBADO → Estado = "Pagado"')
    } else if (paymentStatus === 'rejected') {
      order.estado = 'Rechazado'
      console.log('[Webhook] ❌ Pago RECHAZADO → Estado = "Rechazado"')
    } else if (paymentStatus === 'pending' || paymentStatus === 'in_process') {
      order.estado = 'Pago Pendiente'
      console.log('[Webhook] ⏳ Pago PENDIENTE → Estado = "Pago Pendiente"')
    } else {
      console.warn('[Webhook] ⚠️  Estado desconocido:', paymentStatus)
    }

    // Guardar cambios en BD
    if (previousStatus !== order.estado) {
      console.log('[Webhook] 📊 Transición de estado:', previousStatus, '→', order.estado)
      await em.flush()
      console.log('[Webhook] ✅ Orden actualizada en base de datos')
    } else {
      console.log('[Webhook] ℹ️  Estado no cambió, sin actualización necesaria')
    }

    console.log('[Webhook] ============================================')
    res.sendStatus(200)
  } catch (error: any) {
    console.error('[Webhook] ❌ ERROR:', error?.message)
    console.error('[Webhook] Stack:', error?.stack)
    // Siempre responder 200 para que Mercado Pago no reintente
    // Los reintentos infinitos pueden causar problemas
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
      console.log(`[verifyPayment] ✅ Estado actualizado: ${previousStatus} → ${order.estado}`)
      await em.flush()
      console.log(`[verifyPayment] 💾 Cambios guardados en BD`)
    } else {
      console.log(`[verifyPayment] ℹ️  Estado sin cambios: ${order.estado}`)
    }

    console.log(`[verifyPayment] 📤 Respondiendo con:`, {
      orderStatus: order.estado,
      paymentStatus,
      paymentId: resolvedPaymentId,
      orderId: order.id
    })

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
