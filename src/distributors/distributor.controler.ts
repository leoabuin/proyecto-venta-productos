import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/orm.js";
import { Distributor } from "./distributor.entity.js";
import { validateDistributor, validateDistributorPatch } from "./distributorSchema.js";

const em = orm.em

function sanitizeDistributorInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    CUIL: req.body.CUIL,
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    products: req.body.products
  }
  next()
}

async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const distributors = await em.find(Distributor, {}, { populate: ['products'] })
    res.status(200).json({ message: 'found all Distributors', data: distributors })
  } catch (error: any) {
    next(error)
  }
}

async function findOne(req: Request, res: Response, next: NextFunction) {
  try {
    const CUIL = Number.parseInt(req.params.CUIL)
    const distributor = await em.findOneOrFail(Distributor, { CUIL }, { populate: ['products'] })
    res.status(200).json({ message: 'found Distributor', data: distributor })
  } catch (error: any) {
    next(error)
  }
}

async function add(req: Request, res: Response, next: NextFunction) {
  try {
    const result = validateDistributor(req.body)
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const distributor = em.create(Distributor, req.body)
    await em.flush()
    res.status(201).json({ message: 'Distributor created', data: distributor })
  } catch (error: any) {
    next(error)
  }
}

async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const CUIL = Number.parseInt(req.params.CUIL)
    const distributor = await em.findOneOrFail(Distributor, { CUIL })
    let distributorUpdate
    if (req.method === 'PATCH') {
      distributorUpdate = validateDistributorPatch(req.body)
      if (!distributorUpdate.success) {
        return res.status(400).json({ error: JSON.parse(distributorUpdate.error.message) })
      }
    } else {
      distributorUpdate = validateDistributor(req.body)
      if (!distributorUpdate.success) {
        return res.status(400).json({ error: JSON.parse(distributorUpdate.error.message) })
      }
    }
    em.assign(distributor, req.body)
    await em.flush()
    res.status(200).json({ message: 'distributor updated', data: distributor })
  } catch (error: any) {
    next(error)
  }
}

async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const CUIL = Number.parseInt(req.params.CUIL)
    const distributor = await em.findOneOrFail(Distributor, { CUIL })
    await em.removeAndFlush(distributor)
    res.status(200).json({ message: 'distributor deleted' })
  } catch (error: any) {
    next(error)
  }
}

export { sanitizeDistributorInput, add, findOne, findAll, update, remove }