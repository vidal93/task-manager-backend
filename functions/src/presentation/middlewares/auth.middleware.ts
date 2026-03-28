import { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../../config/jwt.config';

// Agrega userId al Request de Express para usarlo en las rutas protegidas
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token de autorizacion requerido' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = verifyToken(token);
        req.userId = payload.userId;
        next();
    } catch {
        res.status(401).json({ error: 'Token invalido o expirado' });
    }
}
