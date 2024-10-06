import { NextFunction,Response } from "express";
import jwt from 'jsonwebtoken'
import { SECRET_KEY } from "./user.controler.js";



export function authenticateToken(req: any, res: Response, next: NextFunction) {
    const token = req.cookies.token; // Obtener el token de la cookie
  
    if (!token) {
      return res.sendStatus(401) // No autorizado
    }
  
    jwt.verify(token, SECRET_KEY, (err:any, user: any) => {
      if (err) {
        return res.sendStatus(403); // Prohibido
      }
      req.user = user // Almacenar el usuario en la solicitud
      next()
    });
  }