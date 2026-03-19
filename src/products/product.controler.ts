import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { Product } from './product.entity.js'
import { Price } from './price.entity.js'
import { Brand } from '../brands/brand.entity.js'
import { validateProduct, validateProductPatch } from './productSchema.js'

const em = orm.em

function sanitizeProductInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    description: req.body.description,
    waist: req.body.waist,
    calification: req.body.calification,
    imagen: req.body.imagen,
    stock: req.body.stock,
    isOffer: req.body.isOffer,
    isContinued: req.body.isContinued,
    prices: req.body.prices,
    brand: req.body.brand,
    category: req.body.category,
    distributor: req.body.distributor,
    gender: req.body.gender
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const filters: any = {};
    if (req.query.name) {
      filters.name = { $like: `%${req.query.name}%` };
    }
    if (req.query.category) {
      filters.category = parseInt(req.query.category as string);
    }
    if (req.query.brand) {
      filters.brand = parseInt(req.query.brand as string);
    }
    if (req.query.isOffer !== undefined) {
      filters.isOffer = req.query.isOffer === 'true';
    }

    const products = await em.find(Product, filters, {
      populate: ['prices', 'brand', 'category']
    });
    res.status(200).json({ message: 'found all Products', data: products })
  } catch (error: any) {
    next(error)
  }
}

async function findOne(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number.parseInt(req.params.id)
    const product = await em.findOneOrFail(Product, { id }, { populate: ['prices'] })
    res.status(200).json({ message: 'found Product', data: product })
  } catch (error: any) {
    next(error)
  }
}

async function add(req: Request, res: Response, next: NextFunction) {
  try {
    const result = validateProduct(req.body)
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }
    const product = em.create(Product, req.body.sanitizedInput)
    if (req.body.price) {
      const price = em.create(Price, {
        ...req.body.price,
        product,
      });
      await em.persistAndFlush(price);
    }
    await em.persistAndFlush(product)
    res.status(201).json({ message: 'Product created', data: product })
  } catch (error: any) {
    next(error)
  }
}

async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number.parseInt(req.params.id)
    const product = await em.findOneOrFail(Product, { id }, { populate: ['prices'] })
    let productUpdate
    if (req.method === 'PATCH') {
      productUpdate = validateProductPatch(req.body.sanitizedInput)
      if (!productUpdate.success) {
        return res.status(400).json({ error: JSON.parse(productUpdate.error.message) })
      }
    } else {
      productUpdate = validateProduct(req.body.sanitizedInput)
      if (!productUpdate.success) {
        return res.status(400).json({ error: JSON.parse(productUpdate.error.message) })
      }
    }
    em.assign(product, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'product updated', data: product })
  } catch (error: any) {
    next(error)
  }
}

async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number.parseInt(req.params.id)
    const product = em.getReference(Product, id)
    await em.removeAndFlush(product)
    res.status(200).json({ message: 'product deleted' })
  } catch (error: any) {
    next(error)
  }
}

async function addProductToBrand(req: Request, res: Response, next: NextFunction) {
  try {
    const idBrand = Number.parseInt(req.params.idBrand)
    const brand = em.getReference(Brand, idBrand)
    let newProduct = await em.create(Product, req.body)
    newProduct.brand = brand
    await em.flush()
    res.status(200).json({ message: 'Brand asignated to product' })
  } catch (error: any) {
    next(error)
  }
}

async function toggleOffer(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number.parseInt(req.params.id);
    const product = await em.findOneOrFail(Product, { id });
    product.isOffer = req.body.isOffer;
    await em.flush();
    res.status(200).json({ message: 'Estado de oferta actualizado', data: product });
  } catch (error: any) {
    next(error)
  }
}

export const productControler = { sanitizeProductInput, findAll, findOne, add, update, remove, addProductToBrand, toggleOffer }