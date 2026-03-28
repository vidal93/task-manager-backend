import { Router, Request, Response } from 'express';

import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { UserFirestoreRepository } from '../../infrastructure/firestore/user.firestore.repository';

const router = Router();
const userRepository = new UserFirestoreRepository();
const loginUser = new LoginUserUseCase(userRepository);
const registerUser = new RegisterUserUseCase(userRepository);

// Buscar usuario por email — retorna token si existe
router.get('/', async (req: Request, res: Response) => {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
        res.status(400).json({ error: 'El campo email es requerido' });
        return;
    }

    try {
        const result = await loginUser.execute(email);
        if (!result) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        const { token, ...user } = result;
        res.status(200).json({ data: user, token });
    } catch {
        res.status(500).json({ error: 'Error al buscar usuario' });
    }
});

// Crear nuevo usuario — retorna token al registrarse
router.post('/', async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
        res.status(400).json({ error: 'El campo email es requerido' });
        return;
    }

    try {
        const result = await registerUser.execute(email);
        if (result === 'conflict') {
            res.status(409).json({ error: 'El usuario ya existe' });
            return;
        }
        const { token, ...user } = result;
        res.status(201).json({ data: user, token });
    } catch {
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

export default router;
