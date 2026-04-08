import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No se encontró token, acceso denegado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (user && user.rol === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Acceso restringido: requiere perfil de administrador' });
  }
};

export const staffOnly = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (user && (user.rol === 'admin' || user.rol === 'Empleado')) {
    next();
  } else {
    return res.status(403).json({ message: 'Acceso restringido: requiere perfil de empleado o administrador' });
  }
};
