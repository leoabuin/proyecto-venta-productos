import { Request, Response, NextFunction } from 'express'
import { BrandRepository } from './brand.Repository.js'
import { Brand } from './brand.entify.js'

const repository = new BrandRepository()

function sanitizeBrandInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    description: req.body.description,
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

function findAll(req: Request, res: Response) {
  res.json({ data: repository.findAll() })
}

function findOne(req: Request, res: Response) {
  const id = req.params.id
  const brand = repository.findOne({ id })
  if (!brand) {
    return res.status(404).send({ message: 'Brand not found' })
  }
  res.json({ data: brand})
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput

  const brandInput = new Brand(
    input.name,
    input.description
  )

  const brand = repository.add(brandInput)
  return res.status(201).send({ message: 'brand created', data: brand })
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id
  const brand = repository.update(req.body.sanitizedInput)

  if (!brand) {
    return res.status(404).send({ message: 'Brand not found' })
  }

  return res.status(200).send({ message: 'Brand updated successfully', data: brand })
}

function remove(req: Request, res: Response) {
  const id = req.params.id
  const brand = repository.delete({ id })

  if (!brand) {
    res.status(404).send({ message: 'Brand not found' })
  } else {
    res.status(200).send({ message: 'Brand deleted successfully' })
  }
}

export { sanitizeBrandInput, findAll, findOne, add, update, remove }