import { NextFunction,Response } from "express";
import jwt from 'jsonwebtoken'
import { SECRET_KEY } from "./user.controler.js";


export function authenticateToken(req: any, res: Response, next: NextFunction) {
    // 1. Intentamos obtener el token de la cookie
    const token = req.cookies.token;

    // 🚀 LOG CLAVE PARA RAILWAY: Mirá esto en la consola del dashboard de Railway
    console.log('--- VALIDANDO ACCESO ---');
    console.log('Cookie recibida:', token ? 'SI (Token presente)' : 'NO (Cookie vacía)');

    if (!token) {
        console.error('Error: No se encontró la cookie de token. Bloqueando acceso.');
        return res.status(401).json({ message: 'No autorizado: Inicie sesión nuevamente.' });
    }

    // 2. Verificamos el token con la SECRET_KEY
    jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
        if (err) {
            console.error('Error al verificar JWT:', err.message);
            // 403 si el token expiró o la firma es inválida
            return res.status(403).json({ message: 'Sesión expirada o inválida.' });
        }

        // 3. Si todo está ok, guardamos el usuario y seguimos
        req.user = user;
        console.log('Acceso concedido para el usuario:', user.userName);
        next();
    });
}