import { z } from 'zod'

/**
 * Esquema de validación para las variables de entorno
 * Asegura que todas las variables necesarias estén configuradas correctamente
 */
const envSchema = z.object({
  // Servidor
  PORT: z.string().regex(/^\d+$/, 'PORT debe ser un número').transform(Number).default('3000').optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development').optional(),
  BACKEND_URL: z.string().url('BACKEND_URL debe ser una URL válida').optional(),
  FRONTEND_URL: z.string().url('FRONTEND_URL debe ser una URL válida').optional(),

  // Base de datos
  MYSQLHOST: z.string().min(1, 'MYSQLHOST es requerido'),
  MYSQLPORT: z.string().regex(/^\d+$/, 'MYSQLPORT debe ser un número').transform(Number).default('3306').optional(),
  MYSQLUSER: z.string().min(1, 'MYSQLUSER es requerido'),
  MYSQLPASSWORD: z.string().min(1, 'MYSQLPASSWORD es requerido'),
  MYSQLDATABASE: z.string().min(1, 'MYSQLDATABASE es requerido'),

  // JWT
  JWT_SECRET: z.string().min(8, 'JWT_SECRET debe tener al menos 8 caracteres'),

  // Mercado Pago (Requerido para pagos)
  MP_ACCESS_TOKEN: z.string().min(1, 'MP_ACCESS_TOKEN es requerido para Mercado Pago'),
  MP_PUBLIC_KEY: z.string().min(1, 'MP_PUBLIC_KEY es requerido para Mercado Pago'),
  MP_WEBHOOK_SECRET: z.string().optional(),
}).passthrough()

export type Env = z.infer<typeof envSchema>

/**
 * Valida las variables de entorno al iniciar la aplicación
 * @throws Error si falta alguna variable de entorno requerida
 */
export function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env as Record<string, unknown>)
    console.log('✅ Variables de entorno validadas correctamente')
    return parsed as Env
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.error('❌ Error en validación de variables de entorno:')
      error.errors.forEach((err: any) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
      throw new Error('Configuración de entorno inválida. Revisa el archivo .env')
    }
    throw error
  }
}

/**
 * Valida configuración específica de Mercado Pago
 * @throws Error si las credenciales de MP no son válidas
 */
export function validateMercadoPago(env: Env): boolean {
  const accessTokenPattern = /^APP_USR-/
  const publicKeyPattern = /^APP_USR-/

  if (!accessTokenPattern.test(env.MP_ACCESS_TOKEN)) {
    throw new Error('MP_ACCESS_TOKEN debe comenzar con "APP_USR-". Verifica tus credenciales de Mercado Pago.')
  }

  if (!publicKeyPattern.test(env.MP_PUBLIC_KEY)) {
    throw new Error('MP_PUBLIC_KEY debe comenzar con "APP_USR-". Verifica tus credenciales de Mercado Pago.')
  }

  if (env.NODE_ENV === 'production') {
    console.warn('⚠️  MERCADO PAGO: Asegúrate de usar credenciales de PRODUCCIÓN en environment=production')
  } else {
    console.log('ℹ️  MERCADO PAGO: Usando credenciales de SANDBOX (development)')
  }

  return true
}
