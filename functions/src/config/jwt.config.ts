import jwt from 'jsonwebtoken';

// Cambiar JWT_SECRET por una variable de entorno antes de subir a produccion
const JWT_SECRET = process.env.JWT_SECRET ?? 'secret-key';
const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
    userId: string;
    email: string;
}

export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
