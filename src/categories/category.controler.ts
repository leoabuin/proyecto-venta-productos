import { Request,Response,NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { Category } from './category.entity.js'


const em = orm.em

function sanitizeCategoryInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    description: req.body.description,
    products: req.body.products,
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
    const categories = await em.find(Category,{},{populate:['products']})
    res.status(200).json({message:'found all categories',data:categories})
  } catch (error: any) {
    return res.status(500).json({message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const category = await em.findOneOrFail(Category,{id},{populate:['products']})
    res.status(200).json({message:'found Category',data:category})
  } catch (error: any) {
    return res.status(500).json({message: error.message})
  }
}

async function add(req: Request, res: Response) {
  try {
    const category = em.create(Category,req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message:'Category created', data:category})
  } catch (error:any) {
      res.status(500).json({message: error.message})
  }
}

function update(req: Request, res: Response) {
  return res.status(401).send({ message: 'function not omplemented' })
}

function remove(req: Request, res: Response) {
  return res.status(401).send({ message: 'function not omplemented' })
}



export { sanitizeCategoryInput, findAll, findOne, add, update, remove}