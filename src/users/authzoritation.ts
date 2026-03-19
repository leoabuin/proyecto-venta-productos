import { Request,Response,NextFunction } from "express";

export function authorizeRole(role: string) {
    return (req: any, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado.' });
        }

        if (req.user.rol !== role) {
            console.error(`Acceso denegado: Se requiere rol ${role}, pero el usuario es ${req.user.rol}`);
            return res.status(403).json({ message: `Acceso denegado: Solo personal con rol ${role} puede realizar esta acción.` });
        }

        next()
    };
}