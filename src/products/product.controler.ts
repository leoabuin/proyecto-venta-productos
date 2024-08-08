import { Request, Response, NextFunction } from 'express'

import { Product } from './product.entity.js'

//const repository = new ProductRepository()

function sanitizeProductInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    description: req.body.description,
    waist: req.body.weist,
    calification: req.body.calification,
    imagen: req.body.imagen,
    stock: req.body.stock,
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
  return res.status(500).send({ message: 'aaaaa'})
}

async function findOne(req: Request, res: Response) {
  return res.status(500).send({ message: 'lllllll'})
}

async function add(req: Request, res: Response) {
  return res.status(500).send({ message: 'Not implementeddfsd'})
}

async function update(req: Request, res: Response) {
  return res.status(500).send({ message: 'Not implementeddfsd'})
}

async function remove(req: Request, res: Response) {
  return res.status(500).send({ message: 'aaaaaabbbbb'})
}

export { sanitizeProductInput, findAll, findOne, add, update, remove }