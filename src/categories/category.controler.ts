import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { Category } from './category.entity.js'
import { validateCategory } from './categorySchema.js'

const em = orm.em

function sanitizeCategoryInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    description: req.body.description,
    products: req.body.products,
  }
  next()
}

async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await em.find(Category, {}, { populate: ['products'] })
    res.status(200).json({ message: 'found all categories', data: categories })
  } catch (error: any) {
    next(error)
  }
}

async function findOne(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number.parseInt(req.params.id)
    const category = await em.findOneOrFail(Category, { id }, { populate: ['products'] })
    res.status(200).json({ message: 'found Category', data: category })
  } catch (error: any) {
    next(error)
  }
}

async function add(req: Request, res: Response, next: NextFunction) {
  try {
    const result = validateCategory(req.body)
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const category = em.create(Category, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'Category created', data: category })
  } catch (error: any) {
    next(error)
  }
}

async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number.parseInt(req.params.id)
    const category = await em.findOneOrFail(Category, { id })
    let categoryUpdate = validateCategory(req.body)
    if (!categoryUpdate.success) {
      return res.status(400).json({ error: JSON.parse(categoryUpdate.error.message) })
    }
    em.assign(category, {
      name: req.body.name,
      description: req.body.description,
    });
    await em.flush()
    res.status(200).json({ message: 'category updated', data: category })
  } catch (error: any) {
    next(error)
  }
}

async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number.parseInt(req.params.id)
    const category = em.getReference(Category, id)
    await em.removeAndFlush(category)
    res.status(200).json({ message: 'category deleted' })
  } catch (error: any) {
    next(error)
  }
}

export { sanitizeCategoryInput, findAll, findOne, add, update, remove }