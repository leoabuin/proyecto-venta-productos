import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Accept token from cookie (production) OR Authorization header (development fallback)
  const token = req.cookies.token || (() => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  })();

  if (!token) {
    console.warn(`[AUTH] 401 - No token found for ${req.method} ${req.originalUrl}`);
    return res.status(401).json({ message: 'No se encontró token, acceso denegado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    console.warn(`[AUTH] 401 - Invalid token for ${req.method} ${req.originalUrl}: ${error.message}`);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (user && user.rol === 'Empleado') {
    next();
  } else {
    return res.status(403).json({ message: 'Acceso restringido: requiere perfil de administrador' });
  }
};
