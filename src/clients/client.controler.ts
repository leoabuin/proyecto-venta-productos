import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { Client } from './client.entity.js'



const em = orm.em

function sanitizeClientInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    surname: req.body.surname,
    dni: req.body.dni,
    mail: req.body.mail,
    phoneNumber: req.body.phoneNumber,
    userName: req.body.userName,
    password: req.body.password,
    orders: req.body.orders
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
    const clients = await em.find(Client,{}, {populate:['orders']})
    res.status(200).json({message:'found all Clients',data:clients})
  } catch (error: any) {
    return res.status(500).json({message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const client = await em.findOneOrFail(Client,{id},{populate:['orders']})
    res.status(200).json({message:'found Client',data:client})
  } catch (error: any) {
    return res.status(500).json({message: error.message})
  }
}

async function add(req: Request, res: Response) {
  try {
    const client = em.create(Client,req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message:'Client created', data:client})
  } catch (error:any) {
      res.status(500).json({message: error.message})
  }
}

async function update(req: Request, res: Response) {
  try{
    const id = Number.parseInt(req.params.id)
    const client = em.getReference(Client, id)
    em.assign(client, req.body)
    await em.flush()
    res.status(200).json({message: 'client updated',data:client})
    console.log('updated')
   } catch(error: any){
      res.status(500).json({message: error.message})
    }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const client = em.getReference(Client, id)
    await em.removeAndFlush(client)
    res.status(200).json({message: 'client deleted'})
  } catch (error: any) {
    res.status(500).json({message: error.message})
  }
}

export { sanitizeClientInput, findAll, findOne, add, update, remove }
