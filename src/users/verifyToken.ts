import { NextFunction,Response } from "express";
import jwt from 'jsonwebtoken'
import { SECRET_KEY } from "./user.controler.js";


export function authenticateToken(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader && authHeader.split(' ')[1]; // Extrae el token del formato "Bearer <token>"
  const token = req.cookies.token || tokenFromHeader;

  console.log('--- VALIDANDO ACCESO ---');
  console.log('Token detectado vía:', req.cookies.token ? 'COOKIE' : (tokenFromHeader ? 'HEADER' : 'NINGUNO'));

  if (!token) {
    console.error('Error: No se encontró token en cookie ni en header. Bloqueando acceso.');
    return res.status(401).json({ message: 'No autorizado: Inicie sesión nuevamente.' });
  }

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) {
      console.error('Error al verificar JWT:', err.message);
      return res.status(403).json({ message: 'Sesión expirada o inválida.' });
    }

    req.user = user; 
    
    console.log(`Acceso concedido para: ${user.userName} (Rol: ${user.rol})`);
    next();
  });
}