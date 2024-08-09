import { Request, Response } from 'express'
import { orm } from '../shared/orm.js'
import { Price } from './price.entity.js'
import { error } from 'console'



const em = orm.em






async function findAll(req: Request, res: Response) {
  try{
    const prices = await em.find(Price, {})
    res.status(200).json({message:'finded all prices',data: prices})
  }catch(error: any){
    res.status(500).json({message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
  try{
    const id = Number.parseInt(req.params.id)
    const price = await em.findOneOrFail(Price, {id})
    res.status(200).json({message:'price founded',data: price})
  }
  catch(error: any){
    res.status(500).json({message: error.message})
  }
}

async function add(req: Request, res: Response) {
    try{
        const price = em.create(Price, req.body)
        await em.flush()
        res.status(201).json({message: 'price created', data: price})
    } catch(error: any){
        res.status(500).json({message: error.message})
    }
}
async function update(req: Request, res: Response) {
  try{
    const id = Number.parseInt(req.params.id)
    const price = em.getReference(Price, id)
    em.assign(price, req.body)
    await em.flush()
    res.status(200).json({message: 'price updated'})
   } catch(error: any){
      res.status(500).json({message: error.message})
    }

}

async function remove(req: Request, res: Response) {
  try{
    const id = Number.parseInt(req.params.id)
    const price = em.getReference(Price, id)
    await em.removeAndFlush(price)
    res.status(200).json({message: 'price deleted'})
  } catch(error: any){
    res.status(500).json({message: error.message})
  }
}

export { findAll,findOne ,add, update, remove }