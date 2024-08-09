import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { Product } from './product.entity.js'
import { Price } from './price.entity.js'
import { json } from 'stream/consumers'



const em = orm.em

function sanitizeProductInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    description: req.body.description,
    waist: req.body.waist,
    calification: req.body.calification,
    imagen: req.body.imagen,
    stock: req.body.stock,
    prices: req.body.prices
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const products = await em.find(Product,{},{populate:['prices']})
    res.status(200).json({message:'found all Products',data:products})
  } catch (error: any) {
    return res.status(500).json({message: error.message})
  }
  }

async function findOne(req: Request, res: Response) {
  return res.status(500).send({ message: 'lllllll'})
}

async function add(req: Request, res: Response) {
  try {
    const product = em.create(Product,req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message:'Product created', data:product})
  } catch (error:any) {
      res.status(500).json({message: error.message})
  }
}

async function update(req: Request, res: Response) {
  return res.status(500).send({ message: 'Not implementeddfsd'})
}

async function remove(req: Request, res: Response) {
  return res.status(500).send({ message: 'aaaaaabbbbb'})
}

export { sanitizeProductInput, findAll, findOne, add, update, remove }