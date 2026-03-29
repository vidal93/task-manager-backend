import { signToken, verifyToken, JwtPayload } from './jwt.config';

const payload: JwtPayload = { userId: 'user-1', email: 'test@example.com' };

describe('jwt.config', () => {
    describe('signToken', () => {
        it('debe retornar una cadena no vacía', () => {
            const token = signToken(payload);
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(0);
        });

        it('debe producir tokens distintos para diferentes payloads', () => {
            const token1 = signToken({ userId: 'u1', email: 'a@a.com' });
            const token2 = signToken({ userId: 'u2', email: 'b@b.com' });
            expect(token1).not.toBe(token2);
        });
    });

    describe('verifyToken', () => {
        it('debe retornar el payload original', () => {
            const token = signToken(payload);
            const decoded = verifyToken(token);
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.email).toBe(payload.email);
        });

        it('debe lanzar una excepción con un token inválido', () => {
            expect(() => verifyToken('invalid.token.here')).toThrow();
        });

        it('debe lanzar una excepción con un token manipulado', () => {
            const token = signToken(payload);
            const tampered = token.slice(0, -5) + 'XXXXX';
            expect(() => verifyToken(tampered)).toThrow();
        });
    });
});
