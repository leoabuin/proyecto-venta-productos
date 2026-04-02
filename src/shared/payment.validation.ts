import { z } from 'zod'

/**
 * Validación de items de pago para Mercado Pago
 */
const PaymentItemSchema = z.object({
  productId: z.number().positive('productId debe ser un número positivo'),
  id: z.string().optional(),
  title: z.string().min(1, 'title es requerido').max(256, 'title muy largo'),
  quantity: z.number().int().positive('quantity debe ser un número positivo'),
  unit_price: z.number().positive('unit_price debe ser un número positivo'),
})

/**
 * Validación de preferencia de pago
 */
export const CreatePaymentPreferenceSchema = z.object({
  orderId: z.number().int().positive('orderId debe ser un número positivo'),
  items: z.array(PaymentItemSchema)
    .min(1, 'Debe haber al menos un item')
    .max(25, 'Mercado Pago solo permite máximo 25 items'),
})

/**
 * Validación de verificación de pago
 */
export const VerifyPaymentSchema = z.object({
  order_id: z.number().optional(),
  payment_id: z.string().optional(),
}).refine(
  (data: any) => data.order_id || data.payment_id,
  { message: 'Se requiere order_id o payment_id' }
)

/**
 * Validar datos que llegan al crear una preferencia
 */
export function validateCreatePaymentPreferenceInput(data: unknown) {
  try {
    return CreatePaymentPreferenceSchema.parse(data)
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ')
      throw new Error(`Datos de pago inválidos: ${messages}`)
    }
    throw error
  }
}

/**
 * Validar datos de un item de pago individual
 */
export function validatePaymentItem(item: unknown) {
  try {
    return PaymentItemSchema.parse(item)
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ')
      throw new Error(`Item inválido: ${messages}`)
    }
    throw error
  }
}

/**
 * Validar datos de verificación de pago
 */
export function validateVerifyPaymentInput(data: unknown) {
  try {
    return VerifyPaymentSchema.parse(data)
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ')
      throw new Error(`Datos de verificación inválidos: ${messages}`)
    }
    throw error
  }
}

/**
 * Validar que los items tengan precios razonables
 */
export function validatePaymentAmounts(items: any[], maxPrice: number = 999999): boolean {
  for (const item of items) {
    if (item.unit_price <= 0) {
      throw new Error(`Precio inválido para ${item.title}: debe ser mayor a 0`)
    }
    if (item.unit_price > maxPrice) {
      throw new Error(`Precio muy alto para ${item.title}: supera el máximo permitido`)
    }
    const totalItem = item.unit_price * item.quantity
    if (totalItem > maxPrice * 10) {
      throw new Error(`Total de ${item.title} muy alto: supera el máximo permitido`)
    }
  }
  return true
}
