import { NextFunction,Response } from "express";
import jwt from 'jsonwebtoken'
import { SECRET_KEY } from "./user.controler.js";



export function authenticateToken(req: any, res: Response, next: NextFunction) {
    const token = req.cookies.token
    console.log('Token generated:', token)
    if (!token) {
      return res.sendStatus(401)
    }
    jwt.verify(token, SECRET_KEY, (err:any, user: any) => {
      if (err) {
        return res.sendStatus(403)
      }
      req.user = user
      next()
    });
  }