/*
import { Request, Response, NextFunction } from 'express'
import { DistributorRepository } from "./distributor.Repository.js";
import { Distributor } from './distributor.entify.js';





const repository = new DistributorRepository()


function sanitizeDistributorInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
      CUIL: req.body.CUIL,
      mail: req.body.mail,
      tel: req.body.tel,
      adress: req.body.adress
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
  // COMO PUEDO PONER EN LA INTERFAZ QUE TAMBIEN EL FINDONE TAMBIEN ADMITA CUIL
  function findOne(req: Request, res: Response) {
    const id = req.params.CUIL
    const distributor = repository.findOne({ id })
    if (!distributor) {
      return res.status(404).send({ message: 'Distributor not found' })
    }
    res.json({ data: distributor})
  }
  
  function add(req: Request, res: Response) {
    const input = req.body.sanitizedInput
  
    const distributorInput = new Distributor(
      input.CUIL,
      input.mail,
      input.tel,
      input.adress
    )
  
    const distributor = repository.add(distributorInput)
    return res.status(201).send({ message: 'distributor created', data: distributor })
  }
  
  function update(req: Request, res: Response) {
    req.body.sanitizedInput.CUIL = req.params.CUIL
    const distributor = repository.update(req.body.sanitizedInput)
  
    if (!distributor) {
      return res.status(404).send({ message: 'Distributor not found' })
    }
  
    return res.status(200).send({ message: 'Product updated successfully', data: distributor })
  }
  
  function remove(req: Request, res: Response) {
    const id = req.params.CUIL
    const distributor = repository.delete({ id })
  
    if (!distributor) {
      res.status(404).send({ message: 'Distributor not found' })
    } else {
      res.status(200).send({ message: 'Distributor deleted successfully' })
    }
  }
  
  export { sanitizeDistributorInput, findAll, findOne, add, update, remove }
  */