import { Request,Response,NextFunction} from "express";
import { orm } from "../shared/orm.js";
import { json } from "stream/consumers";
import { Distributor } from "./distributor.entity.js";


const em = orm.em

function sanitizeDistributorInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    CUIL: req.body.CUIL,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    mail: req.body.mail,
    telephone: req.body.telephone,
    adress: req.body.adress,
    products: req.body.products
  }

    Object.keys(req.body.sanitizedInput).forEach((key) => {
      if (req.body.sanitizedInput[key] === undefined) {
        delete req.body.sanitizedInput[key]
      }
    })
    next()
  }

  async function findAll(req: Request, res: Response) {
    try {
      const distributors = await em.find(Distributor,{},{populate:['products']})
      res.status(200).json({message:'found all Products',data:distributors})
    } catch (error: any) {
      return res.status(500).json({message: error.message})
    }
  }

  async function findOne(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id)
      const distributor = await em.findOneOrFail( Distributor, {id},{ populate: ['products'] })
      res.status(200).json({ message: 'distributor', data: distributor })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }
  
  async function add(req: Request, res: Response) {
    try {
      const distributor = em.create(Distributor, req.body.sanitizedInput)
      await em.flush()
      res.status(201).json({ message: 'distributor created', data: distributor })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }
  
  async function update(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id)
      const distributorUpdate = await em.findOneOrFail(Distributor, { id })
      em.assign(distributorUpdate, req.body.sanitizedInput)
      await em.flush()
      res
        .status(200)
        .json({ message: 'Distributor Updated', data: distributorUpdate })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }

  async function remove(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id)
      const distributor= em.getReference(Distributor, id)
      await em.removeAndFlush(distributor)
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }
  export { sanitizeDistributorInput, findAll, findOne, add, update, remove }

