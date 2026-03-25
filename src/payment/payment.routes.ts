import { Router } from 'express'
import { createPreference, handleWebhook, verifyPayment, markOrderAsPaid } from './payment.controller.js'
import { authMiddleware } from '../shared/auth.middleware.js'

export const paymentRouter = Router()

// Crear preferencia de pago — requiere autenticación
paymentRouter.post('/create-preference', authMiddleware, createPreference)

// Webhook de Mercado Pago — público (MP lo llama directamente)
paymentRouter.post('/webhook', handleWebhook)

// Verificar pago manualmente (para desarrollo sin webhook público)
paymentRouter.post('/verify-payment', verifyPayment)

// Marcar orden como pagada cuando el usuario llega a success page
paymentRouter.post('/mark-as-paid/:orderId', markOrderAsPaid)

