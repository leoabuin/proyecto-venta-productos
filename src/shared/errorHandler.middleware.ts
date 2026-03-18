import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error no manejado:', err);

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  // Respuesta amable en español
  res.status(status).json({
    status: 'error',
    message: message,
    // En desarrollo podemos enviar el stack si es necesario
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
