import { Request,Response,NextFunction } from 'express'
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
  //more checks here
  /*
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  */
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
  const result = validateCategory(req.body)
  if (!result.success){
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const category = em.create(Category,req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message:'Category created', data:category})
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const category = await em.findOneOrFail(Category,{id})
    let categoryUpdate = validateCategory(req.body)
    em.assign(category, req.body)
    await em.flush()
    res.status(200).json({message: 'category updated',data:category})
    console.log('updated')

  } catch (error:any) {
    res.status(500).json({message: error.message})
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const category = em.getReference(Category, id)
    await em.removeAndFlush(category)
    res.status(200).json({message: 'category deleted'})
  } catch (error: any) {
    res.status(500).json({message: error.message})
  }
}



export { sanitizeCategoryInput, findAll, findOne, add, update, remove}