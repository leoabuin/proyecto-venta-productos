import { Request, Response, NextFunction } from 'express'
//import { CategoryRepository } from './category.Repository.js'
import { Category } from './category.entify.js'

//const repository = new CategoryRepository()
/*
function sanitizeCategoryInput(req: Request, res: Response, next: NextFunction) {
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
  const category = repository.findOne({ id })
  if (!category) {
    return res.status(404).send({ message: 'Category not found' })
  }
  res.json({ data: category})
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput

  const categoryInput = new Category(
    input.name,
    input.description,
  )

  const category = repository.add(categoryInput)
  return res.status(201).send({ message: 'category created', data: category })
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id
  const category = repository.update(req.body.sanitizedInput)

  if (!category) {
    return res.status(404).send({ message: 'Category not found' })
  }

  return res.status(200).send({ message: 'Category updated successfully', data: category })
}

function remove(req: Request, res: Response) {
  const id = req.params.id
  const category = repository.delete({ id })

  if (!category) {
    res.status(404).send({ message: 'category not found' })
  } else {
    res.status(200).send({ message: 'Category deleted successfully' })
  }
}

export { sanitizeCategoryInput, findAll, findOne, add, update, remove }
*/