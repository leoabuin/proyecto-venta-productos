import { Router } from 'express'
import { sanitizeCouponInput, findAll, findByCode, add, update, remove } from './coupon.controller.js'
import { authMiddleware, staffOnly } from '../shared/auth.middleware.js'

export const couponRouter = Router()

// Listar todos los cupones — solo staff (Empleado/admin)
couponRouter.get('/', authMiddleware, staffOnly, findAll)

// Validar cupón por código — cualquier usuario autenticado
couponRouter.get('/validate/:code', authMiddleware, findByCode)

// Crear cupón — solo staff
couponRouter.post('/', authMiddleware, staffOnly, sanitizeCouponInput, add)

// Actualizar cupón — solo staff
couponRouter.put('/:id', authMiddleware, staffOnly, sanitizeCouponInput, update)

// Eliminar cupón — solo staff
couponRouter.delete('/:id', authMiddleware, staffOnly, remove)
