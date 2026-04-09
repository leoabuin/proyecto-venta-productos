import { Router } from 'express'
import { createPreference, handleWebhook, verifyPayment } from './payment.controller.js'
import { authMiddleware } from '../shared/auth.middleware.js'

export const paymentRouter = Router()

// Crear preferencia de pago (requiere login)
paymentRouter.post('/create-preference', authMiddleware, createPreference)

// Webhook de Mercado Pago (sin auth, MP llama directo)
paymentRouter.post('/webhook', handleWebhook)

// Verificar estado del pago (requiere login)
paymentRouter.post('/verify-payment', authMiddleware, verifyPayment)
