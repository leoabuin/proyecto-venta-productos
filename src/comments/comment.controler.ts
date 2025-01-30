import { Request,Response,NextFunction } from "express";
import { orm } from '../shared/orm.js'
import { Comment } from './comment.entity.js'
import { Product } from "../products/product.entity.js";
import { User } from "../users/user.entity.js";
import axios from "axios";




const em = orm.em

function sanitizeCommentInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedCommentInput = {
    comment: req.body.comment,
    date: req.body.date,
    idProduct: req.body.idProduct,
    idUser: req.body.idUser
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
    const comments = await em.find(Comment,{},{populate:['user','product']})
    res.status(200).json({message:'found all comments',data:comments})
  } catch (error: any) {
    return res.status(500).json({message: error.message})
  }
}

async function findCommentsByProduct(req: Request, res: Response) {
    const productId = Number.parseInt(req.params.idProduct)
    
    if (isNaN(productId)) {
        return res.status(400).json({message:'invalid product id'})
    }
    
    try {
        const comments = await em.find(Comment,{product:productId},{populate:['user','product']})
        res.status(200).json({message:'found all comments for product',data:comments})
    } catch (error: any) {
        return res.status(500).json({message: error.message})
    }
}

async function add(req: Request, res: Response) {
    try {
        const idProduct = Number(req.body.productId);
        if (!idProduct) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const idUser = Number(req.body.userId);
        if (isNaN(idUser)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Buscar el producto y el usuario
        const product = await em.findOneOrFail(Product, { id: idProduct });
        const user = await em.findOneOrFail(User, { id: idUser });

        const comment = em.create(Comment, {
            ... req.body.sanitizedCommentInput,
            user,
            product
        })
        await em.persistAndFlush(comment)
        res.status(201).json({message:'Comment created', data:comment})
        
        
    } catch (error: any) {
        return res.status(500).json({message: error.message})
        
    }

}

async function remove(req: Request, res: Response) {
    try {
        const id = Number.parseInt(req.params.id)
        const comment = em.getReference(Comment, id)
        em.remove(comment)
        await em.flush()
        res.status(200).json({message:'Comment deleted'})
    } catch (error: any) {
        return res.status(500).json({message: error.message})
        
    }
}

export {findAll,findCommentsByProduct,add,remove,sanitizeCommentInput}