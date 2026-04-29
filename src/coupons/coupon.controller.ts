import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { Coupon } from './coupon.entity.js'

const em = orm.em

function sanitizeCouponInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedCouponInput = {
    code: req.body.code?.toString().trim().toUpperCase(),
    discountPercentage: req.body.discountPercentage !== undefined ? Number(req.body.discountPercentage) : undefined,
    expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : undefined,
  }
  Object.keys(req.body.sanitizedCouponInput).forEach((key) => {
    if ((req.body.sanitizedCouponInput as any)[key] === undefined) {
      delete (req.body.sanitizedCouponInput as any)[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const coupons = await em.fork().find(Coupon, {})
    res.status(200).json({ message: 'Cupones encontrados', data: coupons })
  } catch (error: any) {
    next(error)
  }
}

async function findByCode(req: Request, res: Response, next: NextFunction) {
  try {
    const code = req.params.code.trim().toUpperCase()
    const coupon = await em.fork().findOne(Coupon, { code })
    if (!coupon) {
      res.status(404).json({ message: 'Cupón no encontrado' })
      return
    }
    res.status(200).json({ message: 'Cupón encontrado', data: coupon })
  } catch (error: any) {
    next(error)
  }
}

async function add(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, discountPercentage, expirationDate } = req.body.sanitizedCouponInput

    if (!code || discountPercentage === undefined || !expirationDate) {
      res.status(400).json({ message: 'Faltan campos requeridos: code, discountPercentage, expirationDate' })
      return
    }

    if (discountPercentage <= 0 || discountPercentage > 100) {
      res.status(400).json({ message: 'El porcentaje de descuento debe estar entre 1 y 100' })
      return
    }

    const forkedEm = em.fork()
    const existing = await forkedEm.findOne(Coupon, { code })
    if (existing) {
      res.status(409).json({ message: `Ya existe un cupón con el código "${code}"` })
      return
    }

    const coupon = forkedEm.create(Coupon, { code, discountPercentage, expirationDate })
    await forkedEm.flush()
    res.status(201).json({ message: 'Cupón creado exitosamente', data: coupon })
  } catch (error: any) {
    next(error)
  }
}

async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number.parseInt(req.params.id)
    const forkedEm = em.fork()
    const coupon = await forkedEm.findOne(Coupon, { id })
    if (!coupon) {
      res.status(404).json({ message: 'Cupón no encontrado' })
      return
    }

    const { code, discountPercentage, expirationDate } = req.body.sanitizedCouponInput

    if (code) coupon.code = code
    if (discountPercentage !== undefined) {
      if (discountPercentage <= 0 || discountPercentage > 100) {
        res.status(400).json({ message: 'El porcentaje de descuento debe estar entre 1 y 100' })
        return
      }
      coupon.discountPercentage = discountPercentage
    }
    if (expirationDate) coupon.expirationDate = expirationDate

    await forkedEm.flush()
    res.status(200).json({ message: 'Cupón actualizado exitosamente', data: coupon })
  } catch (error: any) {
    next(error)
  }
}

async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number.parseInt(req.params.id)
    const forkedEm = em.fork()
    const coupon = await forkedEm.findOne(Coupon, { id })
    if (!coupon) {
      res.status(404).json({ message: 'Cupón no encontrado' })
      return
    }
    await forkedEm.removeAndFlush(coupon)
    res.status(200).json({ message: 'Cupón eliminado exitosamente' })
  } catch (error: any) {
    next(error)
  }
}

export { sanitizeCouponInput, findAll, findByCode, add, update, remove }
