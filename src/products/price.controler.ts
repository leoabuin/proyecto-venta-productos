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
  return res.status(500).send({ message: 'Not implementedfdf'})
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
  return res.status(500).send({ message: 'Not implementedsdfsdf'})
}

async function remove(req: Request, res: Response) {
  return res.status(500).send({ message: 'Not implementeddfsdf'})
}

export { findAll,findOne ,add, update, remove }