import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from './auth.middleware';
import { signToken } from '../../config/jwt.config';

function mockRes() {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    return res;
}

describe('authMiddleware', () => {
    const next: NextFunction = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debe llamar a next y asignar req.userId con un token válido', () => {
        const token = signToken({ userId: 'user-1', email: 'test@example.com' });
        const req = { headers: { authorization: `Bearer ${token}` } } as Request;
        const res = mockRes();

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.userId).toBe('user-1');
    });

    it('debe retornar 401 cuando falta el header Authorization', () => {
        const req = { headers: {} } as Request;
        const res = mockRes();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('debe retornar 401 cuando el token es inválido', () => {
        const req = { headers: { authorization: 'Bearer invalid.token' } } as Request;
        const res = mockRes();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('debe retornar 401 cuando el header no comienza con Bearer', () => {
        const req = { headers: { authorization: 'Basic sometoken' } } as Request;
        const res = mockRes();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});
