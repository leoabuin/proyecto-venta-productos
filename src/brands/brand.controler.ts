import { Request,Response,NextFunction} from "express";
import { orm } from "../shared/orm.js";
import { json } from "stream/consumers";
import { Brand } from "./brand.entity.js";
import { validateBrand, validateBrandPatch } from "./brandSchema.js";


const em = orm.em


function sanitizeBrandInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
      name: req.body.name,
      description: req.body.description,
      website: req.body.website,
      countryOfOrigin: req.body.countryOfOrigin,
      logo: req.body.logo,
      products: req.body.products
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
      const brands = await em.find(Brand,{},{populate:['products']})
      res.status(200).json({message:'found all Products',data:brands})
    } catch (error: any) {
      return res.status(500).json({message: error.message})
    }
  }
  
  async function findOne(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id)
      const brand = await em.findOneOrFail(Brand,{id},{populate:['products']})
      res.status(200).json({message:'found Brand',data:brand})
    } catch (error: any) {
      return res.status(500).json({message: error.message})
    }
  }
  
  async function add(req: Request, res: Response) {
    const result = validateBrand(req.body)
    if (!result.success){
      return res.status(400).json({ errors: result.error.errors });
    }
    const brand = em.create(Brand,req.body.sanitizedInput)
      await em.flush()
      res.status(201).json({message:'Brand created', data:brand})
  }
  
  async function update(req: Request, res: Response) {
    try{
      const id = Number.parseInt(req.params.id)
      const brand = await em.findOneOrFail(Brand, {id})
      let brandUpdate
      if (req.method === 'PATCH') {
        brandUpdate = validateBrandPatch(req.body)
        if(!brandUpdate.success){
          return res.status(400).json({ error: JSON.parse(brandUpdate.error.message) })
        }
      } else {
        brandUpdate = validateBrand(req.body)
        if(!brandUpdate.success){
          return res.status(400).json({ error: JSON.parse(brandUpdate.error.message) })
        }
      }
      em.assign(brand, req.body)
      await em.flush()
      res.status(200).json({message: 'brand updated',data:brand})
      console.log('updated')
     } catch(error: any){
        res.status(500).json({message: error.message})
      }
  }
  
  async function remove(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id)
      const brand = em.getReference(Brand, id)
      await em.removeAndFlush(brand)
      res.status(200).json({message: 'brand deleted'})
    } catch (error: any) {
      res.status(500).json({message: error.message})
    }
  }
  
  export { sanitizeBrandInput, findAll, findOne, add, update, remove }

